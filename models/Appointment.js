// Schema lich hen cua khach hang
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
    {
        // Ten khach hang
        customerName: {
            type: String,
            required: true,
            trim: true,
        },
        // So dien thoai
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        // Email khach hang (de gui thong bao xac nhan)
        email: {
            type: String,
            default: '',
            trim: true,
        },
        // Dich vu duoc chon (lien ket voi Product)
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        // Ngay va gio hen
        appointmentDate: {
            type: Date,
            required: true,
        },
        // Ghi chu them
        note: {
            type: String,
            default: '',
        },
        // Nguoi dung (User) da dat lich (co the null neu khach vang lai chua dang nhap)
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
        // Tong tien (gia cua dich vu luc dat)
        totalAmount: {
            type: Number,
            default: 0,
        },
        // Trang thai thanh toan
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid'],
            default: 'pending',
        },
        // Trang thai lich hen
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'done', 'cancelled'],
            default: 'pending',
        },
    },
    {
        timestamps: true, // tu dong them createdAt va updatedAt
    }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
