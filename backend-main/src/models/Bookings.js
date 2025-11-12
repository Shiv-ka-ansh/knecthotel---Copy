const mongoose = require("mongoose");
const generateUniqueId = require("../utils/idGenerator");

const bookingSchema = new mongoose.Schema(
  {
    uniqueId: {
      type: String,
      unique: true,
      index: true,
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guest",
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      match: [/^\d{10}$/, "Phone number must be exactly 10 digits"],
    },
    email: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    sources: {
      type: String,
      required: false,
    },
    pincode: {
      type: String,
      required: true,
      match: [/^\d{6}$/, "Pincode must be exactly 6 digits"],
    },
    roomCategory: {
      type: String,
    },
    roomTariff: {
      type: Number,
      min: [0, "Room tariff cannot be negative"],
    },
    gst: {
      type: Number,
      min: [0, "GST % cannot be negative"],
    },
    assignedRoomNumber: {
      type: String,
      required: false,
    },
    HotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    checkInDate: {
      type: Date,
      required: false,
    }, // e.g., "2025-06-14T00:00:00.000Z"

    checkOutDate: {
      type: Date,
      required: false,
    },

    checkInTime: {
      type: String, // e.g., "12:00 PM"
    },

    checkOutTime: {
      type: String,
    },

    status: {
      type: String,

      enum: [
        "Pending",
        "Confirmed",
        "Checked-In",
        "Checked-Out",
        "Cancelled",
        "No-Show",
      ],
      default: "Pending",
    },

    adultGuestsCount: { type: Number, default: 1, min: 1 },
    childrenGuestsCount: { type: Number, default: 0, min: 0 },
    infantGuestsCount: { type: Number, default: 0, min: 0 },
    guests: [
      {
        guestType: {
          type: String,
          enum: ["adult", "children", "infant"],
        },
        firstName: { type: String },
        lastName: { type: String },
        phoneNumber: { type: String }, // Optional for children/infants
        countryCode: { type: String }, // Optional
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
    preCheckInStatus: {
      type: String,
      enum: ["Pending", "ALLOW", "Approved", "Rejected"],
    },
    specialRequest: String,
    preCheckIn: {
      type: Boolean,
      default: false,
    },
    preCheckInRejectionMessage: String,
    sources: String,
    dueAmt: {
      type: Number,
      min: [0, "dueAmt cannot be negative"],
    },
    roomTariffDue: {
      type: Number,
      default: 0,
      min: [0, "Room Tariif cannot be negative"],
    },
    serviceDue: {
      type: Number,
      default:0,
      min: [0, "Room Tariif cannot be negative"],
    },    
    services: [
      {
        amount: Number,
        serviceRequestId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ServiceRequest",
        },
        requestName: String,
      },
    ],
    receivedAmt: {
      type: Number,
      min: [0, "Received Amount cannot be negative"],
    },
    paymentMode: {
      type: String,
    },

    paymentStatus: {
      type: String,
      enum: ["paid", "unpaid", "Cancelled"],
      default: "unpaid",
    },
    wifi: {
      wifiName: String,
      password: String,
      scanner: String,
    },
    idProofs: [
      {
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
    ],
    gstIn: {
      type: String,
      required: false,
    },
    businessName: {
      type: String,
      required: false,
    }
  },
  { timestamps: true }
);

bookingSchema.pre("save", async function (next) {
  if (!this.uniqueId) {
    this.uniqueId = await generateUniqueId("Booking", "uniqueId", "BO", 6);
  }
  next();
});

module.exports = mongoose.model("Booking", bookingSchema);
