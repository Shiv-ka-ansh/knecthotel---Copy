const mongoose = require('mongoose');
const ServiceRequest = require('./ServiceRequest');
const conciergeItems = require('./conciergeItems');

const conciergeServiceRequestSchema = new mongoose.Schema({
  ...ServiceRequest.obj,
  requestType: {
    type: String,
    enum: ["Nearby Attraction", "Nearby Cafe & Restaurant", "Taxi Service"],
    required: false,
  },
  conciergeItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ConciergeItem",
    required: false,
  },
  location: String,
  date: Date,
  time: String,
});

const ConciergeRequest = ServiceRequest.discriminator(
    "ConciergeRequest", conciergeServiceRequestSchema
)

module.exports = ConciergeRequest