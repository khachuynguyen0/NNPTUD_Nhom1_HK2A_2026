const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_loan_spa';

// Middleware kiem tra token hop le duoc truyen o header
const verifyToken = (req, res, next) => {
    // Thuong token se gui trong header: Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập để sử dụng chức năng này' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Dinh truc tiep thong tin user vao request de dung o controller
        next(); // Chuyen tiep cho controller
    } catch (error) {
        console.error('[AuthMiddleware] verifyToken - Loi:', error.message);
        return res.status(401).json({ success: false, message: 'Token khong hop le hoac da het han' });
    }
};

// Middleware kiem tra quyen Admin (Phai dung sau verifyToken)
const verifyAdmin = (req, res, next) => {
    // req.user co duoc do da check verifyToken truoc do
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ success: false, message: 'Ban khong co quyen Admin de thuc hien chuc nang nay' });
    }
};

module.exports = { verifyToken, verifyAdmin };
