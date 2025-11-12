const mongoose = require('mongoose');

const gstPercentageSchema = new mongoose.Schema(
  {
    HotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    gstPercentageForServices: [
      {
        serviceName: {
          type: String,
          required: true,
          enum: ["housekeeping", "gym", "swimmingpool", "spa", "inroomdining"],
        },
        gstPercentage: {
          type: Number,
          min: [0, "GST percentage cannot be negative"],
          max: [100, "GST percentage cannot exceed 100"],
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const GstPercentage = mongoose.model('GstPercentage', gstPercentageSchema);
module.exports = GstPercentage;