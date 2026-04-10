const express = require('express');
const router = express.Router();
const { markAttendance, getUserAttendance, getTodayAttendance, scanAttendance } = require('../controllers/attendanceController');

// @route   PATCH /api/attendance/mark/:userId
router.patch('/mark/:userId', markAttendance);

// @route   GET /api/attendance/scan/:userId
router.get('/scan/:userId', scanAttendance);

// @route   GET /api/attendance/user/:userId
router.get('/user/:userId', getUserAttendance);

// @route   GET /api/attendance/today
router.get('/today', getTodayAttendance);

module.exports = router;
