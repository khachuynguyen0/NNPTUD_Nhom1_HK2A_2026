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
