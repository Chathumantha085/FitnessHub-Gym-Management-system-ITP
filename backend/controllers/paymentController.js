const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const MembershipPlan = require('../models/MembershipPlan');
const User = require('../models/User');
const { sendPaymentConfirmedEmail, sendPaymentRejectedEmail } = require('../utils/emailService');

// @desc    User records a payment (uploads slip)
// @route   POST /api/payments
// @access  Private
exports.recordPayment = async (req, res) => {
  try {
    const { planId, method } = req.body;
    let paymentSlipUrl = '';

    if (req.file) {
      paymentSlipUrl = `/uploads/${req.file.filename}`;
    } else if (method === 'slip') {
      return res.status(400).json({ success: false, message: 'Please upload original payment slip' });
    }

    const planData = await MembershipPlan.findById(planId);
    if (!planData) {
      return res.status(404).json({ success: false, message: 'Membership plan not found' });
    }

    const payment = await Payment.create({
      user: req.user._id,
      plan: planId,
      amount: planData.price,
      method,
      paymentSlipUrl,
      status: 'pending',
    });

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Admin confirms user payment and activates/renews subscription
// @route   PATCH /api/admin/payments/:id/confirm
// @access  Private/Admin
exports.confirmPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    if (payment.status === 'confirmed') {
      return res.status(400).json({ success: false, message: 'Payment already confirmed' });
    }

    const plan = await MembershipPlan.findById(payment.plan);
    const today = new Date();
    const endDate = new Date(today);
    endDate.setMonth(today.getMonth() + plan.durationMonths);

    // Create or Update subscription
    let subscription = await Subscription.findOne({ user: payment.user, status: 'active' });

    if (subscription) {
      // Renew: update endDate to be relative to today
      subscription.endDate = endDate;
      subscription.lastPayment = payment._id;
      subscription.isPaid = true;
      await subscription.save();
    } else {
      // New: create new subscription
      subscription = await Subscription.create({
        user: payment.user,
        plan: plan._id,
        startDate: today,
        endDate: endDate,
        status: 'active',
        isPaid: true,
        lastPayment: payment._id,
      });
    }

    // Update payment record
    payment.status = 'confirmed';
    payment.subscription = subscription._id;
    await payment.save();

    // Send confirmation email to member (non-blocking)
    const member = await User.findById(payment.user).select('name email');
    if (member) {
      sendPaymentConfirmedEmail(member, plan.name, payment.amount, subscription.endDate).catch(err =>
        console.error('Failed to send payment confirmed email:', err)
      );
    }

    res.status(200).json({ success: true, message: 'Payment confirmed & membership activated', data: subscription });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all payments for Admin
// @route   GET /api/admin/payments
// @access  Private/Admin
exports.getAllPaymentsAdmin = async (req, res) => {
  try {
    const payments = await Payment.find().populate('user', 'name email').populate('plan').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get user's payment history
// @route   GET /api/payments/my-history
// @access  Private
exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id }).populate('plan').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get revenue stats for Admin
// @route   GET /api/admin/revenue
// @access  Private/Admin
exports.getRevenueStats = async (req, res) => {
  try {
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    
    // Revenue by month (last 6 months)
    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: 'confirmed' } },
      {
        $group: {
          _id: { month: { $month: '$paymentDate' }, year: { $year: '$paymentDate' } },
          amount: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 },
    ]);

    res.status(200).json({
      success: true,
      total: totalRevenue[0]?.total || 0,
      monthly: monthlyRevenue,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Reject payment
// @route   PATCH /api/admin/payments/:id/reject
// @access  Private/Admin
exports.rejectPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('plan');
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Can only reject pending payments' });
    }

    const { reason } = req.body;
    payment.status = 'rejected';
    await payment.save();

    // Send rejection email to member (non-blocking)
    const member = await User.findById(payment.user).select('name email');
    if (member) {
      sendPaymentRejectedEmail(member, payment.plan?.name || 'Membership Plan', payment.amount, reason).catch(err =>
        console.error('Failed to send payment rejected email:', err)
      );
    }

    res.status(200).json({ success: true, message: 'Payment rejected' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
