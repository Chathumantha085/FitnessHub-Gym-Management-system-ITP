const express = require('express');
const router = express.Router();
const { 
  getAvailableTrainers, 
  checkAvailability,
  getBusyDates,
  createBooking, 
  getMyAppointments, 
  getTrainerSchedule, 
  updateBookingStatus,
  rescheduleBooking,
  submitFeedback
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Member Routes
router.get('/trainers', protect, getAvailableTrainers);
router.get('/availability', protect, checkAvailability);
router.get('/busy-dates', protect, getBusyDates);
router.post('/', protect, createBooking);
router.get('/my-appointments', protect, getMyAppointments);
router.patch('/:id/reschedule', protect, rescheduleBooking);
router.post('/:id/feedback', protect, submitFeedback);

// Trainer/Admin Routes
router.get('/schedule', protect, authorize('trainer', 'admin'), getTrainerSchedule);
router.get('/trainer-schedule', protect, authorize('trainer', 'admin'), getTrainerSchedule);
router.patch('/:id/status', protect, authorize('trainer', 'admin'), updateBookingStatus);

module.exports = router;
