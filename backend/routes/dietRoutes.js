const express = require('express');
const router = express.Router();
const { 
  createDietPlan, 
  getTrainerDietPlans, 
  assignDietPlan, 
  getMyDietPlan, 
  logAdherence,
  getUserAdherenceAnalytics,
  updateDietPlan,
  deleteDietPlan
} = require('../controllers/dietController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Member Routes
router.get('/my-plan', protect, getMyDietPlan);
router.post('/log', protect, logAdherence);

// Trainer/Admin Routes
router.post('/', protect, authorize('trainer', 'admin'), createDietPlan);
router.get('/', protect, authorize('trainer', 'admin'), getTrainerDietPlans);
router.get('/all', protect, authorize('trainer', 'admin'), getTrainerDietPlans);
router.post('/assign', protect, authorize('trainer', 'admin'), assignDietPlan);
router.get('/analytics/:userId', protect, authorize('trainer', 'admin'), getUserAdherenceAnalytics);
router.put('/:id', protect, authorize('trainer', 'admin'), updateDietPlan);
router.delete('/:id', protect, authorize('trainer', 'admin'), deleteDietPlan);

module.exports = router;
