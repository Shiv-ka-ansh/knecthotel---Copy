const mongoose = require("mongoose");
const ServiceRequest = require("./ServiceRequest");

const OrderedItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Types.ObjectId,
    ref: "InRoomDiningProduct",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [0, "Quantity cannot be negative"],
  },
});

const InRoomDiningBookingSchema = new mongoose.Schema({
  ...ServiceRequest.obj,
  HotelId: {
    type: mongoose.Types.ObjectId,
    ref: "Hotel",
    required: true,
  },
  orderedItems: [OrderedItemSchema],
  specialInstructions: String,

});

module.exports = ServiceRequest.discriminator(
  "InRoomDiningBooking",
  InRoomDiningBookingSchema
);
