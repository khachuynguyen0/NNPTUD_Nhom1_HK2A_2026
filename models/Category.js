// Schema danh muc san pham
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,  // bat buoc
            trim: true,
        },
        description: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true, // tu dong them createdAt va updatedAt
    }
);

module.exports = mongoose.model('Category', categorySchema);
