// Controller xu ly logic cho Products
const Product = require('../models/Product');

// [GET] /api/products - Lay tat ca san pham (co the loc theo category)
const getAll = async (req, res) => {
    try {
        const filter = {};
        if (req.query.categoryId) {
            filter.categoryId = req.query.categoryId;
        }
        const products = await Product.find(filter)
            .populate('categoryId', 'name') // lay ten category kem theo
            .sort({ createdAt: -1 });
        console.log(`[Products] getAll - Tim thay ${products.length} san pham`);
        res.json({ success: true, data: products });
    } catch (error) {
        console.error('[Products] getAll - Loi:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// [GET] /api/products/:id - Lay 1 san pham theo id
const getOne = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('categoryId', 'name');
        if (!product) {
            return res.status(404).json({ success: false, message: 'Khong tim thay san pham' });
        }
        console.log(`[Products] getOne - Tim thay: ${product.name}`);
        res.json({ success: true, data: product });
    } catch (error) {
        console.error('[Products] getOne - Loi:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// [POST] /api/products - Tao san pham moi
const create = async (req, res) => {
    try {
        const { name, price, description, image, categoryId } = req.body;
        const newProduct = new Product({ name, price, description, image, categoryId });
        const saved = await newProduct.save();
        console.log(`[Products] create - Da tao: ${saved.name}`);
        res.status(201).json({ success: true, data: saved });
    } catch (error) {
        console.error('[Products] create - Loi:', error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};

// [PUT] /api/products/:id - Cap nhat san pham
const update = async (req, res) => {
    try {
        const { name, price, description, image, categoryId } = req.body;
        const updated = await Product.findByIdAndUpdate(
            req.params.id,
            { name, price, description, image, categoryId },
            { new: true, runValidators: true }
        );
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Khong tim thay san pham' });
        }
        console.log(`[Products] update - Da cap nhat: ${updated.name}`);
        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('[Products] update - Loi:', error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};

// [DELETE] /api/products/:id - Xoa san pham
const remove = async (req, res) => {
    try {
        const deleted = await Product.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Khong tim thay san pham' });
        }
        console.log(`[Products] remove - Da xoa: ${deleted.name}`);
        res.json({ success: true, message: 'Xoa san pham thanh cong' });
    } catch (error) {
        console.error('[Products] remove - Loi:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAll, getOne, create, update, remove };
