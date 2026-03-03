// Controller xu ly logic cho Categories
const Category = require('../models/Category');
const Product = require('../models/Product');

// [GET] /api/categories - Lay tat ca danh muc
const getAll = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        console.log(`[Categories] getAll - Tim thay ${categories.length} danh muc`);
        res.json({ success: true, data: categories });
    } catch (error) {
        console.error('[Categories] getAll - Loi:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// [GET] /api/categories/:id - Lay 1 danh muc theo id
const getOne = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Khong tim thay danh muc' });
        }
        console.log(`[Categories] getOne - Tim thay: ${category.name}`);
        res.json({ success: true, data: category });
    } catch (error) {
        console.error('[Categories] getOne - Loi:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// [POST] /api/categories - Tao danh muc moi
const create = async (req, res) => {
    try {
        const { name, description } = req.body;
        const newCategory = new Category({ name, description });
        const saved = await newCategory.save();
        console.log(`[Categories] create - Da tao: ${saved.name}`);
        res.status(201).json({ success: true, data: saved });
    } catch (error) {
        console.error('[Categories] create - Loi:', error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};

// [PUT] /api/categories/:id - Cap nhat danh muc
const update = async (req, res) => {
    try {
        const { name, description } = req.body;
        const updated = await Category.findByIdAndUpdate(
            req.params.id,
            { name, description },
            { new: true, runValidators: true } // tra ve du lieu moi sau khi update
        );
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Khong tim thay danh muc' });
        }
        console.log(`[Categories] update - Da cap nhat: ${updated.name}`);
        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('[Categories] update - Loi:', error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};

// [DELETE] /api/categories/:id - Xoa danh muc
const remove = async (req, res) => {
    try {
        const deleted = await Category.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Khong tim thay danh muc' });
        }
        console.log(`[Categories] remove - Da xoa: ${deleted.name}`);
        res.json({ success: true, message: 'Xoa danh muc thanh cong' });
    } catch (error) {
        console.error('[Categories] remove - Loi:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// [GET] /api/categories/:id/products - Lay san pham thuoc danh muc nay
const getProducts = async (req, res) => {
    try {
        const products = await Product.find({ categoryId: req.params.id }).sort({ createdAt: -1 });
        console.log(`[Categories] getProducts - Tim thay ${products.length} san pham`);
        res.json({ success: true, data: products });
    } catch (error) {
        console.error('[Categories] getProducts - Loi:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAll, getOne, create, update, remove, getProducts };
