const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

// Su dung 1 Google Client ID (Lay tu .env neu co, hoac gia lap)
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '1234567890-test-google-id.apps.googleusercontent.com';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_loan_spa';

// [POST] /api/auth/register
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Kiem tra user da ton tai chua
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Username hoac Email da ton tai' });
        }

        // Ma hoa mat khau
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Mac dinh nguoi dang ky la 'user'
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: 'user',
            points: 0
        });

        await newUser.save();
        console.log(`[Auth] register - Dang ky moi thanh cong: ${username}`);
        res.status(201).json({ success: true, message: 'Dang ky thanh cong' });
    } catch (error) {
        console.error('[Auth] register - Loi:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// [POST] /api/auth/login
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user || user.googleId) {
            // Bao loi chung chung de bao mat, hoac nhac ho dung google login neu googleId ton tai
             return res.status(401).json({ success: false, message: 'Tai khoan hoac mat khau khong dung' });
        }

        // Kiem tra mat khau
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Tai khoan hoac mat khau khong dung' });
        }

        // Tao Token JWT
        const token = jwt.sign(
            { id: user._id, role: user.role, username: user.username },
            JWT_SECRET,
            { expiresIn: '1d' } // Token het han sau 1 ngay
        );

        console.log(`[Auth] login - Tai khoan truy cap: ${username}`);
        res.json({ success: true, token, role: user.role, userId: user._id, username: user.username });
    } catch (error) {
        console.error('[Auth] login - Loi:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// [POST] /api/auth/google
// Frontend gui len `credential` (idToken) nhan tu Google
const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;
        
        // Verify token tu Google
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, sub: googleId } = payload; // 'sub' la ID duy nhat tu gg
        
        // Tim xem thu user nay da co tk chua
        let user = await User.findOne({ email });

        if (user) {
            // Neu da co tk ma chua co googleId -> cap nhat
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
        } else {
            // Chua co thi tao moi auto la user
            user = new User({
                username: email.split('@')[0], // lay doan dau email lam username tam
                email: email,
                googleId: googleId,
                role: 'user',
                points: 0
                // khong can password
            });
            await user.save();
            console.log(`[Auth] googleLogin - Tao moi tai khoan Google: ${email}`);
        }

        // Cap token nhu bt
        const token = jwt.sign(
            { id: user._id, role: user.role, username: user.username },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        console.log(`[Auth] googleLogin - Dang nhap bang Google thanh cong: ${email}`);
        res.json({ success: true, token, role: user.role, userId: user._id, username: user.username });

    } catch (error) {
        console.error('[Auth] googleLogin - Loi:', error.message);
        res.status(401).json({ success: false, message: 'Google Token khong hop le hoac bi loi' });
    }
}

// [GET] /api/auth/me - Lay thong tin user dang dang nhap
const getMe = async (req, res) => {
    try {
        // req.user duoc gan boi verifyToken middleware
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'Khong tim thay nguoi dung' });
        }
        console.log(`[Auth] getMe - Lay thong tin: ${user.username}`);
        res.json({ success: true, data: user });
    } catch (error) {
        console.error('[Auth] getMe - Loi:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// [GET] /api/auth/google-client-id - Tra ve Client ID de frontend dung
const getGoogleClientId = (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    res.json({ clientId }); // Tra ve chuoi rong neu chua cau hinh
};

// ============================================================
// FORGOT PASSWORD: 3 buoc — Gui OTP → Xac nhan OTP → Doi MK
// ============================================================

const { sendOtpEmail } = require('../config/mailer');

// [POST] /api/auth/forgot-password - Buoc 1: Kiem tra email va gui OTP
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: 'Vui long nhap email' });

        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) {
            // Tra loi chung de tranh lo thong tin co email hay khong
            return res.status(404).json({ success: false, message: 'Khong tim thay tai khoan voi email nay' });
        }
        if (user.googleId && !user.password) {
            return res.status(400).json({ success: false, message: 'Tai khoan nay dang nhap bang Google, khong co mat khau de dat lai' });
        }

        // Tao OTP 6 so ngau nhien
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        // OTP het han sau 10 phut
        user.otpCode = otp;
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        // Gui OTP qua email (background - khong await de tra nhanh)
        sendOtpEmail({ toEmail: user.email, otpCode: otp, username: user.username })
            .catch(err => console.error('[Auth] forgotPassword - Loi gui OTP email:', err.message));

        console.log(`[Auth] forgotPassword - Da tao OTP cho: ${user.email}`);
        res.json({ success: true, message: 'Ma OTP da duoc gui toi email cua ban. Kiem tra hop thu!' });
    } catch (err) {
        console.error('[Auth] forgotPassword - Loi:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

// [POST] /api/auth/verify-otp - Buoc 2: Xac nhan ma OTP
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ success: false, message: 'Thieu email hoac ma OTP' });

        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user || !user.otpCode) {
            return res.status(400).json({ success: false, message: 'Ma OTP khong hop le hoac chua gui' });
        }

        // Kiem tra con han khong
        if (new Date() > user.otpExpiry) {
            user.otpCode = null;
            user.otpExpiry = null;
            await user.save();
            return res.status(400).json({ success: false, message: 'Ma OTP da het han. Vui long thu lai' });
        }

        // So sanh OTP
        if (user.otpCode !== otp.trim()) {
            return res.status(400).json({ success: false, message: 'Ma OTP khong chinh xac' });
        }

        console.log(`[Auth] verifyOtp - OTP hop le cho: ${email}`);
        // Tra ve token tam thoi (khong xoa OTP, can cho buoc 3)
        res.json({ success: true, message: 'Xac nhan OTP thanh cong. Hay nhap mat khau moi!' });
    } catch (err) {
        console.error('[Auth] verifyOtp - Loi:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

// [POST] /api/auth/reset-password - Buoc 3: Dat mat khau moi
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ success: false, message: 'Thieu thong tin bat buoc' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Mat khau moi phai co it nhat 6 ky tu' });
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user || !user.otpCode) {
            return res.status(400).json({ success: false, message: 'Phien dat lai mat khau khong hop le. Vui long thu lai tu dau' });
        }
        if (new Date() > user.otpExpiry) {
            user.otpCode = null; user.otpExpiry = null;
            await user.save();
            return res.status(400).json({ success: false, message: 'Ma OTP da het han. Vui long thu lai' });
        }
        if (user.otpCode !== otp.trim()) {
            return res.status(400).json({ success: false, message: 'Ma OTP khong chinh xac' });
        }

        // Hash mat khau moi
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        // Xoa OTP sau khi dung xong
        user.otpCode = null;
        user.otpExpiry = null;
        await user.save();

        console.log(`[Auth] resetPassword - Da doi mat khau cho: ${email}`);
        res.json({ success: true, message: 'Doi mat khau thanh cong! Hay dang nhap lai.' });
    } catch (err) {
        console.error('[Auth] resetPassword - Loi:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { register, login, googleLogin, getMe, getGoogleClientId, forgotPassword, verifyOtp, resetPassword };

