// models/Coupon.js
const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    // Basic Information
    code: {
      type: String,
      required: true,
      unique: true,
    },
    scope: {
      type: String,
      enum: ["Platform", "Hotel"],
      required: true,
    },

    // Discount Details
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
      
    },
    minimumSpend: {
      type: Number,
      required: false,
      min: 0,
    },
    applicableFor: {
      type: String,
      enum: ["guest_purchase", "subscription"],
    },
    // Validity Controls
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "Expired", "Disabled"],
      default: "Active",
    },

    // Usage Limits
    usageLimit: {
      type: Number,
      default: null,
      min: 1,
    },
    perUserLimit: {
      type: Number,
      default: 1,
      min: 1,
    },
    stockable: {
      type: Boolean,
      default: false,
    },

    // Relationships
    HotelId: {
      type: mongoose.Types.ObjectId,
      required: function () {
        return this.scope === "Hotel";
      },
    },
    createdBy: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "createdBy.model",
      },
      model: {
        type: String,
        required: true,
        enum: ["Admin", "Employee"],
      },
    },

    // Usage Tracking
    usedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "usedBy.userModel",
        },
        userModel: {
          type: String,
          enum: ["Guest", "Hotel"],
        },
        count: {
          type: Number,
          default: 0,
        },
      },
    ],
    imageUrl: String,
    termsAndConditions: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
