const User = require('../models/User');
const { sendApprovalEmail, sendRejectionEmail, sendMemberQR, sendTrainerWelcome } = require('../utils/emailService');
const QRCode = require('qrcode');

// @desc    Get all users for approval
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('+password'); // select all fields
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Approve/Reject user
// @route   PATCH /api/admin/approve/:id
// @access  Private/Admin
exports.approveUser = async (req, res) => {
  try {
    const { status, rejectReason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (status === 'approved') {
      user.status = 'approved';
      user.isApproved = true;
      user.rejectReason = '';
    } else if (status === 'rejected') {
      user.status = 'rejected';
      user.isApproved = false;
      user.rejectReason = rejectReason || 'No reason provided';
    }

    await user.save();

    // Send notification email
    if (status === 'approved') {
      await sendApprovalEmail(user);
    } else if (status === 'rejected') {
      await sendRejectionEmail(user, user.rejectReason);
    }

    res.status(200).json({ 
      success: true, 
      message: `User ${status} successfully`,
      data: user
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Generate and Send Member QR Code
// @route   POST /api/admin/users/:id/qr
// @access  Private/Admin
exports.generateMemberQR = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Define QR data: Backend Scan URL
    const backendUrl = 'https://tan-salamander-545528.hostingersite.com';
    const qrText = `${backendUrl}/api/attendance/scan/${user._id}`;
    const qrDataUrl = await QRCode.toDataURL(qrText, {
      color: {
        dark: '#0f172a',  // Dark blue matching brand
        light: '#ffffff', // White bg
      },
      width: 400,
      margin: 2,
    });

    // Send Email with QR
    const emailSent = await sendMemberQR(user, qrDataUrl);

    if (!emailSent) {
      return res.status(500).json({ success: false, message: 'QR generated but email failed to send.' });
    }

    res.status(200).json({ success: true, message: 'QR Code generated and sent to member email successfully!' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all trainers
// @route   GET /api/admin/trainers
// @access  Private/Admin
exports.getTrainers = async (req, res) => {
  try {
    const trainers = await User.find({ role: 'trainer' });
    res.status(200).json({ success: true, count: trainers.length, data: trainers });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Create a trainer
// @route   POST /api/admin/trainers
// @access  Private/Admin
exports.createTrainer = async (req, res) => {
  try {
    const { name, email, contactNumber, address, hourlyRate, yearsExperience, specialization } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Auto-generate password (6 chars)
    const generatedPassword = Math.random().toString(36).slice(-6);

    const trainer = await User.create({
      name,
      email,
      password: generatedPassword,
      contactNumber,
      address,
      role: 'trainer',
      status: 'approved', // Trainers are pre-approved
      isApproved: true,
      hourlyRate: hourlyRate || 0,
      yearsExperience: yearsExperience || 0,
      specialization: specialization || '',
    });

    // Send credentials via email
    await sendTrainerWelcome(trainer, generatedPassword);

    res.status(201).json({ 
      success: true, 
      message: 'Trainer created and credentials emailed successfully!',
      data: trainer 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update a trainer
// @route   PUT /api/admin/trainers/:id
// @access  Private/Admin
exports.updateTrainer = async (req, res) => {
  try {
    const trainer = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }

    res.status(200).json({ success: true, data: trainer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a trainer
// @route   DELETE /api/admin/trainers/:id
// @access  Private/Admin
exports.deleteTrainer = async (req, res) => {
  try {
    const trainer = await User.findByIdAndDelete(req.params.id);

    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }

    res.status(200).json({ success: true, message: 'Trainer deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get trainer earnings report
// @route   GET /api/admin/trainers/:id/earnings
// @access  Private/Admin
exports.getTrainerEarnings = async (req, res) => {
  try {
    // Security check: Trainer can only see their own earnings
    if (req.user.role === 'trainer' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Authorization denied: Cannot access other trainers earnings' });
    }

    const sessions = await Booking.find({ 
      trainer: req.params.id,
      status: 'completed'
    }).populate('user', 'name email');

    const totalEarnings = sessions.reduce((sum, s) => sum + (s.priceAtBooking || 0), 0);

    res.status(200).json({ 
      success: true, 
      data: {
        sessionsCount: sessions.length,
        totalEarnings,
        sessions
      } 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
