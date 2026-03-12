// Schema san pham
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
            default: 0,
        },
        description: {
            type: String,
            default: '',
        },
        image: {
            type: String,
            default: '',
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: false, // Thay doi thanh false hoac xoa de loai bo danh muc
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Product', productSchema);
