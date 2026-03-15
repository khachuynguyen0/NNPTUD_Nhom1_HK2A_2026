const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', authController.googleLogin);
router.get('/me', verifyToken, authController.getMe);                       // Lay thong tin user hien tai
router.get('/google-client-id', authController.getGoogleClientId);         // Tra ve Google Client ID cho frontend

module.exports = router;

