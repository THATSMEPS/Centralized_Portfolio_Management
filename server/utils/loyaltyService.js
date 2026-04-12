const LoyaltyRule = require("../models/LoyaltyRule");
const CustomerWallet = require("../models/CustomerWallet");
const WalletTransaction = require("../models/WalletTransaction");
const Customer = require("../models/Customer");

/**
 * Find the best matching active earning rule for an order.
 * Currently selects the first active 'by_spent' rule that matches order conditions.
 */
async function findMatchingEarnRule(order) {
    const rules = await LoyaltyRule.find({
        isActive: true,
        actionType: "by_spent",
    }).sort({ createdAt: -1 });

    const orderTotal = order.pricing?.grandTotal || 0;
    const now = new Date();

    for (const rule of rules) {
        // Check date range if set
        if (rule.startDate && now < rule.startDate) continue;
        if (rule.endDate && now > rule.endDate) continue;

        // Check order amount bounds
        if (orderTotal < rule.minOrderAmount) continue;
        if (orderTotal > rule.maxOrderAmount) continue;

        // Check applicable order types (empty = all)
        if (rule.applicableOrderTypes && rule.applicableOrderTypes.length > 0) {
            const orderFulfillmentTypes = (order.items || []).map(i => {
                if (i.fulfillmentType === "dine-in") return "dine_in";
                return i.fulfillmentType;
            });
            const hasMatch = rule.applicableOrderTypes.some(t => orderFulfillmentTypes.includes(t));
            if (!hasMatch) continue;
        }

        // Check offer conflict: if offers were applied and rule disallows it
        if (!rule.allowWithOffer && order.appliedOffers && order.appliedOffers.length > 0) {
            continue;
        }

        return rule;
    }

    return null;
}

/**
 * Called AFTER an order's payment is complete.
 * Finds best matching rule, calculates points from cash-paid amount, credits wallet.
 */
async function evaluateAndGrantPoints(order) {
    try {
        if (!order.customerId) return null;

        const rule = await findMatchingEarnRule(order);
        if (!rule) return null;

        // Calculate on the cash-paid amount (exclude loyalty-redeemed portion)
        const loyaltyRedeemed = order.pricing?.loyaltyPointsRedeemed || 0;
        const redeemRatio = rule.redeemRatio || 10;
        const loyaltyCashValue = loyaltyRedeemed / redeemRatio;
        const cashPaidAmount = Math.max(0, (order.pricing?.grandTotal || 0) - loyaltyCashValue);

        if (cashPaidAmount <= 0) return null;

        // Calculate points: cashPaidAmount / earnRatio
        const pointsEarned = Math.floor(cashPaidAmount / rule.earnRatio);
        if (pointsEarned <= 0) return null;

        const customer = await Customer.findById(order.customerId);
        if (!customer) return null;

        // Compute expiry date
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + rule.expiryDays);

        // Create credit transaction
        const transaction = await WalletTransaction.create({
            customer: order.customerId,
            phoneNumber: customer.mobileNumber,
            type: "credit",
            points: pointsEarned,
            reason: "order_earned",
            relatedOrder: order._id,
            relatedRule: rule._id,
            remainingOnThisCredit: pointsEarned,
            expiresAt,
            note: `Earned from Order #${order.orderNumber}`,
        });

        // Update wallet
        await CustomerWallet.findOneAndUpdate(
            { customer: order.customerId },
            {
                $inc: { totalEarned: pointsEarned, remainingBalance: pointsEarned },
                $setOnInsert: { phoneNumber: customer.mobileNumber },
            },
            { upsert: true, new: true }
        );

        // Also update the legacy walletPoints field on Customer
        await Customer.findByIdAndUpdate(order.customerId, {
            $inc: { walletPoints: pointsEarned },
        });

        console.log(`[Loyalty] Granted ${pointsEarned} points to customer ${customer.mobileNumber} for Order #${order.orderNumber}`);
        return transaction;
    } catch (error) {
        console.error("[Loyalty] Error granting points:", error.message);
        return null;
    }
}

/**
 * Redeem points using FIFO logic — deduct from oldest unexpired credits first.
 */
async function redeemPoints(customerId, pointsToRedeem, orderId) {
    const customer = await Customer.findById(customerId);
    if (!customer) throw new Error("Customer not found");

    const wallet = await CustomerWallet.findOne({ customer: customerId });
    if (!wallet || wallet.remainingBalance < pointsToRedeem) {
        throw new Error("Insufficient point balance");
    }

    // FIFO: get oldest unexpired credit batches with remaining > 0
    const creditBatches = await WalletTransaction.find({
        customer: customerId,
        type: "credit",
        remainingOnThisCredit: { $gt: 0 },
        $or: [
            { expiresAt: { $gt: new Date() } },
            { expiresAt: null },
        ],
    }).sort({ createdAt: 1 }); // oldest first

    let remaining = pointsToRedeem;

    for (const batch of creditBatches) {
        if (remaining <= 0) break;

        const deductFromBatch = Math.min(remaining, batch.remainingOnThisCredit);
        batch.remainingOnThisCredit -= deductFromBatch;
        await batch.save();
        remaining -= deductFromBatch;
    }

    if (remaining > 0) {
        throw new Error("Could not fully deduct points via FIFO — data inconsistency");
    }

    // Create debit transaction
    const debitTransaction = await WalletTransaction.create({
        customer: customerId,
        phoneNumber: customer.mobileNumber,
        type: "debit",
        points: pointsToRedeem,
        reason: "order_redeemed",
        relatedOrder: orderId,
        note: `Redeemed on order`,
    });

    // Update wallet
    await CustomerWallet.findOneAndUpdate(
        { customer: customerId },
        { $inc: { totalUsed: pointsToRedeem, remainingBalance: -pointsToRedeem } }
    );

    // Update legacy walletPoints on Customer
    await Customer.findByIdAndUpdate(customerId, {
        $inc: { walletPoints: -pointsToRedeem },
    });

    console.log(`[Loyalty] Redeemed ${pointsToRedeem} points for customer ${customer.mobileNumber}`);
    return debitTransaction;
}

/**
 * Daily cron job: expire old points.
 * Finds all credit transactions where expiresAt < now and remainingOnThisCredit > 0.
 */
async function expireOldPoints() {
    try {
        const now = new Date();
        const expiredCredits = await WalletTransaction.find({
            type: "credit",
            expiresAt: { $lt: now },
            remainingOnThisCredit: { $gt: 0 },
        });

        let totalExpired = 0;

        for (const credit of expiredCredits) {
            const pointsToExpire = credit.remainingOnThisCredit;

            // Create debit transaction for expiry
            await WalletTransaction.create({
                customer: credit.customer,
                phoneNumber: credit.phoneNumber,
                type: "debit",
                points: pointsToExpire,
                reason: "expired",
                relatedRule: credit.relatedRule,
                note: `Points expired (earned on ${credit.createdAt.toISOString().split("T")[0]})`,
            });

            // Zero out the remaining on this credit
            credit.remainingOnThisCredit = 0;
            await credit.save();

            // Update wallet
            await CustomerWallet.findOneAndUpdate(
                { customer: credit.customer },
                { $inc: { totalExpired: pointsToExpire, remainingBalance: -pointsToExpire } }
            );

            // Update legacy walletPoints on Customer
            await Customer.findByIdAndUpdate(credit.customer, {
                $inc: { walletPoints: -pointsToExpire },
            });

            totalExpired += pointsToExpire;
        }

        if (totalExpired > 0) {
            console.log(`[Loyalty Cron] Expired ${totalExpired} points across ${expiredCredits.length} transactions`);
        }

        return { expiredTransactions: expiredCredits.length, totalPointsExpired: totalExpired };
    } catch (error) {
        console.error("[Loyalty Cron] Error expiring points:", error.message);
        return { error: error.message };
    }
}

/**
 * Reverse points when an order is cancelled/refunded.
 */
async function reversePointsForOrder(orderId) {
    try {
        // Find points EARNED on this order → debit them back
        const earnedTx = await WalletTransaction.findOne({
            relatedOrder: orderId,
            type: "credit",
            reason: "order_earned",
        });

        if (earnedTx) {
            const pointsToRemove = earnedTx.points;
            const customer = await Customer.findById(earnedTx.customer);

            // Create debit to reverse the earned points
            await WalletTransaction.create({
                customer: earnedTx.customer,
                phoneNumber: earnedTx.phoneNumber,
                type: "debit",
                points: pointsToRemove,
                reason: "order_refund_debit",
                relatedOrder: orderId,
                note: `Points reversed for cancelled order`,
            });

            // Zero out remaining on the original credit
            earnedTx.remainingOnThisCredit = 0;
            await earnedTx.save();

            // Update wallet
            await CustomerWallet.findOneAndUpdate(
                { customer: earnedTx.customer },
                { $inc: { totalEarned: -pointsToRemove, remainingBalance: -pointsToRemove } }
            );

            await Customer.findByIdAndUpdate(earnedTx.customer, {
                $inc: { walletPoints: -pointsToRemove },
            });

            console.log(`[Loyalty] Reversed ${pointsToRemove} earned points for order ${orderId}`);
        }

        // Find points REDEEMED on this order → credit them back
        const redeemedTx = await WalletTransaction.findOne({
            relatedOrder: orderId,
            type: "debit",
            reason: "order_redeemed",
        });

        if (redeemedTx) {
            const pointsToReturn = redeemedTx.points;

            // Find the active earn rule for expiry days (use 90 as default)
            const activeRule = await LoyaltyRule.findOne({ isActive: true, actionType: "by_spent" });
            const expiryDays = activeRule?.expiryDays || 90;
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + expiryDays);

            // Create credit to return the redeemed points
            await WalletTransaction.create({
                customer: redeemedTx.customer,
                phoneNumber: redeemedTx.phoneNumber,
                type: "credit",
                points: pointsToReturn,
                reason: "order_refund_credit",
                relatedOrder: orderId,
                remainingOnThisCredit: pointsToReturn,
                expiresAt,
                note: `Points returned for cancelled order`,
            });

            // Update wallet
            await CustomerWallet.findOneAndUpdate(
                { customer: redeemedTx.customer },
                { $inc: { totalUsed: -pointsToReturn, remainingBalance: pointsToReturn } }
            );

            await Customer.findByIdAndUpdate(redeemedTx.customer, {
                $inc: { walletPoints: pointsToReturn },
            });

            console.log(`[Loyalty] Returned ${pointsToReturn} redeemed points for order ${orderId}`);
        }
    } catch (error) {
        console.error("[Loyalty] Error reversing points for order:", error.message);
    }
}

/**
 * Get wallet info + cash value equivalent for a customer.
 */
async function getWalletInfo(customerId) {
    let wallet = await CustomerWallet.findOne({ customer: customerId });

    if (!wallet) {
        // Auto-create if missing
        const customer = await Customer.findById(customerId);
        if (!customer) return null;

        wallet = await CustomerWallet.create({
            customer: customerId,
            phoneNumber: customer.mobileNumber,
        });
    }

    // Get active rule to compute cash value
    const activeRule = await LoyaltyRule.findOne({ isActive: true, actionType: "by_spent" });
    const redeemRatio = activeRule?.redeemRatio || 10;
    const earnRatio = activeRule?.earnRatio || 100;
    const cashValue = wallet.remainingBalance / redeemRatio;

    // Get soonest expiring points
    const soonestExpiry = await WalletTransaction.findOne({
        customer: customerId,
        type: "credit",
        remainingOnThisCredit: { $gt: 0 },
        expiresAt: { $gt: new Date() },
    }).sort({ expiresAt: 1 });

    return {
        wallet,
        cashValue: Math.round(cashValue * 100) / 100,
        redeemRatio,
        earnRatio,
        expiringNext: soonestExpiry
            ? {
                points: soonestExpiry.remainingOnThisCredit,
                expiresAt: soonestExpiry.expiresAt,
            }
            : null,
    };
}

/**
 * Get paginated transaction history for a customer.
 */
async function getTransactionHistory(customerId, page = 1, limit = 20) {
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 50);

    const transactions = await WalletTransaction.find({ customer: customerId })
        .populate("relatedOrder", "orderNumber")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean();

    const total = await WalletTransaction.countDocuments({ customer: customerId });

    return {
        transactions,
        pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(total / limitNum),
            totalTransactions: total,
            hasNextPage: pageNum < Math.ceil(total / limitNum),
            hasPrevPage: pageNum > 1,
        },
    };
}

/**
 * Validate whether a redemption request is valid.
 * Returns { isValid, maxRedeemablePoints, maxRedeemableCash, reason }.
 */
async function validateRedemption(customerId, pointsToRedeem, orderTotal, appliedOfferId) {
    const wallet = await CustomerWallet.findOne({ customer: customerId });

    if (!wallet || wallet.remainingBalance <= 0) {
        return {
            isValid: false,
            maxRedeemablePoints: 0,
            maxRedeemableCash: 0,
            reason: "No points available",
        };
    }

    const activeRule = await LoyaltyRule.findOne({ isActive: true, actionType: "by_spent" });
    if (!activeRule) {
        return {
            isValid: false,
            maxRedeemablePoints: 0,
            maxRedeemableCash: 0,
            reason: "No active loyalty rule configured",
        };
    }

    const redeemRatio = activeRule.redeemRatio;

    // Check offer conflict
    if (appliedOfferId && !activeRule.allowWithOffer) {
        return {
            isValid: false,
            maxRedeemablePoints: 0,
            maxRedeemableCash: 0,
            reason: "Loyalty points cannot be used with the applied offer",
        };
    }

    // Check minimum order amount
    if (orderTotal < activeRule.minOrderAmount) {
        return {
            isValid: false,
            maxRedeemablePoints: 0,
            maxRedeemableCash: 0,
            reason: `Minimum order amount of ₹${activeRule.minOrderAmount} required`,
        };
    }

    // Calculate max redeemable based on rules
    let maxCash = orderTotal; // Start with full order

    // Apply max % limit
    if (activeRule.maxRedeemPercentPerOrder > 0) {
        const percentCap = (orderTotal * activeRule.maxRedeemPercentPerOrder) / 100;
        maxCash = Math.min(maxCash, percentCap);
    }

    // Apply absolute cap
    if (activeRule.maxRedeemAmountPerOrder > 0) {
        maxCash = Math.min(maxCash, activeRule.maxRedeemAmountPerOrder);
    }

    // Convert cash cap to points
    let maxPoints = Math.floor(maxCash * redeemRatio);

    // Cap by available balance
    maxPoints = Math.min(maxPoints, wallet.remainingBalance);

    // Apply minimum points requirement
    if (activeRule.minRedeemPoints > 0 && maxPoints < activeRule.minRedeemPoints) {
        return {
            isValid: false,
            maxRedeemablePoints: 0,
            maxRedeemableCash: 0,
            reason: `Minimum ${activeRule.minRedeemPoints} points required to redeem`,
        };
    }

    // Validate the specific requested amount
    if (pointsToRedeem > 0) {
        if (pointsToRedeem > wallet.remainingBalance) {
            return {
                isValid: false,
                maxRedeemablePoints: maxPoints,
                maxRedeemableCash: Math.round((maxPoints / redeemRatio) * 100) / 100,
                reason: "Insufficient point balance",
            };
        }

        if (pointsToRedeem > maxPoints) {
            return {
                isValid: false,
                maxRedeemablePoints: maxPoints,
                maxRedeemableCash: Math.round((maxPoints / redeemRatio) * 100) / 100,
                reason: `Maximum ${maxPoints} points can be redeemed on this order`,
            };
        }

        if (activeRule.minRedeemPoints > 0 && pointsToRedeem < activeRule.minRedeemPoints) {
            return {
                isValid: false,
                maxRedeemablePoints: maxPoints,
                maxRedeemableCash: Math.round((maxPoints / redeemRatio) * 100) / 100,
                reason: `Minimum ${activeRule.minRedeemPoints} points required to redeem`,
            };
        }
    }

    return {
        isValid: true,
        maxRedeemablePoints: maxPoints,
        maxRedeemableCash: Math.round((maxPoints / redeemRatio) * 100) / 100,
        redeemRatio,
        reason: null,
    };
}

module.exports = {
    evaluateAndGrantPoints,
    redeemPoints,
    expireOldPoints,
    reversePointsForOrder,
    getWalletInfo,
    getTransactionHistory,
    validateRedemption,
};
