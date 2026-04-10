const mongoose = require('mongoose');

const dietAssignmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dietPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DietPlan',
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    adherenceLogs: [
      {
        date: {
          type: Date,
          required: true,
        },
        mealsConsumed: [Number], // Indices of meals from dietPlan.meals
        remarks: String,
      },
    ],
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('DietAssignment', dietAssignmentSchema);
