// Schema Voucher
const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true, // vi du: GIAM10K
        },
        discountAmount: {
            type: Number,
            required: true, // So tien giam (vd: 10000, 20000)
        },
        pointCost: {
            type: Number,
            required: true, // So diem can de doi (vd: 1 diem)
        },
        description: {
            type: String,
            default: '',
        },
        isActive: {
            type: Boolean,
            default: true,
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Voucher', voucherSchema);
