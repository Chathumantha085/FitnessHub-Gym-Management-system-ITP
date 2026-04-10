const mongoose = require('mongoose');

const membershipPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a membership plan name'],
      unique: true,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
    },
    durationMonths: {
      type: Number,
      required: [true, 'Please add duration in months'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    features: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MembershipPlan', membershipPlanSchema);
