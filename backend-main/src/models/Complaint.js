const mongoose = require("mongoose");
const generateUniqueId = require("../utils/idGenerator");

const complaintSchema = new mongoose.Schema(
  {
    uniqueId: {
      type: String,
      unique: true,
      index: true,
    },
    // Visibility marker
    scope: {
      type: String,
      enum: ["Platform", "Hotel"],
      required: true,
      index: true,
    },

    // Who is lodging the complaint
    raisedByGuest: { type: mongoose.Types.ObjectId, ref: "Guest" },
    raisedByAdmin: { type: mongoose.Types.ObjectId, ref: "Admin" },

    // Target hotel (always present)
    HotelId: {
      type: mongoose.Types.ObjectId,
      ref: "Hotel",
    },

    complaintType: String,
    description: String,
    status: {
      type: String,
      enum: ["Open", "Inprogress", "Resolved"],
      default: "Open",
    },
    assignedTo: { type: mongoose.Types.ObjectId, ref: "Admin" },
    estimatedDeliveryTime:Date,
    remark: String,
    resolvedAt: Date,
    feedback: {
      complaintFeedback: { type: String, },
      complaintRating: { type: Number, min: 1, max: 5,  },
      agentFeedback: { type: String, },
      agentRating: { type: Number, min: 1, max: 5, },
    }
  },
  { timestamps: true }
);
complaintSchema.pre("save", async function (next) {
  if (!this.uniqueId) {
    this.uniqueId = await generateUniqueId("Complaint", "uniqueId", "CD", 6);
  }
  next();
});
/* helpful compound indexes            */
complaintSchema.index({ scope: 1, HotelId: 1 });
complaintSchema.index({ scope: 1, raisedByGuest: 1 });
complaintSchema.index({ scope: 1, raisedByAdmin: 1 });
module.exports = mongoose.model("Complaint", complaintSchema);
