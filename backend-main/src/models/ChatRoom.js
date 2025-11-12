const mongoose = require("mongoose");

const chatRoomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      unique: true,
      required: true,
    },
    guestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guest",
      required: true,
    },
    HotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    guestQuery: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "closed"],
      default: "pending",
    },
    startTime: {
      type: Date,
      default: null,
    },
    endTime: {
      type: Date,
      default: null,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    feedback: {
      chatFeedback: { type: String, default: "" },
      chatRating: { type: Number, min: 1, max: 5, default: null },
      agentFeedback: { type: String, default: "" },
      agentRating: { type: Number, min: 1, max: 5, default: null },
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatRoom", chatRoomSchema);
