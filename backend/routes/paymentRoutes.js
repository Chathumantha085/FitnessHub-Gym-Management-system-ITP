const express = require('express');
const router = express.Router();
const { 
  recordPayment, 
  confirmPayment, 
  rejectPayment,
  getAllPaymentsAdmin, 
  getMyPayments, 
  getRevenueStats 
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Protected/User routes
router.use(protect);
router.post('/', upload.single('paymentSlip'), recordPayment);
router.get('/my-history', getMyPayments);

// Admin routes
router.use(authorize('admin'));
router.get('/admin', getAllPaymentsAdmin);
router.get('/admin/revenue', getRevenueStats);
router.patch('/admin/:id/confirm', confirmPayment);
router.patch('/admin/:id/reject', rejectPayment);

module.exports = router;
