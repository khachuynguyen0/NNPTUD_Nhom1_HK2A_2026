const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', authController.googleLogin);
router.get('/me', verifyToken, authController.getMe);                       // Lay thong tin user hien tai
router.get('/google-client-id', authController.getGoogleClientId);         // Tra ve Google Client ID cho frontend

// Routes quan len mat khau: 3 buoc
router.post('/forgot-password', authController.forgotPassword);             // Buoc 1: gui OTP
router.post('/verify-otp', authController.verifyOtp);                       // Buoc 2: xac nhan OTP
router.post('/reset-password', authController.resetPassword);               // Buoc 3: doi mat khau moi

module.exports = router;

