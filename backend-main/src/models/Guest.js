const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const generateUniqueId = require("../utils/idGenerator");

const guestSchema = new mongoose.Schema(
  {
    uniqueId: {
      type: String,
      unique: true,
      index: true,
    },
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },

    countryCode: { type: String, required: false, default: "+91" }, 
    phoneNumber: {
      type: String,
      unique: true,
      required: false,
      match: [/^\d{10}$/, "Phone number must be exactly 10 digits"],
    },
    email: { type: String },

    address: { type: String, required: false },

    lastLogin: { type: Date },

    dateOfBirth: {
      type: Date,
      set: (v) => (v ? new Date(v) : v),
      validate: {
        validator: (v) => !v || !isNaN(v.getTime()),
        message: "dateOfBirth is not a valid date",
      },
      required: false,
    },

    anniversaryDate: {
      type: Date,
      set: (v) => (v ? new Date(v) : v),
      validate: {
        validator: (v) => !v || !isNaN(v.getTime()),
        message: "anniversaryDate is not a valid date",
      },
      required: false,
    },

    language: {
      type: String,
      enum: [
        "English",
        "Hindi",
        "Marathi",
        "Bengali",
        "Gujrati",
        "Telugu",
        "Punjabi",
      ],
      default: "English",
      required: false,
    },

    idProof: {
      url: { type: String },
      type: {
        type: String,
        enum: ["AADHAAR", "PASSPORT", "DRIVING-LICENSE", "PAN"],
      },
      verification: {
        status: {
          type: String,
          enum: ["PENDING", "VALID", "INVALID", "FAILED"],
          default: "PENDING",
        },
        message: String,
        timestamp: Date,
        requestId: String,
      },
    },

    profilePicture: { type: String, required: false },

    cardDetails: {
      cardType: {
        type: String,
        enum: ["VISA", "MasterCard", "Amex", "Discover"],
      },
      last4Digits: { type: String },
      cardExpiry: { type: String },
    },

    otp: {
      code: { type: String },
      expiresAt: { type: Date },
      verified: { type: Boolean, default: false },
    },
    assignedRoomNumber: {
      type: String,
      required: false,
    },
    HotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: false,
    },
    isSignupComplete: { type: Boolean, default: false },
    currentBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
    fcmToken: {
      type: String,
      required: false,
    },
    // models/Guest.js  (add inside guestSchema definition)
    savedGuests: [
      {
        guestType: {
          type: String,
          enum: ["adult", "children", "infant"],
        },
        firstName: { type: String },
        lastName: { type: String },
        phoneNumber: { type: String }, 
        countryCode: { type: String },
        gender: {
          type: String,
          enum: ["male", "female", "other", "prefer not to say"],
        },
        idProof: {
          url: { type: String },
          type: {
            type: String,
            enum: ["AADHAAR", "PASSPORT", "DRIVING-LICENSE", "PAN"],
          },
          verification: {
            status: {
              type: String,
              enum: ["PENDING", "VALID", "INVALID", "FAILED"],
              default: "PENDING",
            },
            message: String,
            timestamp: Date,
            requestId: String,
          },
        },
      },
    ],
  },
  { timestamps: true }
);

// OTP comparison method (for verifying OTP)
guestSchema.methods.compareOTP = function (otp) {
  return otp === this.otp.code && new Date() < this.otp.expiresAt;
};
guestSchema.pre("save", async function (next) {
  if (!this.uniqueId) {
    this.uniqueId = await generateUniqueId("Guest", "uniqueId", "GD", 6);
  }
  next();
});
module.exports = mongoose.model("Guest", guestSchema);
