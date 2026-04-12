const OfferMaster = require("../models/OfferMaster");
const OfferUsage = require("../models/OfferUsage");

// ─── Helpers ─────────────────────────────────────────────────────────────────

function roundTo2(value) {
    return Math.round(value * 100) / 100;
}

function itemMatchesOffer(
    item,
    offerCategories,
    offerItems,
    offerSubCategories = [],
) {
    const itemId = (item._id || item.itemId || "").toString();
    const categoryId = (item.categoryId?._id || item.categoryId || "").toString();
    const subCats = item.subCategoryIds || [];

    const hasCatConfig = offerCategories && offerCategories.length > 0;
    const hasSubCatConfig = offerSubCategories && offerSubCategories.length > 0;
    const hasItemConfig = offerItems && offerItems.length > 0;

    // If no specific configs exist, it matches everything
    if (!hasCatConfig && !hasSubCatConfig && !hasItemConfig) return true;

    const catMatch = hasCatConfig && categoryId && offerCategories.includes(categoryId);
    const subCatMatch = hasSubCatConfig && subCats.some((id) => offerSubCategories.includes(id.toString()));
    const itemMatch = hasItemConfig && offerItems.includes(itemId);

    return catMatch || subCatMatch || itemMatch;
}

/**
 * Batch-load per-customer usage counts for a list of offer IDs.
 * @param {String} customerId
 * @param {Array}  offerIds - array of ObjectId or string
 * @returns {Object} Map of offerIdString → usageCount
 */
async function getCustomerUsageMap(customerId, offerIds) {
    if (!customerId || !offerIds || offerIds.length === 0) return {};
    const records = await OfferUsage.find({
        customerId,
        offerId: { $in: offerIds },
    })
        .select("offerId usageCount")
        .lean();
    const map = {};
    for (const rec of records) {
        map[rec.offerId.toString()] = rec.usageCount;
    }
    return map;
}

/**
 * Check if an offer has exceeded per-customer usage limit.
 * @returns {boolean} true if the offer is BLOCKED (limit exceeded)
 */
function isPerCustomerLimitExceeded(offer, usageMap) {
    if (!offer.usageLimitPerCustomer || offer.usageLimitPerCustomer <= 0)
        return false;
    const used = usageMap[offer._id.toString()] || 0;
    return used >= offer.usageLimitPerCustomer;
}

// ─── PRODUCT_DISCOUNT: Calculate offer prices for menu items ─────────────────

/**
 * @param {Array}  foodItems - Items with _id, categoryId, price
 * @param {String} companyId
 * @param {Object} ctx       - { customerId } (optional, for per-customer limits)
 * @returns {Object} Map of itemId → offerDetails
 */
async function calculateOfferPrices(foodItems, companyId, ctx = {}) {
    const now = new Date();
    const offerMap = {};

    try {
        const allOffers = await OfferMaster.find({
            companyId,
            isActive: true,
            offerType: { $in: ["PRODUCT_DISCOUNT", "COMBO_OFFER", "BUY_X_GET_Y"] },
        }).sort({ priority: -1 });

        const activeOffers = allOffers.filter((offer) =>
            OfferMaster.isOfferActiveNow(offer, now),
        );

        // Load per-customer usage in one query
        const usageMap = ctx.customerId
            ? await getCustomerUsageMap(
                ctx.customerId,
                activeOffers.map((o) => o._id),
            )
            : {};

        for (const item of foodItems) {
            const itemId = (item._id || item.itemId || "").toString();
            const originalPrice = item.price || 0;
            const appliedOffers = [];
            let runningPrice = originalPrice;
            let blocked = false;

            for (const offer of activeOffers) {
                if (blocked) break;

                // Use unified eligibility check (handles usage, minOrderValue, store, platform, appliedIds etc)
                if (!OfferMaster.isOfferEligibleForCart(offer, ctx)) continue;

                // Per-customer usage limit (not handled by static isOfferEligibleForCart yet)
                if (ctx.customerId && isPerCustomerLimitExceeded(offer, usageMap))
                    continue;

                let isMatch = false;
                let offerDiscountValue = 0;
                let offerDiscountType = "PERCENTAGE";

                if (offer.offerType === "BUY_X_GET_Y") {
                    const bxy = offer.buyXGetY;
                    if (
                        bxy &&
                        itemMatchesOffer(
                            item,
                            bxy.xCategories,
                            bxy.xItems,
                            bxy.xSubCategories,
                        )
                    ) {
                        // Flag item as BOGO eligible for UI discovery seamlessly
                        if (!offerMap[itemId])
                            offerMap[itemId] = { originalPrice, appliedOfferIds: [] };
                        offerMap[itemId].isBogoEligible = true;
                        offerMap[itemId].bogoTitle = offer.offerName;
                        offerMap[itemId].bogoDescription =
                            offer.description ||
                            `Buy ${bxy.xQuantity} get ${bxy.yQuantity} free!`;
                        offerMap[itemId].bogoExpectedYQty = bxy.yQuantity || 1;
                        offerMap[itemId].bogoOfferData = {
                            offerId: offer._id,
                            offerName: offer.offerName,
                            offerType: offer.offerType,
                            buyXGetY: offer.buyXGetY,
                        };
                    }
                    continue; // Skip the rest of price calculations for BOGO here
                }

                if (offer.offerType === "COMBO_OFFER") {
                    if (offer.comboOffer && itemId === offer.comboOffer.itemId) {
                        isMatch = true;
                        offerDiscountValue = offer.comboOffer.discountValue;
                        offerDiscountType = offer.comboOffer.discountType || "PERCENTAGE";
                    }
                } else {
                    if (
                        itemMatchesOffer(
                            item,
                            offer.categories,
                            offer.foodItems,
                            offer.subCategories,
                        )
                    ) {
                        isMatch = true;
                        offerDiscountValue = offer.discountValue;
                        offerDiscountType = offer.discountType || "PERCENTAGE";
                    }
                }

                if (!isMatch) continue;

                let discount = 0;
                if (offerDiscountType === "FLAT") {
                    discount = offerDiscountValue;
                } else {
                    discount = roundTo2((runningPrice * offerDiscountValue) / 100);
                }

                if (offer.maxDiscountValue > 0 && discount > offer.maxDiscountValue) {
                    discount = offer.maxDiscountValue;
                }

                runningPrice = roundTo2(runningPrice - discount);
                if (runningPrice < 0) runningPrice = 0;

                appliedOffers.push({
                    offerId: offer._id,
                    offerName: offer.offerName,
                    discountValue: offerDiscountValue,
                    discountType: offerDiscountType,
                    discountAmount: discount,
                });

                // SINGLE mode blocks further stacking on this item
                if (offer.offerMode === "SINGLE") {
                    blocked = true;
                }
            }

            if (appliedOffers.length > 0) {
                const totalDiscount = roundTo2(originalPrice - runningPrice);
                const combinedPct =
                    originalPrice > 0
                        ? roundTo2((totalDiscount / originalPrice) * 100)
                        : 0;
                // We default combined representational value to percentage if mapped uniquely, but for mixed we just represent the effective drop out of 100
                const exactDiscountValue =
                    appliedOffers.length === 1
                        ? appliedOffers[0].discountValue
                        : combinedPct;
                const exactDiscountType =
                    appliedOffers.length === 1
                        ? appliedOffers[0].discountType
                        : "PERCENTAGE";

                const bogoData =
                    offerMap[itemId] && offerMap[itemId].isBogoEligible
                        ? offerMap[itemId]
                        : {};

                offerMap[itemId] = {
                    ...bogoData,
                    offerId: appliedOffers[0].offerId,
                    offerName:
                        appliedOffers.length === 1
                            ? appliedOffers[0].offerName
                            : appliedOffers.map((o) => o.offerName).join(" + "),
                    discountValue: exactDiscountValue,
                    discountType: exactDiscountType,
                    originalPrice,
                    offerPrice: runningPrice,
                    hasActiveOffer: true,
                    appliedOfferIds: [
                        ...(bogoData.appliedOfferIds || []),
                        ...appliedOffers.map((o) => o.offerId),
                    ],
                };
            }
        }

        return offerMap;
    } catch (err) {
        console.error("calculateOfferPrices error =>", err);
        return {};
    }
}

// ─── PRODUCT_DISCOUNT: Attach to single and multiple menu items ───────────────

/**
 * @param {Object} item - Single food item
 * @param {String} companyId
 */
async function attachOfferToItem(item, companyId) {
    const offerMap = await calculateOfferPrices([item], companyId);
    const itemId = (item._id || "").toString();
    const itemObj = item.toObject ? item.toObject() : item;

    return offerMap[itemId]
        ? { ...itemObj, ...offerMap[itemId] }
        : { ...itemObj, hasActiveOffer: false };
}

/**
 * @param {Array} items - Food item array
 * @param {String} companyId
 */
async function attachOffersToItems(items, companyId) {
    const offerMap = await calculateOfferPrices(items, companyId);
    return items.map((item) => {
        const itemId = (item._id || "").toString();
        const itemObj = item.toObject ? item.toObject() : item;
        return offerMap[itemId]
            ? { ...itemObj, ...offerMap[itemId] }
            : { ...itemObj, hasActiveOffer: false };
    });
}

// ─── BUY_X_GET_Y: Cart-level Engine ──────────────────────────────────────────

/**
 * Identify qualifying X items from cart for a BUY_X_GET_Y offer.
 * Returns an array of cart items that meet the X condition.
 */
const OFFER_ELIGIBLE_ITEM_TYPES = [
    "FoodItemMaster",
    "MerchandiseMaster",
    "ComboMaster",
];

function findQualifyingXItems(cartItems, offer) {
    const bxy = offer.buyXGetY;
    if (!bxy) return [];

    const matchingItems = cartItems.filter((item) => {
        // Double-Dipping Lockout: If the offer strictly allows single mode, prevent already discounted items from acting as X trigger
        if (offer.offerMode === "SINGLE" && item.hasActiveOffer === true)
            return false;

        return (
            OFFER_ELIGIBLE_ITEM_TYPES.includes(item.itemType) &&
            itemMatchesOffer(
                {
                    _id: item.itemId,
                    categoryId: item.categoryId,
                    subCategoryIds: item.subCategoryIds,
                },
                bxy.xCategories,
                bxy.xItems,
                bxy.xSubCategories,
            )
        );
    });

    // Sum quantities — must meet xQuantity threshold
    const totalQty = matchingItems.reduce(
        (sum, ci) => sum + (ci.quantity || 1),
        0,
    );
    if (totalQty < bxy.xQuantity) return [];

    return matchingItems;
}

/**
 * Identify eligible Y items from cart for a BUY_X_GET_Y reward.
 */
function findEligibleYItems(cartItems, offer) {
    const bxy = offer.buyXGetY;
    if (!bxy) return [];
    return cartItems.filter(
        (item) =>
            OFFER_ELIGIBLE_ITEM_TYPES.includes(item.itemType) &&
            itemMatchesOffer(
                {
                    _id: item.itemId,
                    categoryId: item.categoryId,
                    subCategoryIds: item.subCategoryIds,
                },
                bxy.yCategories,
                bxy.yItems,
                bxy.ySubCategories,
            ),
    );
}

/**
 * Helper to flatten cart items for accurate BOGO unit scaling preventing grouped cart exploit.
 */
function flattenCartItemsForBogo(cartItems) {
    const flattened = [];
    for (const item of cartItems) {
        const qty = item.quantity || 1;
        for (let i = 0; i < qty; i++) {
            flattened.push({ ...item, quantity: 1 });
        }
    }
    return flattened;
}

/**
 * Calculate discount amount for a Y item based on applicableOn rule using purely flattened items natively.
 * @returns {number} discount amount
 */
function calcYDiscount(yItems, bxy, maxRewards) {
    if (!yItems.length || maxRewards <= 0) return 0;

    let targetItems = [...yItems];

    if (bxy.applicableOn === "MIN_PRICE") {
        targetItems.sort((a, b) => a.basePrice - b.basePrice);
    } else if (bxy.applicableOn === "MAX_PRICE") {
        targetItems.sort((a, b) => b.basePrice - a.basePrice);
    }

    // Process correctly slicing based on real unit equivalents instead of arrays of mixed grouped quantities
    targetItems = targetItems.slice(0, maxRewards);

    let discountTotal = 0;
    for (const item of targetItems) {
        const price = item.basePrice || 0;
        const qty = item.quantity || 1; // Always 1 if flattened, safety fallback used
        if (bxy.discountType === "FREE" || bxy.discountValue >= 100) {
            discountTotal += price * qty;
        } else if (bxy.discountType === "PERCENTAGE") {
            discountTotal += roundTo2((price * bxy.discountValue) / 100) * qty;
        } else if (bxy.discountType === "FLAT") {
            discountTotal += Math.min(bxy.discountValue, price) * qty;
        }
    }
    return roundTo2(discountTotal);
}

/**
 * Resolve all BUY_X_GET_Y offers for a cart.
 * Returns appliedBxyOffers array describing each applied offer.
 */
async function resolveBuyXGetYOffers(cartItems, companyId, ctx = {}) {
    const now = new Date();
    const allOffers = await OfferMaster.find({
        companyId,
        isActive: true,
        offerType: "BUY_X_GET_Y",
    }).sort({ priority: -1 });

    const eligibleOffers = allOffers.filter((offer) =>
        OfferMaster.isOfferEligibleForCart(offer, ctx),
    );

    // Load per-customer usage in one query
    const usageMap = ctx.customerId
        ? await getCustomerUsageMap(
            ctx.customerId,
            eligibleOffers.map((o) => o._id),
        )
        : {};

    const appliedBxyOffers = [];

    for (const offer of eligibleOffers) {
        // Skip if per-customer limit exceeded
        if (ctx.customerId && isPerCustomerLimitExceeded(offer, usageMap)) continue;

        const xItems = findQualifyingXItems(cartItems, offer);
        const totalXQty = xItems.reduce((sum, ci) => sum + (ci.quantity || 1), 0);
        const requiredXQty = offer.buyXGetY.xQuantity || 1;

        if (totalXQty < requiredXQty) continue;

        const multiplier = Math.floor(totalXQty / requiredXQty);
        let maxRewards = multiplier * (offer.buyXGetY.yQuantity || 1);

        const yItems = findEligibleYItems(cartItems, offer);
        const flatYItems = flattenCartItemsForBogo(yItems);

        if (!flatYItems.length) continue;

        let discountAmount = calcYDiscount(flatYItems, offer.buyXGetY, maxRewards);

        console.log(`BOGO Check: offerId=${offer._id}, xItems=${xItems.length}, flatYItems=${flatYItems.length}, discountAmount=${discountAmount}`);

        if (offer.maxDiscountValue > 0 && discountAmount > offer.maxDiscountValue) {
            discountAmount = offer.maxDiscountValue;
        }

        if (discountAmount <= 0) {
            console.log(`BOGO Check Failed: discountAmount evaluating to <= 0.`);
            continue;
        }

        console.log(`BOGO Check Pass: Applying discount ${discountAmount}`);

        appliedBxyOffers.push({
            offerId: offer._id,
            offerName: offer.offerName,
            offerType: "BUY_X_GET_Y",
            discountAmount,
            xItemIds: xItems.map((i) => i.itemId.toString()),
            yItemIds: flatYItems.slice(0, maxRewards).map((i) => i.itemId.toString()),
        });

        // SINGLE mode: stop at first match
        if (offer.offerMode === "SINGLE") break;
    }

    return appliedBxyOffers;
}

// ─── Cart Recalculation (Both Types) ─────────────────────────────────────────

/**
 * Recalculate cart items with current offers.
 * @param {Array}  cartItems - Cart item objects
 * @param {String} companyId
 * @param {Object} ctx       - { cartTotal, storeId, orderType, platform, customerOrderCount, customerId, customerType }
 * @returns {{ items: Array, appliedOffers: Array, bxyDiscountTotal: number }}
 */
async function recalculateCartWithOffers(cartItems, companyId, ctx = {}) {
    if (!cartItems || cartItems.length === 0) {
        return { items: [], appliedOffers: [], bxyDiscountTotal: 0 };
    }

    try {
        // ── PRODUCT_DISCOUNT on item base prices ──────────────────────────────
        const eligibleItemsForCalc = cartItems
            .filter((item) => OFFER_ELIGIBLE_ITEM_TYPES.includes(item.itemType))
            .map((item) => ({
                _id: item.itemId,
                categoryId: item.categoryId,
                subCategoryIds: item.subCategoryIds,
                price: item.basePrice,
            }));

        // Initial subtotal for eligibility checks
        const initialSubtotal = cartItems.reduce(
            (sum, i) => sum + i.basePrice * (i.quantity || 1),
            0,
        );
        const initialCtx = { cartTotal: initialSubtotal, ...ctx };

        const offerMap = eligibleItemsForCalc.length
            ? await calculateOfferPrices(eligibleItemsForCalc, companyId, initialCtx)
            : {};

        const updatedItems = cartItems.map((item) => {
            const addOnsTotal = (item.addOns || []).reduce(
                (sum, a) => sum + (a.price || 0),
                0,
            );
            const itemId = (item.itemId || "").toString();

            if (
                OFFER_ELIGIBLE_ITEM_TYPES.includes(item.itemType) &&
                offerMap[itemId]
            ) {
                const offer = offerMap[itemId];

                if (!offer.discountValue && offer.isBogoEligible) {
                    const effectivePrice = roundTo2(item.basePrice + addOnsTotal);
                    return {
                        ...item,
                        price: effectivePrice,
                        hasActiveOffer: false,
                        isBogoEligible: true,
                        bogoTitle: offer.bogoTitle,
                        bogoDescription: offer.bogoDescription,
                        bogoExpectedYQty: offer.bogoExpectedYQty,
                        bogoOfferData: offer.bogoOfferData,
                        itemTotal: roundTo2(effectivePrice * (item.quantity || 1)),
                    };
                }

                const effectivePrice = roundTo2(offer.offerPrice + addOnsTotal);
                return {
                    ...item,
                    originalPrice: item.basePrice,
                    offerPrice: offer.offerPrice,
                    price: effectivePrice,
                    hasActiveOffer: true,
                    offerId: offer.offerId,
                    offerName: offer.offerName,
                    discountValue: offer.discountValue,
                    discountType: offer.discountType,
                    appliedOfferIds: offer.appliedOfferIds || [offer.offerId],
                    isBogoEligible: offer.isBogoEligible || false,
                    bogoTitle: offer.bogoTitle,
                    bogoDescription: offer.bogoDescription,
                    bogoExpectedYQty: offer.bogoExpectedYQty,
                    bogoOfferData: offer.bogoOfferData,
                    itemTotal: roundTo2(effectivePrice * (item.quantity || 1)),
                };
            }

            const effectivePrice = roundTo2(item.basePrice + addOnsTotal);
            return {
                ...item,
                price: effectivePrice,
                hasActiveOffer: false,
                itemTotal: roundTo2(effectivePrice * (item.quantity || 1)),
            };
        });

        // ── BUY_X_GET_Y cart-level offers ─────────────────────────────────────
        const subtotalForCtx = updatedItems.reduce(
            (sum, i) => sum + (i.itemTotal || 0),
            0,
        );
        const enrichedCtx = { ...ctx, cartTotal: ctx.cartTotal || subtotalForCtx };

        const appliedBxyOffers = await resolveBuyXGetYOffers(
            updatedItems,
            companyId,
            enrichedCtx,
        );
        const bxyDiscountTotal = appliedBxyOffers.reduce(
            (sum, o) => sum + o.discountAmount,
            0,
        );

        // Map the BOGO discounts directly to the respective Y items so the frontend can render strikeout pricing visually
        appliedBxyOffers.forEach((bxyOffer) => {
            const applicableYIds = bxyOffer.yItemIds || [];
            let remainingDiscount = bxyOffer.discountAmount;

            applicableYIds.forEach((yId) => {
                if (remainingDiscount <= 0) return;

                const yItem = updatedItems.find(i => (i.itemId || i._id).toString() === yId && i.hasActiveOffer === false);
                if (yItem) {
                    const availableDiscountOnUnit = Math.min(yItem.price, remainingDiscount);
                    yItem.originalPrice = yItem.price;
                    yItem.price = roundTo2(yItem.price - availableDiscountOnUnit);
                    yItem.offerPrice = yItem.price;
                    yItem.hasActiveOffer = true;
                    yItem.offerId = bxyOffer.offerId;
                    yItem.offerName = bxyOffer.offerName;
                    yItem.discountType = "BOGO";
                    // Leave yItem.itemTotal untouched so the frontend's cart-wide `subtotal` sum respects the gross item value and doesn't double-deduct from `bxyDiscountAmount`.
                    remainingDiscount -= availableDiscountOnUnit;
                }
            });
        });

        return {
            items: updatedItems,
            appliedOffers: appliedBxyOffers,
            bxyDiscountTotal: roundTo2(bxyDiscountTotal),
        };
    } catch (err) {
        console.error("recalculateCartWithOffers error =>", err);
        return {
            items: cartItems.map((item) => ({ ...item, hasActiveOffer: false })),
            appliedOffers: [],
            bxyDiscountTotal: 0,
        };
    }
}

/**
 * Record offer usage after successful order placement.
 * Increments both global usageCount on OfferMaster and per-customer OfferUsage.
 * @param {String} customerId
 * @param {Array}  appliedOffers - [{ offerId, ... }]
 * @param {Array}  itemOfferIds  - array of PRODUCT_DISCOUNT offer IDs applied to items
 */
async function recordOfferUsage(
    customerId,
    appliedOffers = [],
    itemOfferIds = [],
) {
    // Collect all unique offer IDs from both BXY offers and item-level product discounts
    const allOfferIds = new Set();
    for (const ao of appliedOffers) {
        if (ao.offerId) allOfferIds.add(ao.offerId.toString());
    }
    for (const id of itemOfferIds) {
        if (id) allOfferIds.add(id.toString());
    }

    if (allOfferIds.size === 0) return;

    const ops = [];
    for (const offerId of allOfferIds) {
        // Increment global usageCount on OfferMaster
        ops.push(
            OfferMaster.updateOne({ _id: offerId }, { $inc: { usageCount: 1 } }),
        );

        // Upsert per-customer usage record
        if (customerId) {
            ops.push(
                OfferUsage.updateOne(
                    { offerId, customerId },
                    { $inc: { usageCount: 1 }, $set: { lastUsedAt: new Date() } },
                    { upsert: true },
                ),
            );
        }
    }

    await Promise.all(ops);
}

module.exports = {
    calculateOfferPrices,
    attachOfferToItem,
    attachOffersToItems,
    recalculateCartWithOffers,
    resolveBuyXGetYOffers,
    recordOfferUsage,
    findQualifyingXItems,
    findEligibleYItems,
};
