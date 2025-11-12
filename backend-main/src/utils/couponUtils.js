// utils/couponUtils.js
const Coupon = require("../models/Coupons");

exports.validateAndApplyCoupon = async (couponCode, context, apply,session) => {
  const { applicableFor, userId, userModel, hotelId, amount } = context;

  const coupon = await Coupon.findOne({code:couponCode}).session(session);
  if (!coupon) {
    return { valid: false, message: "Coupon not found" };
  }

  // Check status
  if (coupon.status !== "Active") {
    return { valid: false, message: "Coupon is not active" };
  }

  // Check dates
  const now = new Date();
  if (now < coupon.validFrom || now > coupon.validUntil) {
    return { valid: false, message: "Coupon is not valid at this time" };
  }

  // Check applicableFor
  if (coupon.applicableFor !== applicableFor) {
    return { valid: false, message: "Coupon not applicable for this use" };
  }

  // Scope and HotelId checks
  if (applicableFor === "guest_purchase") {
    if (coupon.scope !== "Hotel") {
      return { valid: false, message: "Coupon not valid for guest purchases" };
    }
    if (coupon.HotelId.toString() !== hotelId.toString()) {
      return { valid: false, message: "Coupon not valid for this hotel" };
    }
  } else if (applicableFor === "subscription") {
    if (coupon.scope !== "Platform") {
      return { valid: false, message: "Coupon not valid for subscriptions" };
    }
    if (coupon.HotelId) {
      return { valid: false, message: "Invalid coupon for subscription" };
    }
  }

  // Minimum spend check
  if (coupon.minimumSpend && amount < coupon.minimumSpend) {
    return {
      valid: false,
      message: `Minimum spend of ${coupon.minimumSpend} required`,
    };
  }

  // Usage limit check
  if (coupon.usageLimit !== null) {
    const totalUses = coupon.usedBy.reduce(
      (sum, entry) => sum + entry.count,
      0
    );
    if (totalUses >= coupon.usageLimit) {
      return { valid: false, message: "Coupon usage limit reached" };
    }
  }

  // Per user limit check
  const userEntry = coupon.usedBy.find(
    (entry) =>
      entry.user.toString() === userId.toString() &&
      entry.userModel === userModel
  );
  if (userEntry) {
    if (userEntry.count >= coupon.perUserLimit) {
      return {
        valid: false,
        message: "Coupon usage limit exceeded for this user",
      };
    }
  } else {
    if (coupon.perUserLimit < 1) {
      return { valid: false, message: "Coupon not available for new users" };
    }
  }

  if (apply) {
    // Apply coupon usage
    if (userEntry) {
      userEntry.count += 1;
    } else {
      coupon.usedBy.push({ user: userId, userModel, count: 1 });
    }

    if (coupon.usageLimit !== null) {
      coupon.usageLimit -= 1;
    }
  }

  await coupon.save({ session });
  return { valid: true, coupon };
};

exports.updateCouponsStatus = async () => {
  try {
    const coupons = await Coupon.find({
      status: {
        $in: ["Active", "Disabled"]
      }
    })
    for (const coupon of coupons) {
      const today = new Date()

      if (today > new Date(coupon.validUntil)) {
        coupon.status = "Expired";
        await coupon.save()
      }
      if (coupon.usageLimit >=  coupon.usedBy.length)
      {
        coupon.status = "Disabled";
        await coupon.save()
      }
      
    }
    console.log("Cron for expired coupons")
  } catch (error) {
    console.log(error)
  }
}