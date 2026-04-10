const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 5,
      select: false,
    },
    contactNumber: {
      type: String,
      required: [true, 'Please add a contact number'],
    },
    address: {
      type: String,
      required: [true, 'Please add an address'],
    },
    paymentSlipUrl: {
      type: String,
      default: '', // Not required for all roles (e.g. trainers/admins)
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'deactivated'],
      default: 'pending',
    },
    rejectReason: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'trainer'],
      default: 'user',
    },
    // Keep isApproved for backward compatibility if needed, but derived from status
    isApproved: {
      type: Boolean,
      default: false,
    },
    // Trainer/Staff specific fields
    specialization: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    hourlyRate: {
      type: Number,
      default: 0,
    },
    yearsExperience: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
