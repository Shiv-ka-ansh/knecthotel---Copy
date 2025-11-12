const mongoose = require('mongoose');
const generateUniqueId = require('../utils/idGenerator');

const roleSchema = new mongoose.Schema(
  {
    uniqueId: {
      type: String,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    scope: {
      type: String,
      enum: ["Platform", "Hotel"],
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    HotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
    },
    permissions: [
      {
        module: {
          type: String,
          required: true,
        },
        access: {
          type: [String],
          enum: ["read", "write", "delete"],
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

roleSchema.pre("save", async function (next) {
  if (!this.uniqueId) {
    this.uniqueId = await generateUniqueId("Role", "uniqueId", "RD", 6);
  }
  next();
});

module.exports = mongoose.model('Role', roleSchema);
