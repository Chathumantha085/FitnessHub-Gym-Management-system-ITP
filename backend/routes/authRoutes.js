const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, deactivateAccount } = require('../controllers/authController');
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', upload.single('paymentSlip'), register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.delete('/deactivate', protect, deactivateAccount);

module.exports = router;
