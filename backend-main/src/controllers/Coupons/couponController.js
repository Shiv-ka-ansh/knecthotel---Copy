const mongoose = require('mongoose');
const Coupon = require('../../models/Coupons');
const Guest = require('../../models/Guest');
const Hotel = require('../../models/Hotel')
const Admin = require('../../models/SuperAdmin/Admin');
const { validateAndApplyCoupon } = require('../../utils/couponUtils');
const ApiError = require('../../utils/ApiError');
exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      value,
      minimumSpend,
      validFrom,
      validUntil,
      usageLimit,
      perUserLimit,
      stockable,
      imageUrl,
      termsAndConditions,
    } = req.body;

    // Validate required fields
    const requiredFields = [
      "code",
      "discountType",
      "value",
      "validFrom",
      "validUntil",
      "minimumSpend",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Check for existing coupon code
    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    // Validate dates
    if (new Date(validUntil) <= new Date(validFrom)) {
      return res.status(400).json({
        message: "Valid Until date must be after Valid From date",
      });
    }

    // Get creator information
    const creator = await Admin.findById(req.user._id);
    let HotelId = creator.HotelId;

    const scope = creator.scope;
    let applicableFor
    // Handle hotel-specific logic
    if (scope === "Hotel") {
      // Validate applicableFor for hotel coupons
    applicableFor = "guest_purchase";

      // Verify hotel exists
      const hotelExists = await Hotel.exists({ _id: HotelId });
      if (!hotelExists) {
        return res.status(400).json({ message: "Associated hotel not found" });
      }
    } else if (scope === "Platform") {
      applicableFor = "subscription";
      HotelId = null;
    }else {
      return res.status(400).json({
        message: "Invalid scope for coupon creation",
      });
    }
    if (discountType == "percentage" && value >= 100) {
      throw new ApiError(400,"Percentage discount value must be less than 100");
    }
    if (discountType == "fixed" && value <= 0) {
      throw new ApiError(400,"Fixed discount value must be greater than 0");
    }
    if (minimumSpend < 0) {
      throw new ApiError(400,"Minimum spend must be greater than or equal to 0");
    }
    if (usageLimit && perUserLimit > usageLimit) {
      throw new ApiError(400,"Per user limit cannot be greater than overall usage limit");
    }
    if (discountType == "fixed" && value > 10000) {
      throw new ApiError(400,"Max allowable fixed discount is 10,000");
    }
    
    
    // Create new coupon
    const newCoupon = new Coupon({
      code,
      scope,
      discountType,
      value,
      minimumSpend,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      applicableFor,
      usageLimit: usageLimit || null,
      perUserLimit: perUserLimit || usageLimit,
      stockable: stockable || false,
      imageUrl,
      termsAndConditions,
      status: "Active", // Default status
      HotelId,
      createdBy: {
        id: creator._id,
        model: creator.constructor.modelName,
      },
    });

    // Save the coupon
    await newCoupon.save();

    // Return response
    return res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon: {
        id: newCoupon._id,
        code: newCoupon.code,
        type: newCoupon.scope,
        status: newCoupon.status,
        validFrom: newCoupon.validFrom,
        validUntil: newCoupon.validUntil,
      },
    });
  } catch (error) {
    console.error("Coupon creation error:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating coupon",
      error: error.message,
    });
  }
};

exports.getAllCoupons = async (req, res) => {
  try {
    let filter = {};
    const status = req.query.status;
    if (status) {
      filter.status = status;
    }
    const admin = await Admin.findById(req.user._id);
    const HotelId = admin.HotelId;
    let coupons;
    if (HotelId) {
      filter.HotelId = HotelId;
    } else if (admin.scope === "Platform") {
      filter.scope = "Platform";
    } else {
      return res.status(400).json({ message: "Invalid Request!" });
    }
    coupons = await Coupon.find(filter).sort({
      createdAt: -1,
    });
    return res.status(200).json({
      success: true,
      coupons,
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching coupons",
      error: error.message,
    });
  }
};

exports.getCouponById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user._id);
    const { id } = req.params
    const HotelId = admin.HotelId;
    let coupon;
    if (HotelId) {
      coupon = await Coupon.findOne({ _id:id,HotelId });  
    } else {
      coupon = await Coupon.findOne({ _id: id, scope: "Platform" });      
    }
    if (!coupon) {
      return res.status(404).json({success:false, message:'No Coupon Found'})
    }
    return res.status(200).json({
      success: true,
      coupon,
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching coupons",
      error: error.message,
    });
  }
};

// Update Coupon
exports.updateCoupon = async (req, res) => {
  try {
    const {
      discountType,
      value,
      minimumSpend,
      validFrom,
      validUntil,
      usageLimit,
      perUserLimit,
      stockable,
      imageUrl,
      termsAndConditions,
      status
    } = req.body;

    // Validate required fields for update
    if (validUntil && validFrom && new Date(validUntil) <= new Date(validFrom)) {
      return res.status(400).json({
        message: "Valid Until date must be after Valid From date",
      });
    }

    // Get the coupon to update
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    // Verify admin has permission to update this coupon
    const admin = await Admin.findById(req.user._id);
    if (admin.scope === "Hotel" && !coupon.HotelId.equals(admin.HotelId)) {
      return res.status(403).json({ message: "Unauthorized to update this coupon" });
    }
    if (admin.scope === "Platform" && coupon.scope !== "Platform") {
      return res.status(403).json({ message: "Unauthorized to update this coupon" });
    }

    // Update fields
    if (discountType) coupon.discountType = discountType;
    if (value) coupon.value = value;
    if (minimumSpend) coupon.minimumSpend = minimumSpend;
    if (validFrom) coupon.validFrom = new Date(validFrom);
    if (validUntil) coupon.validUntil = new Date(validUntil);
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (perUserLimit !== undefined) coupon.perUserLimit = perUserLimit;
    if (stockable !== undefined) coupon.stockable = stockable;
    if (imageUrl) coupon.imageUrl = imageUrl;
    if (termsAndConditions) coupon.termsAndConditions = termsAndConditions;
    if (status) coupon.status = status;


    const newCoupon= await coupon.save();

    return res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      coupon: {
        id: coupon._id,
      ...newCoupon._doc},
    });
  } catch (error) {
    console.error("Coupon update error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating coupon",
      error: error.message,
    });
  }
};

// Delete Coupon
exports.deleteCoupon = async (req, res) => {
  try {
    // Get the coupon to delete
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    // Verify admin has permission to delete this coupon
    const admin = await Admin.findById(req.user._id);
    if (admin.scope === "Hotel" && !coupon.HotelId.equals(admin.HotelId)) {
      return res.status(403).json({ message: "Unauthorized to delete this coupon" });
    }
    if (admin.scope === "Platform" && coupon.scope !== "Platform") {
      return res.status(403).json({ message: "Unauthorized to delete this coupon" });
    }

    await coupon.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Coupon deletion error:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting coupon",
      error: error.message,
    });
  }
};
exports.getCouponsForHotel = async (req, res) => {
  try {
    const admin = req.user;
    let filter = {};
    if (admin.scope === "Platform") {
      filter.scope = "Platform";
    } else {
      return res.status(403).json({ message: "Invalid permission" });
    }
    const coupons = await Coupon.find(filter).sort({
      createdAt: -1,
    });
    return res.status(200).json({
      success: true,
      coupons,
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching coupons",
      error: error.message,
    });
  }
};


exports.getCouponsForGuest = async (req, res) => {
  try {
    const { HotelId } = req.query
    if (!HotelId) {
      return res.status(400).json({success: false, message: 'HotelId is required!'})
    }
    const coupons = await Coupon.find({ HotelId, status: 'Active' })
    return res.status(200).json({ success: true, message: 'Coupons fetched successfully!', coupons })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error Getting coupon",
      error: error.message,
    });
  }
};
exports.validateCouponCode = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const { amount, couponCode } = req.body;
    const user = req.guest;
    const userId = user ? user._id : null;
    const userModel = user ? 'Guest' : null;
    if (!couponCode) {
      return res.status(400).json({ success: false, message: "Coupon code is required" });
    }

    if (!amount) {
      return res.status(400).json({ success: false, message: "Amount is required to validate coupon" });
    }
    
    const context = {
      applicableFor: "guest_purchase",
      userId,
      userModel,
      amount,
      hotelId: user.HotelId
    }
    
    const result = await validateAndApplyCoupon(couponCode, context, false, session)
    await session.commitTransaction();
    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.error("Error validating coupon:", error);
    await session.abortTransaction();
    return res.status(500).json({
      success: false,
      message: "Error validating coupon",
      error: error.message,
    });
  }
  finally {
    await session.endSession();
  }
}