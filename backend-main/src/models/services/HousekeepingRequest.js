const { default: mongoose } = require("mongoose");
const ServiceRequest = require("./ServiceRequest");

// Housekeeping Service Requests
const HousekeepingRequestSchema = new mongoose.Schema({
  ...ServiceRequest.obj,
  requestType: {
    type: String,
    enum: ["WholeRoomCleaning", "PartialRoomCleaning", "Toiletries", "Laundry"],
    required: true,
  },
  items: [
    {
      item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HousekeepingItem",
        // Required only for DeliverToiletries/Laundry requests
        required: function () {
          return ["DeliverToiletries", "Laundry"].includes(this.requestType);
        },
      },
      quantity: {
        type: Number,
        required: function () {
          return ["DeliverToiletries", "Laundry"].includes(this.requestType);
        },
        min: [0, "Quantity cannot be negative"],
      },
    },
  ],
});

const HousekeepingRequest = ServiceRequest.discriminator(
  "HousekeepingRequest",
  HousekeepingRequestSchema
);  

module.exports = HousekeepingRequest;
