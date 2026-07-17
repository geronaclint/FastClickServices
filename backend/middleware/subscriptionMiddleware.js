// Subscription tier hierarchy for enforcement
// Higher index = higher tier
const BUYER_TIERS = ["Free", "Premium", "Enterprise"];
const SELLER_TIERS = ["Free", "Professional", "Enterprise"];

// Priority levels allowed per subscription tier
const PRIORITY_RULES = {
  Free: ["Low", "Normal"],
  Premium: ["Low", "Normal", "High"],
  Professional: ["Low", "Normal", "High"],
  Enterprise: ["Low", "Normal", "High", "Urgent"],
};

/**
 * Returns numeric tier level for a given subscription plan.
 * Falls back to 0 (Free) for unrecognized plans.
 */
function getTierLevel(subscription, isSeller) {
  const tiers = isSeller ? SELLER_TIERS : BUYER_TIERS;
  const idx = tiers.indexOf(subscription);
  return idx >= 0 ? idx : 0;
}

/**
 * Middleware factory: requires the authenticated user to have at
 * least `minTier` subscription (e.g. "Professional").
 *
 * Usage: router.get("/some-premium-route", protect, requireSubscription("Professional"), handler);
 */
export function requireSubscription(minTier) {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const isSeller =
      user.role === "provider" ||
      user.role === "admin" ||
      user.role === "seller";

    const currentSubscription = user.subscription || "Free";
    const currentLevel = getTierLevel(currentSubscription, isSeller);
    const requiredLevel = getTierLevel(minTier, isSeller);

    if (currentLevel < requiredLevel) {
      return res.status(403).json({
        success: false,
        message: `This feature requires at least the ${minTier} plan. Your current plan is ${currentSubscription}.`,
      });
    }

    next();
  };
}

/**
 * Returns the allowed priority list for a given subscription.
 */
export function getAllowedPriorities(subscription) {
  return PRIORITY_RULES[subscription] || PRIORITY_RULES["Free"];
}

/**
 * Validates that the requested priority is allowed for the user's subscription.
 * Returns { valid: false, allowed: [...] } or { valid: true }.
 */
export function validatePriority(subscription, requestedPriority) {
  const allowed = getAllowedPriorities(subscription);
  return {
    valid: allowed.includes(requestedPriority),
    allowed,
  };
}
