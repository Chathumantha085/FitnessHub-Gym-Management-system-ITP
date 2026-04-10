const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MembershipPlan',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    method: {
      type: String,
      enum: ['slip', 'cash', 'online'],
      default: 'slip',
    },
    paymentSlipUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected'],
      default: 'pending',
    },
    receiptId: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate Receipt ID before saving
paymentSchema.pre('save', function () {
  if (!this.receiptId) {
    this.receiptId = 'REC' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  }
});

module.exports = mongoose.model('Payment', paymentSchema);
