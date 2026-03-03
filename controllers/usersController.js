// Controller xu ly logic cho Users
const User = require('../models/User');

// [GET] /api/users - Lay tat ca nguoi dung (an truong password)
const getAll = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        console.log(`[Users] getAll - Tim thay ${users.length} nguoi dung`);
        res.json({ success: true, data: users });
    } catch (error) {
        console.error('[Users] getAll - Loi:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// [GET] /api/users/:id - Lay 1 nguoi dung theo id
const getOne = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'Khong tim thay nguoi dung' });
        }
        console.log(`[Users] getOne - Tim thay: ${user.username}`);
        res.json({ success: true, data: user });
    } catch (error) {
        console.error('[Users] getOne - Loi:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// [POST] /api/users - Tao nguoi dung moi
const create = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        // NOTE: trong thuc te nen hash password truoc khi luu (bcrypt)
        const newUser = new User({ username, email, password, role });
        const saved = await newUser.save();
        const result = saved.toObject();
        delete result.password; // khong tra ve password
        console.log(`[Users] create - Da tao nguoi dung: ${saved.username}`);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        console.error('[Users] create - Loi:', error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};

// [PUT] /api/users/:id - Cap nhat nguoi dung
const update = async (req, res) => {
    try {
        const { username, email, role } = req.body;
        const updated = await User.findByIdAndUpdate(
            req.params.id,
            { username, email, role },
            { new: true, runValidators: true }
        ).select('-password');
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Khong tim thay nguoi dung' });
        }
        console.log(`[Users] update - Da cap nhat: ${updated.username}`);
        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('[Users] update - Loi:', error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};

// [DELETE] /api/users/:id - Xoa nguoi dung
const remove = async (req, res) => {
    try {
        const deleted = await User.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Khong tim thay nguoi dung' });
        }
        console.log(`[Users] remove - Da xoa nguoi dung: ${deleted.username}`);
        res.json({ success: true, message: 'Xoa nguoi dung thanh cong' });
    } catch (error) {
        console.error('[Users] remove - Loi:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAll, getOne, create, update, remove };
