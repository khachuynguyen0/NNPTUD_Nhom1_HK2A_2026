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
        // Danh sach dich vu duoc chon (nhieu dich vu, lien ket voi Product)
        services: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
            required: true,
            validate: {
                validator: function (v) { return v && v.length > 0; },
                message: 'Phai chon it nhat 1 dich vu'
            }
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
        // Tong tien truoc giam gia
        totalAmount: {
            type: Number,
            default: 0,
        },
        // Ma voucher duoc ap dung (neu co)
        voucherCode: {
            type: String,
            default: '',
        },
        // So tien duoc giam gia
        discountAmount: {
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
