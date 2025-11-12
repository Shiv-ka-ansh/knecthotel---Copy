const mongoose = require("mongoose");
const ServiceRequest = require("./ServiceRequest");

const InRoomControlRequestSchema = new mongoose.Schema({
  ...ServiceRequest.obj,

  issueType: {
    type: String,
    enum: ["Electricity", "Electronics", "Plumbing", "Carpenter", "Wi-Fi","Others"],
    required: true,
  },

  description: {
    type: String,
    required: true,
  },
});

module.exports = ServiceRequest.discriminator(
  "InRoomControlRequest",
  InRoomControlRequestSchema
);
