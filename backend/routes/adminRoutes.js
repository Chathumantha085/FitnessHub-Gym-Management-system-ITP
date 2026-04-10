const express = require('express');
const router = express.Router();
const { 
  getUsers, 
  approveUser, 
  updateUser, 
  deleteUser, 
  generateMemberQR,
  getTrainers,
  createTrainer,
  updateTrainer,
  deleteTrainer,
  getTrainerEarnings
} = require('../controllers/adminController');
const { protect, adminOnly, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Routes accessible by both Admin and Trainer
router.get('/users', authorize('admin', 'trainer'), getUsers);

// Admin-only routes
router.patch('/approve/:id', adminOnly, approveUser);
router.put('/users/:id', adminOnly, updateUser);
router.delete('/users/:id', adminOnly, deleteUser);
router.post('/users/:id/qr', adminOnly, generateMemberQR);

// Trainer management routes (Admin only)
router.get('/trainers', adminOnly, getTrainers);
router.post('/trainers', adminOnly, createTrainer);
router.put('/trainers/:id', adminOnly, updateTrainer);
router.delete('/trainers/:id', adminOnly, deleteTrainer);
router.get('/trainers/:id/earnings', authorize('admin', 'trainer'), getTrainerEarnings);

module.exports = router;
