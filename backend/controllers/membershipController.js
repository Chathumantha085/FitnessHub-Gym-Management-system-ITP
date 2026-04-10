const MembershipPlan = require('../models/MembershipPlan');
const Subscription = require('../models/Subscription');

// @desc    Get all membership plans
// @route   GET /api/membership/plans
// @access  Public
exports.getPlans = async (req, res) => {
  try {
    const plans = await MembershipPlan.find({ isActive: true });
    res.status(200).json({ success: true, count: plans.length, data: plans });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all plans (including inactive ones) for Admin
// @route   GET /api/admin/plans
// @access  Private/Admin
exports.getAllPlansAdmin = async (req, res) => {
  try {
    const plans = await MembershipPlan.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: plans.length, data: plans });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Create membership plan
// @route   POST /api/admin/plans
// @access  Private/Admin
exports.createPlan = async (req, res) => {
  try {
    const plan = await MembershipPlan.create(req.body);
    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update membership plan
// @route   PUT /api/admin/plans/:id
// @access  Private/Admin
exports.updatePlan = async (req, res) => {
  try {
    const plan = await MembershipPlan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Toggle plan status
// @route   PATCH /api/admin/plans/:id/toggle
// @access  Private/Admin
exports.togglePlanStatus = async (req, res) => {
  try {
    const plan = await MembershipPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    plan.isActive = !plan.isActive;
    await plan.save();

    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete membership plan
// @route   DELETE /api/admin/plans/:id
// @access  Private/Admin
exports.deletePlan = async (req, res) => {
  try {
    const plan = await MembershipPlan.findByIdAndDelete(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    res.status(200).json({ success: true, message: 'Plan deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get current user's active subscription
// @route   GET /api/membership/me
// @access  Private
exports.getMySubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id, status: 'active' })
      .populate('plan')
      .populate('lastPayment');

    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
