const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendRegistrationConfirm } = require('../utils/emailService');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, contactNumber, address } = req.body;
    let paymentSlipUrl = '';

    if (req.file) {
      paymentSlipUrl = `/uploads/${req.file.filename}`;
    } else {
      return res.status(400).json({ success: false, message: 'Please upload a payment slip' });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      contactNumber,
      address,
      paymentSlipUrl,
      status: 'pending',
      isApproved: false,
    });

    // Send confirmation email
    await sendRegistrationConfirm(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Check your email for confirmation.',
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.role !== 'admin') {
      if (user.status === 'pending') {
        return res.status(403).json({
          success: false,
          message: 'Your account is pending approval. Please contact the administrator.',
        });
      }

      if (user.status === 'rejected') {
        return res.status(403).json({
          success: false,
          message: `Your account registration was rejected. Reason: ${user.rejectReason || 'No reason provided.'}`,
        });
      }

      if (user.status === 'deactivated') {
        return res.status(403).json({
          success: false,
          message: 'Your account is deactivated. Please contact the administrator.',
        });
      }
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '30d',
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        rejectReason: user.rejectReason,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      contactNumber: req.body.contactNumber,
      address: req.body.address,
    };

    const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Deactivate user account
// @route   DELETE /api/auth/deactivate
// @access  Private
exports.deactivateAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = 'deactivated';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Account deactivated successfully',
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
