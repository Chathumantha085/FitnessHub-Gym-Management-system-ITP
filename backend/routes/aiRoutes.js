const express = require('express');
const router = express.Router();
const { getDietAdvice } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// Member Routes for AI Chat
router.post('/chat', protect, getDietAdvice);

module.exports = router;
