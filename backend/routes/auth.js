const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/request-otp', authController.requestOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/google-signin', authController.googleSignIn);
router.post('/add-phone', auth, authController.addPhoneNumber);

module.exports = router;