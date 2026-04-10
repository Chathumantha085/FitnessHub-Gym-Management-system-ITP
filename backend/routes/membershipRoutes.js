const express = require('express');
const router = express.Router();
const { 
  getPlans, 
  getAllPlansAdmin, 
  createPlan, 
  updatePlan, 
  togglePlanStatus, 
  deletePlan,
  getMySubscription
} = require('../controllers/membershipController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/plans', getPlans);

// Protected routes
router.get('/me', protect, getMySubscription);

// Admin routes
router.use(protect);
router.use(authorize('admin'));

router.get('/admin/plans', getAllPlansAdmin);
router.post('/admin/plans', createPlan);
router.put('/admin/plans/:id', updatePlan);
router.patch('/admin/plans/:id/toggle', togglePlanStatus);
router.delete('/admin/plans/:id', deletePlan);

module.exports = router;
