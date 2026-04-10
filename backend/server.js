const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

// Ensure uploads directory exists
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

const User = require('./models/User');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.send('Gym Management System API is running...');
});

// Auth Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Admin Routes
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

// Attendance Routes
const attendanceRoutes = require('./routes/attendanceRoutes');
app.use('/api/attendance', attendanceRoutes);

// Membership Routes
const membershipRoutes = require('./routes/membershipRoutes');
app.use('/api/membership', membershipRoutes);

// Payment Routes
const paymentRoutes = require('./routes/paymentRoutes');
app.use('/api/payments', paymentRoutes);

// Diet & Nutrition Routes
const dietRoutes = require('./routes/dietRoutes');
app.use('/api/diets', dietRoutes);

// Booking Routes
const bookingRoutes = require('./routes/bookingRoutes');
app.use('/api/bookings', bookingRoutes);

// AI Chat Routes
const aiRoutes = require('./routes/aiRoutes');
app.use('/api/ai', aiRoutes);

// Basic Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gym_management';

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('Successfully connected to MongoDB.');

    // Seed Admin Account
    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'admin';
    const adminUser = await User.findOne({ email: adminEmail });

    if (!adminUser) {
      await User.create({
        name: 'Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isApproved: true,
        contactNumber: '0000000000',
        address: 'Admin Office',
        paymentSlipUrl: '/uploads/admin_default.png',
      });
      console.log(`Default Admin Account Created: ${adminEmail} / ${adminPassword}`);
    } else {
      // Ensure existing admin has the correct password and role
      adminUser.password = adminPassword;
      adminUser.role = 'admin';
      adminUser.isApproved = true;
      // Also provide defaults if missing to avoid validation error on save
      if (!adminUser.contactNumber) adminUser.contactNumber = '0000000000';
      if (!adminUser.address) adminUser.address = 'Admin Office';
      if (!adminUser.paymentSlipUrl) adminUser.paymentSlipUrl = '/uploads/admin_default.png';
      
      await adminUser.save();
      console.log(`Admin Account Updated: ${adminEmail} / ${adminPassword}`);
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
      
      // Initialize Cron Jobs
      const initCronJobs = require('./utils/cronJob');
      initCronJobs();
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
  });
