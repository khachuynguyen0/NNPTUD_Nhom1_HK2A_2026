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
        res.json({ success: true, token, role: user.role, userId: user._id });

    } catch (error) {
        console.error('[Auth] googleLogin - Loi:', error.message);
        res.status(401).json({ success: false, message: 'Google Token khong hop le hoac bi loi' });
    }
}

module.exports = { register, login, googleLogin };
