const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    userType: {
        type: String,
        enum: ['admin', 'trainer', 'user'],
        default: 'user'
    },
    phone: {
    type: String,
    required: true,
    trim: true,
    validate: {
        validator: function(v) {
            return /^\d{10}$/.test(v);
        },
        message: "Phone number must be exactly 10 digits"
    }
},
    dateOfBirth: {
        type: Date
    },
    specialization: {
        type: String,
        trim: true
    },
    experience: {
        type: Number,
        default: 0
    },
    /*membershipType: {
        type: String,
        trim: true
    },*/
    isActive: {
        type: Boolean,
        default: true
    },
    isApproved: {
        type: Boolean,
        default: function() {
            return this.userType !== 'trainer'; // Auto-approve non-trainers
        }
    },
    approvedAt: {
        type: Date
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
     timestamps: String
},
   
);

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);