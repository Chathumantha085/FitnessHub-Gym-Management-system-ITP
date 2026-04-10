const DietPlan = require('../models/DietPlan');
const DietAssignment = require('../models/DietAssignment');
const User = require('../models/User');
const { sendDietPlanEmail } = require('../utils/emailService');

// @desc    Create a diet plan
// @route   POST /api/diets
// @access  Private (Trainer/Admin)
exports.createDietPlan = async (req, res) => {
  try {
    const { name, description, meals } = req.body;
    
    // Ensure the trainer is the one creating it
    const dietPlan = await DietPlan.create({
      trainer: req.user._id,
      name,
      description,
      meals,
    });

    res.status(201).json({ success: true, data: dietPlan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all diet plans for a trainer
// @route   GET /api/diets
// @access  Private (Trainer/Admin)
exports.getTrainerDietPlans = async (req, res) => {
  try {
    const plans = await DietPlan.find({ trainer: req.user._id });
    res.status(200).json({ success: true, count: plans.length, data: plans });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Assign diet plan to user
// @route   POST /api/diets/assign
// @access  Private (Trainer/Admin)
exports.assignDietPlan = async (req, res) => {
  try {
    const { userId, dietPlanId, endDate } = req.body;
    
    // Deactivate previous active plans for this user
    await DietAssignment.updateMany(
      { user: userId, status: 'active' },
      { status: 'completed' }
    );

    const assignment = await DietAssignment.create({
      user: userId,
      dietPlan: dietPlanId,
      assignedBy: req.user._id,
      endDate,
    });

    // Notify user via email
    try {
      const user = await User.findById(userId);
      const dietPlan = await DietPlan.findById(dietPlanId);
      if (user && dietPlan) {
        await sendDietPlanEmail(user, dietPlan.name);
      }
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
      // We don't fail the request if email fails
    }

    res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get active diet plan for current user
// @route   GET /api/diets/my-plan
// @access  Private
exports.getMyDietPlan = async (req, res) => {
  try {
    const assignment = await DietAssignment.findOne({ 
      user: req.user._id, 
      status: 'active' 
    }).populate('dietPlan');

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'No active diet plan found' });
    }

    res.status(200).json({ success: true, data: assignment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Log daily adherence
// @route   POST /api/diets/log
// @access  Private
exports.logAdherence = async (req, res) => {
  try {
    const { mealsConsumed, remarks } = req.body;
    const assignment = await DietAssignment.findOne({ 
      user: req.user._id, 
      status: 'active' 
    });

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'No active diet plan found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if log for today already exists
    const logIndex = assignment.adherenceLogs.findIndex(
      (log) => new Date(log.date).getTime() === today.getTime()
    );

    if (logIndex !== -1) {
      assignment.adherenceLogs[logIndex].mealsConsumed = mealsConsumed;
      assignment.adherenceLogs[logIndex].remarks = remarks;
    } else {
      assignment.adherenceLogs.push({
        date: today,
        mealsConsumed,
        remarks,
      });
    }

    await assignment.save();
    
    // Populate dietPlan before returning
    await assignment.populate('dietPlan');
    
    res.status(200).json({ success: true, data: assignment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get adherence analytics for a user (Trainer view)
// @route   GET /api/diets/analytics/:userId
// @access  Private (Trainer/Admin)
exports.getUserAdherenceAnalytics = async (req, res) => {
  try {
    const assignment = await DietAssignment.findOne({ 
      user: req.params.userId, 
      status: 'active' 
    }).populate('dietPlan');

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'No active diet plan for this user' });
    }

    res.status(200).json({ success: true, data: assignment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
// @desc    Update a diet plan
// @route   PUT /api/diets/:id
// @access  Private (Trainer/Admin)
exports.updateDietPlan = async (req, res) => {
  try {
    let dietPlan = await DietPlan.findById(req.params.id);

    if (!dietPlan) {
      return res.status(404).json({ success: false, message: 'Diet plan not found' });
    }

    // Make sure user is trainer/admin or the owner
    if (dietPlan.trainer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to update this plan' });
    }

    dietPlan = await DietPlan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: dietPlan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a diet plan
// @route   DELETE /api/diets/:id
// @access  Private (Trainer/Admin)
exports.deleteDietPlan = async (req, res) => {
  try {
    const dietPlan = await DietPlan.findById(req.params.id);

    if (!dietPlan) {
      return res.status(404).json({ success: false, message: 'Diet plan not found' });
    }

    // Make sure user is trainer/admin or the owner
    if (dietPlan.trainer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this plan' });
    }

    await dietPlan.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
