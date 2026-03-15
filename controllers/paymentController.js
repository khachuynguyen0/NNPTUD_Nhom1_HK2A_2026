const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Voucher = require('../models/Voucher');

// [POST] /api/payments/pay/:appointmentId - Admin xac nhan thanh toan + cong diem
const payAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Khong tim thay lich hen' });
        }

        if (appointment.paymentStatus === 'paid') {
            return res.status(400).json({ success: false, message: 'Lich hen nay da duoc thanh toan' });
        }

        // 1. Danh dau la da thanh toan
        appointment.paymentStatus = 'paid';
        appointment.status = 'confirmed';
        await appointment.save();

        // 2. Cong diem cho user (ti le: 10000 VND = 1 diem)
        let pointsEarned = 0;
        if (appointment.userId && appointment.totalAmount > 0) {
            pointsEarned = Math.floor(appointment.totalAmount / 10000);
            const user = await User.findById(appointment.userId);
            if (user) {
                user.points += pointsEarned;
                await user.save();
                console.log(`[Payment] Da cong ${pointsEarned} diem cho user: ${user.username}`);
            }
        }

        console.log(`[Payment] payAppointment - Thanh toan don: ${appointmentId}, Diem thuong: ${pointsEarned}`);
        res.json({
            success: true,
            message: 'Thanh toan thanh cong',
            data: appointment,
            pointsEarned
        });
    } catch (error) {
        console.error('[Payment] payAppointment - Loi:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// [POST] /api/payments/redeem-voucher - User dung diem doi voucher
const redeemVoucher = async (req, res) => {
    try {
        const userId = req.user.id;
        const { voucherCode } = req.body;

        // 1. Tim voucher trong he thong
        const voucher = await Voucher.findOne({ code: voucherCode.toUpperCase(), isActive: true });
        if (!voucher) {
            return res.status(404).json({ success: false, message: 'Voucher khong ton tai hoac da het han' });
        }

        // 2. Kiem tra user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Khong tim thay nguoi dung' });
        }

        // 3. Kiem tra du diem
        if (user.points < voucher.pointCost) {
            return res.status(400).json({
                success: false,
                message: `Ban can it nhat ${voucher.pointCost} diem. Ban dang co ${user.points} diem`
            });
        }

        // 4. Kiem tra da co voucher nay chua (tranh doi trung)
        const alreadyHas = user.vouchers.some(v => v.code === voucher.code && !v.isUsed);
        if (alreadyHas) {
            return res.status(400).json({ success: false, message: 'Ban da co ma nay va chua su dung' });
        }

        // 5. Tru diem va them voucher vao vi user
        user.points -= voucher.pointCost;
        user.vouchers.push({
            code: voucher.code,
            discount: voucher.discountAmount,
            isUsed: false
        });
        await user.save();

        console.log(`[Payment] redeemVoucher - User ${user.username} doi ${voucher.code}. Diem con lai: ${user.points}`);
        res.json({
            success: true,
            message: 'Doi ma giam gia thanh cong!',
            voucher: voucher.code,
            discount: voucher.discountAmount,
            pointsRemaining: user.points
        });
    } catch (error) {
        console.error('[Payment] redeemVoucher - Loi:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// [GET] /api/payments/vouchers - Lay danh sach voucher he thong (tat ca co the xem)
const getVouchers = async (req, res) => {
    try {
        const vouchers = await Voucher.find({ isActive: true }).sort({ pointCost: 1 });
        console.log(`[Payment] getVouchers - Tim thay ${vouchers.length} voucher`);
        res.json({ success: true, data: vouchers });
    } catch (error) {
        console.error('[Payment] getVouchers - Loi:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// [GET] /api/payments/vouchers/all - Admin: lay tat ca voucher (ca inactive)
const getAllVouchers = async (req, res) => {
    try {
        const vouchers = await Voucher.find().sort({ createdAt: -1 });
        console.log(`[Payment] getAllVouchers - Tim thay ${vouchers.length} voucher`);
        res.json({ success: true, data: vouchers });
    } catch (error) {
        console.error('[Payment] getAllVouchers - Loi:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// [POST] /api/payments/vouchers - Admin tao voucher moi
const createVoucher = async (req, res) => {
    try {
        const { code, discountAmount, pointCost, description } = req.body;

        // Kiem tra da ton tai chua
        const existing = await Voucher.findOne({ code: code.toUpperCase() });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Ma voucher nay da ton tai' });
        }

        const voucher = new Voucher({ code, discountAmount, pointCost, description });
        await voucher.save();

        console.log(`[Payment] createVoucher - Da tao voucher: ${voucher.code}`);
        res.status(201).json({ success: true, data: voucher });
    } catch (error) {
        console.error('[Payment] createVoucher - Loi:', error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};

// [PUT] /api/payments/vouchers/:code - Admin cap nhat voucher
const updateVoucher = async (req, res) => {
    try {
        const { code } = req.params;
        const { discountAmount, pointCost, description, isActive } = req.body;

        const voucher = await Voucher.findOneAndUpdate(
            { code: code.toUpperCase() },
            { discountAmount, pointCost, description, isActive },
            { new: true, runValidators: true }
        );
        if (!voucher) {
            return res.status(404).json({ success: false, message: 'Khong tim thay voucher' });
        }

        console.log(`[Payment] updateVoucher - Da cap nhat: ${voucher.code}`);
        res.json({ success: true, data: voucher });
    } catch (error) {
        console.error('[Payment] updateVoucher - Loi:', error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};

// [DELETE] /api/payments/vouchers/:code - Admin xoa voucher
const deleteVoucher = async (req, res) => {
    try {
        const { code } = req.params;
        const deleted = await Voucher.findOneAndDelete({ code: code.toUpperCase() });
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Khong tim thay voucher' });
        }
        console.log(`[Payment] deleteVoucher - Da xoa: ${code}`);
        res.json({ success: true, message: 'Xoa voucher thanh cong' });
    } catch (error) {
        console.error('[Payment] deleteVoucher - Loi:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// [POST] /api/payments/add-points - Admin cong diem thu cong cho user
const addPoints = async (req, res) => {
    try {
        const { userId, points, reason } = req.body;

        if (!userId || !points || points <= 0) {
            return res.status(400).json({ success: false, message: 'userId va so diem (>0) la bat buoc' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Khong tim thay nguoi dung' });
        }

        user.points += Number(points);
        await user.save();

        console.log(`[Payment] addPoints - Admin cong ${points} diem cho ${user.username}. Ly do: ${reason || 'Khong ro'}`);
        res.json({
            success: true,
            message: `Da cong ${points} diem cho ${user.username}`,
            pointsTotal: user.points
        });
    } catch (error) {
        console.error('[Payment] addPoints - Loi:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    payAppointment,
    redeemVoucher,
    getVouchers,
    getAllVouchers,
    createVoucher,
    updateVoucher,
    deleteVoucher,
    addPoints
};
