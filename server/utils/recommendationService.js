const ItemStats = require("../models/ItemStats");
const ItemPairStats = require("../models/ItemPairStats");

/**
 * Determine cartType from itemType.
 */
function getCartType(itemType) {
  if (itemType === "MerchandiseMaster") return "MERCH";
  return "FOOD"; // FoodItemMaster, ComboMaster
}

/**
 * Update recommendation stats (ItemStats + ItemPairStats) from a completed order.
 *
 * Called from:
 *   - AdminOrderController (live, on order completion)
 *   - backfillRecommendations.js (batch, from CSV + DB orders)
 *
 * @param {Object} order - Must have { storeId?, companyId, items: [{ itemId, itemType }] }
 *   storeId is optional (CSV rows may not map to a store).
 *   companyId is required for ItemPairStats (company-wide recommendations).
 */
async function updateRecommendationStats(order) {
  const { storeId, companyId, items } = order;
  if (!items || items.length === 0 || !companyId) return;

  // Deduplicate items by itemId (same item bought multiple times in one order counts once for pairing)
  const seen = new Set();
  const uniqueItems = [];
  for (const item of items) {
    const id = item.itemId.toString();
    if (!seen.has(id)) {
      seen.add(id);
      uniqueItems.push(item);
    }
  }

  // 1. Update ItemStats (per-store popularity) — only if storeId is known
  if (storeId) {
    const statsOps = uniqueItems
      .filter(i => i.itemType !== "GiftCardMaster")
      .map(item => ({
        updateOne: {
          filter: { itemId: item.itemId, storeId },
          update: {
            $inc: { orderCount: 1 },
            $set: {
              itemType: item.itemType,
              cartType: getCartType(item.itemType),
              lastUpdated: new Date(),
            },
          },
          upsert: true,
        },
      }));

    if (statsOps.length > 0) {
      await ItemStats.bulkWrite(statsOps, { ordered: false });
    }
  }

  // 2. Update ItemPairStats (company-wide co-purchase pairs)
  // Split into FOOD and MERCH groups — we only pair within the same cartType
  const foodItems = uniqueItems.filter(i => getCartType(i.itemType) === "FOOD");
  const merchItems = uniqueItems.filter(i => getCartType(i.itemType) === "MERCH");

  const pairOps = [];

  for (const group of [foodItems, merchItems]) {
    if (group.length < 2) continue;

    const cartType = getCartType(group[0].itemType);

    // For every directed pair (A→B), increment pairCount AND anchorCount together.
    // anchorCount = total orders where A appeared (with at least one other item).
    // pairCount = total orders where A and B appeared together.
    // We increment anchorCount on every pair doc for this anchor so it stays consistent.
    for (let i = 0; i < group.length; i++) {
      const anchor = group[i];

      for (let j = 0; j < group.length; j++) {
        if (i === j) continue;
        const recommended = group[j];

        pairOps.push({
          updateOne: {
            filter: {
              anchorItemId: anchor.itemId,
              recommendedItemId: recommended.itemId,
              companyId,
            },
            update: {
              $inc: { pairCount: 1, anchorCount: 1 },
              $set: {
                anchorItemType: anchor.itemType,
                recommendedItemType: recommended.itemType,
                cartType,
                lastUpdated: new Date(),
              },
            },
            upsert: true,
          },
        });
      }
    }
  }

  if (pairOps.length > 0) {
    await ItemPairStats.bulkWrite(pairOps, { ordered: false });
  }
}

module.exports = { updateRecommendationStats };
