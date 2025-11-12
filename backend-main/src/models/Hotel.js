const mongoose = require("mongoose");
const generateUniqueId = require("../utils/idGenerator");
const serviceDepartments = [
  "reception",
  "housekeeping",
  "inroomdining",
  "gym",
  "spa",
  "swimmingpool",
  "conciergeservice",
  "in_room_control",
  "ordermanagement",
  "payment",
  "sos",
  "chat",
];
const dayOfWeekEnum = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const roomSchema = new mongoose.Schema({
  roomName: String,
  roomType: {
    type: String,
    // enum: [
    //   "Single",
    //   "Double",
    //   "Twin",
    //   "Deluxe",
    //   "Studio Room /Apartments",
    //   "Junior Suits",
    //   "Suite",
    //   "Presidential Suite",
    //   "Connecting Suite",
    //   "Rooms with a View",
    // ],
    // required: true,
  },
  features: {
    type: [String],
    // required: true,
  },
  images: {
    type: [String]
  },
  
});

const hotelSchema = new mongoose.Schema(
  {
    HotelId: {
      type: String,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNo: {
      type: String,
      unique: true,
      required: true,
      match: [/^\d{10}$/, "Phone number must be exactly 10 digits"],
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
      match: [/^\d{6}$/, "Pincode must be exactly 6 digits"],
    },
    hotelCategory: {
      type: String,
      required: true,
    },
    images: [String],
    checkInTime: {
      type: String,
      required: true,
    },
    checkOutTime: {
      type: String,
      required: true,
    },

    //servicing departments
    timezone: {
      type: String,
      required: true,
      default: "Asia/Kolkata",
    },
    serviceAvailability: [{
      service: {
        type: String,
        enum: serviceDepartments,
        required: true
      },
      schedules: [{
        day: {
          type: String,
          enum: dayOfWeekEnum,
          required: true
        },
        startTime: {
          type: String,
          match: /^([01]\d|2[0-3]):([0-5]\d)$/,
          required: true
        },
        endTime: {
          type: String,
          match: /^([01]\d|2[0-3]):([0-5]\d)$/,
          required: true
        }
      }]
    }], 
    
    servingDepartment: {
      type: [String],
      enum: serviceDepartments,
      default: [],
      required: false,
    },
    totalStaff: {
      type: Number,
      required: false,
    },
    numberOfRooms: {
      type: Number,
      required: false,
    },
    brandedHotel: {
      type: Boolean,
      default: false,
    },
    parentHotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: function () {
        return this.brandedHotel === false && !this.chainHotel;
      },
    },
    chainHotel: {
      type: String,
      required: false,
    },
    subHotels: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hotel",
      },
    ],
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Inactive",
    },
    subscriptionStatus: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Inactive",
    },
    subscriptionPlan: {
      type: mongoose.Schema.ObjectId,
      ref: "Subscription",
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
    },
    gstPercentage: {
      type: Number,
      required: false,
      default: 18, // Default GST percentage
      min: 0,
      max: 100,
    },
    netPrice: {
      type: Number,
    },
    logo: String,
    Admin: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    rooms: [roomSchema],
    hotelLicenseAndCertification: {
      certificateValue: String,
      imageUrl: String,
    },
    legalAndBusinessLicense: {
      licenseValue: String,
      imageUrl: String,
    },
    touristLicense: {
      licenseValue: String,
      imageUrl: String,
    },
    panNumber: {
      numberValue: String,
      imageUrl: String,
    },
    dataPrivacyAndGDPRCompliance: {
      complianceValue: String,
      imageUrl: String,
    },
    gstImage: {
      gstValue: String,
      imageUrl:String
    },
    internetConnectivity: {
      type: Boolean,
      default: false,
    },
    softwareCompatibility: {
      type: Boolean,
      default: false,
    },
    subscriptionStartDate: {
      type: Date,
      required: true,
    },
    subscriptionEndDate: {
      type: Date,
      required: false,
    },
    subscriptionPaymentStatus: {
      type: String,
      enum: ["unpaid", "pending", "paid", "failed", "refunded"],
      default: "unpaid",
    },
    subscriptionPaymentDate: Date,
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
    },
    about: String,
    reviews: [
      {
        review: {
          type: String,
          minlength: 3,
          maxlength: 1000,
        },
        givenBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Guest",
        },
      },
    ],
    
    
  },
  { timestamps: true }
);
hotelSchema.pre("save", async function (next) {
  if (!this.HotelId) {
    this.HotelId = await generateUniqueId("Hotel", "HotelId", "HD", 6);
  }
  next();
});


//   src/models/Hotel.js   (only the new fields shown here)

  module.exports = mongoose.model("Hotel", hotelSchema);
