const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const generateUniqueId = require("../../utils/idGenerator");

const adminSchema = new mongoose.Schema(
  {
    isSuperAdmin: {
      type: Boolean,
      default: false,
    },
    isHotelAdmin: {
      type: Boolean,
      default: false,
    },
    uniqueId: {
      type: String,
      unique: true,
      index: true,
    },
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: function () {
        return !this.isSuperAdmin && this.scope === "Platform";
      },
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    firstName: String,
    lastName: String,
    email: {
      type: String,
      unique: true,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      match: [/^\d{10}$/, "Phone number must be exactly 10 digits"],
    },
    password: String,
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    lastLogin: Date,
    passwordResetOTP: String,
    passwordResetOTPExpires: Date,
    IsOtpVerified: Boolean,
    scope: {
      type: String,
      enum: ["Platform", "Hotel"],
      required: true,
    },
    HotelId: {
      type: mongoose.Types.ObjectId,
      required: false,
    },
  },
  { timestamps: true }
);

adminSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  if (!this.uniqueId) {
    if (this.employerId) {
      this.uniqueId = await generateUniqueId("Admin", "uniqueId", "ED", 6);
    }
    this.uniqueId = await generateUniqueId("Admin", "uniqueId", "AD", 6);
  }
  next();
});

module.exports = mongoose.model("Admin", adminSchema);
