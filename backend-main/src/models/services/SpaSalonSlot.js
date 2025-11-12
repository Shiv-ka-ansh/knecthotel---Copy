const mongoose = require("mongoose");

const SpaSalonSlotSchema = new mongoose.Schema({
  HotelId: {
    type: mongoose.Types.ObjectId,
    ref: "Hotel",
    required: true,
  },
  dayOfWeek: {
    type: String,
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    required: true,
  },
  startTime: { type: String, required: true }, // e.g. '10:00'
  endTime: { type: String, required: true },   // e.g. '11:00'
  maxCapacity: { type: Number, required: true },
  currentCapacity: { type: Number, required: true },
});

module.exports = mongoose.model("SpaSalonSlot", SpaSalonSlotSchema);