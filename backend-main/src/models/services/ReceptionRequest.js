const { default: mongoose } = require("mongoose");
const ServiceRequest = require("./ServiceRequest")
const ReceptionRequestSchema = new mongoose.Schema({
  ...ServiceRequest.obj, // Inherits base fields
  requestType: {
    type: String,
    enum: [
      "Complaint",
      "Services",
      "Feedback",
      "WakeUpCallReminder",
      "WakeUpCallScheduling",
      "PreCheckOut",
      "DoctorOnCall",
      "RoomUpgradeRequest",
      "Mini Bar",
      "Room Change"
    ],
    required: true,
  },
  // (optional) extra fields only some request types may need
  wakeUpTime: Date, // used by Wake-Up-Call requests
  upgradeCategory: String, // used by RoomUpgradeRequest
});
module.exports = ServiceRequest.discriminator(
  "ReceptionRequest",
  ReceptionRequestSchema
);
