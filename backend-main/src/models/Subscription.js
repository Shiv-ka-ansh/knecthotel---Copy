const mongoose = require("mongoose");
const generateUniqueId = require("../utils/idGenerator");

const subscriptionSchema = new mongoose.Schema(
  {
    uniqueId: {
      type: String,
      unique: true,
      index: true,
    },
    planName: {
      type: String,
      required: true,
      unique: true,
    },
    planDuration: {
      type: Number,
      required: true,
      min: 1,
      max: 999,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value'
      }
    },
    planType: {
      type: String,
      enum: ["Monthly","Quarterly" , "Semi Annual", "Annual"],
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Cancelled", "Expired"],
      default: "Active",
    },
    cost: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value'
      }
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    maxAdmins: {
      type: Number,
      default: 3,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value'
      }
    },
  },
  { timestamps: true }
);
subscriptionSchema.pre("save", async function (next) {
  if (!this.uniqueId) {
    this.uniqueId = await generateUniqueId("Subscription", "uniqueId", "SD", 6);
  }
  next();
});
module.exports = mongoose.model('Subscription', subscriptionSchema)