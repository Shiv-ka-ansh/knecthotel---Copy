// services/calculateSubscriptionAmount.js
const mongoose = require("mongoose");
const Subscription = require("../models/Subscription");
const Coupons = require("../models/Coupons");

/**
 * Calculates the payable amount for a subscription, optionally applying a coupon.
 * @param {String|mongoose.Types.ObjectId} subscriptionId  – Plan _id
 * @param {String|null} couponCode                         – Code to apply, or null
 * @returns {Object} {subscription, basePrice, discountAmount, finalPrice, coupon}
 * @throws if subscription or coupon invalid / inapplicable
 */
module.exports = async function calculateSubscriptionAmount(
  subscriptionId,
  couponCode = null,
  
) {
  // 1. Fetch subscription
  const subscription =
    await Subscription.findById(subscriptionId)
  if (!subscription) {
    throw new Error("Subscription plan not found");
  }
  const basePrice = subscription.cost;

  // 2. Early exit if no coupon
  if (!couponCode) {
    return {
      subscription,
      basePrice,
      discountAmount: 0,
      finalPrice: basePrice,
      coupon: null,
    };
  }

  // 3. Validate & compute coupon
  const coupon = await Coupons.findOne({ code: couponCode })
  if (!coupon) throw new Error("Coupon not found");
  if (coupon.applicableFor !== "subscription" || coupon.status !== "Active")
    throw new Error("Coupon not applicable for subscriptions");
  if (coupon.validFrom > Date.now() || coupon.validUntil < Date.now())
    throw new Error("Coupon is not currently valid");

  // minimumSpend check
  if (coupon.minimumSpend && basePrice < coupon.minimumSpend)
    throw new Error(`Minimum spend for this coupon is ₹${coupon.minimumSpend}`);

  // Compute discount
  let discountAmount = 0;
  if (coupon.discountType === "percentage") {
    discountAmount = basePrice * (coupon.value / 100);
  } else {
    discountAmount = Math.min(coupon.value, basePrice);
  }

  const finalPrice = basePrice - discountAmount;
  return { subscription, basePrice, discountAmount, finalPrice, coupon };
};
