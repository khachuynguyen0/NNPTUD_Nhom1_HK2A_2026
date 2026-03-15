// Schema nguoi dung
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true, // khong trung ten
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: false, // khong bat buoc (neu dang nhap Google)
        },
        googleId: {
            type: String,
            default: null, // Danh cho tai khoan dang nhap bang Google
        },
        role: {
            type: String,
            enum: ['admin', 'user'],  // chi chap nhan 2 gia tri nay
            default: 'user',
        },
        points: {
            type: Number,
            default: 0, // 10000 VND = 1 diem
        },
        vouchers: [{
            code: String,
            discount: Number,      // gia tri giam gia
            redeemedAt: { type: Date, default: Date.now },
            isUsed: { type: Boolean, default: false }
        }],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('User', userSchema);
