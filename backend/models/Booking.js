const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Please select a date'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Please select a time slot'],
      // Standard slots: '08:00 AM - 09:00 AM', etc.
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rescheduled', 'feedback_pending'],
      default: 'pending',
    },
    priceAtBooking: {
      type: Number,
      required: true,
      default: 0,
    },
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String, default: '' },
    },
    remindersSent: {
      dayBefore: { type: Boolean, default: false },
      hourBefore: { type: Boolean, default: false },
    },
    notes: String,
    recurrenceGroupId: {
      type: String,
      default: null,
    },
    recurrenceType: {
      type: String,
      enum: ['none', 'weekly', 'weekend', 'weekdays', 'daily'],
      default: 'none',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent multiple bookings for the same trainer at the same time
bookingSchema.index({ trainer: 1, date: 1, timeSlot: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);
