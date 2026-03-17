const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Voucher = require('../models/Voucher');

// [POST] /api/payments/pay/:appointmentId - Admin xac nhan thanh toan + ap dung voucher + cong diem
const payAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { voucherCode, userEmail } = req.body; // admin co the gui kem voucher va email khach

        const appointment = await Appointment.findById(appointmentId)
            .populate('services', 'name price');

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Khong tim thay lich hen' });
        }

        if (appointment.paymentStatus === 'paid') {
            return res.status(400).json({ success: false, message: 'Lich hen nay da duoc thanh toan' });
        }

        // 1. Xu ly voucher (neu admin nhap email khach va ma voucher)
        let appliedVoucherCode = appointment.voucherCode || '';
        let discountAmount = appointment.discountAmount || 0;

        if (voucherCode && voucherCode.trim() !== '') {
            // Tim user theo email de lay voucher
            let targetUser = null;
            if (userEmail && userEmail.trim() !== '') {
                targetUser = await User.findOne({ email: userEmail.trim().toLowerCase() });
            } else if (appointment.userId) {
                targetUser = await User.findById(appointment.userId);
            }

            if (targetUser) {
                const voucherIdx = targetUser.vouchers.findIndex(
                    v => v.code === voucherCode.trim().toUpperCase() && !v.isUsed
                );
                if (voucherIdx !== -1) {
                    discountAmount = targetUser.vouchers[voucherIdx].discount;
                    appliedVoucherCode = targetUser.vouchers[voucherIdx].code;
                    // Danh dau voucher da duoc su dung
                    targetUser.vouchers[voucherIdx].isUsed = true;
                    await targetUser.save();
                    console.log(`[Payment] payAppointment - Ap dung voucher ${appliedVoucherCode}, giam: ${discountAmount}`);
                } else {
                    return res.status(400).json({ success: false, message: 'Voucher khong hop le hoac da duoc su dung' });
                }
            } else {
                return res.status(404).json({ success: false, message: 'Khong tim thay tai khoan khach hang' });
            }
        }

        // 2. Tinh tong tien sau giam gia
        const baseAmount = appointment.services
            ? appointment.services.reduce((sum, s) => sum + (s.price || 0), 0)
            : appointment.totalAmount;
        const finalAmount = Math.max(0, baseAmount - discountAmount);

        // 3. Cap nhat lich hen
        appointment.paymentStatus = 'paid';
        appointment.status = 'done';
        appointment.voucherCode = appliedVoucherCode;
        appointment.discountAmount = discountAmount;
        appointment.totalAmount = finalAmount;
        await appointment.save();

        // 4. Cong diem cho user (ti le: 100000 VND = 1 diem)
        let pointsEarned = 0;
        const userId = appointment.userId;
        if (userId && finalAmount > 0) {
            pointsEarned = Math.floor(finalAmount / 100000);
            const user = await User.findById(userId);
            if (user) {
                user.points += pointsEarned;
                await user.save();
                console.log(`[Payment] Da cong ${pointsEarned} diem cho user: ${user.username}`);
            }
        }

        console.log(`[Payment] payAppointment - Thanh toan don: ${appointmentId}, Tong: ${finalAmount}, Diem thuong: ${pointsEarned}`);
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

// [GET] /api/payments/invoices - Admin lay danh sach hoa don da thanh toan
const getInvoices = async (req, res) => {
    try {
        const list = await Appointment.find({ paymentStatus: 'paid' })
            .populate('services', 'name price')
            .populate('userId', 'username email')
            .sort({ updatedAt: -1 }); // moi nhat len tren
        console.log(`[Payment] getInvoices - Tim thay ${list.length} hoa don da thanh toan`);
        res.json({ success: true, data: list });
    } catch (error) {
        console.error('[Payment] getInvoices - Loi:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// [POST] /api/payments/walkin - Admin tao hoa don truc tiep cho khach vang lai (walk-in)
const createWalkInPayment = async (req, res) => {
    try {
        const { items, discountPercent, voucherCode, userEmail, customerName, phone } = req.body;
        const Product = require('../models/Product');

        // 1. Kiem tra du lieu dau vao
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Phai chon it nhat 1 dich vu' });
        }

        // 2. Lay thong tin gia cac dich vu tu DB
        const serviceIds = items.map(i => i.serviceId);
        const serviceList = await Product.find({ _id: { $in: serviceIds } });

        if (serviceList.length === 0) {
            return res.status(404).json({ success: false, message: 'Khong tim thay dich vu nao hop le' });
        }

        // 3. Tinh tong tien (gia x so luong)
        let baseTotal = 0;
        const serviceMap = {}; // serviceId -> price
        serviceList.forEach(s => { serviceMap[s._id.toString()] = s; });

        // Tao mang services (co the trung ID neu so luong > 1)
        const servicesArr = [];
        items.forEach(item => {
            const svc = serviceMap[item.serviceId];
            if (svc) {
                const qty = Math.max(1, parseInt(item.quantity) || 1);
                baseTotal += svc.price * qty;
                for (let i = 0; i < qty; i++) {
                    servicesArr.push(svc._id);
                }
            }
        });

        console.log(`[Payment] createWalkInPayment - Tong goc: ${baseTotal}, So luong item: ${servicesArr.length}`);

        // 4. Ap dung % giam gia (neu co)
        let discountByPercent = 0;
        const pct = parseFloat(discountPercent) || 0;
        if (pct > 0 && pct <= 100) {
            discountByPercent = Math.round(baseTotal * pct / 100);
        }

        // 5. Ap dung voucher (neu co email va ma voucher)
        let appliedVoucherCode = '';
        let discountByVoucher = 0;
        let linkedUserId = null;

        if (voucherCode && voucherCode.trim() !== '' && userEmail && userEmail.trim() !== '') {
            const targetUser = await User.findOne({ email: userEmail.trim().toLowerCase() });
            if (!targetUser) {
                return res.status(404).json({ success: false, message: 'Khong tim thay tai khoan voi email: ' + userEmail });
            }
            const vIdx = targetUser.vouchers.findIndex(
                v => v.code === voucherCode.trim().toUpperCase() && !v.isUsed
            );
            if (vIdx === -1) {
                return res.status(400).json({ success: false, message: 'Voucher khong hop le hoac da duoc su dung' });
            }
            discountByVoucher = targetUser.vouchers[vIdx].discount;
            appliedVoucherCode = targetUser.vouchers[vIdx].code;
            targetUser.vouchers[vIdx].isUsed = true;
            await targetUser.save();
            linkedUserId = targetUser._id;
            console.log(`[Payment] createWalkInPayment - Ap dung voucher: ${appliedVoucherCode}, giam: ${discountByVoucher}`);
        } else if (userEmail && userEmail.trim() !== '') {
            // Chi tim user de cong diem, khong dung voucher
            const targetUser = await User.findOne({ email: userEmail.trim().toLowerCase() });
            if (targetUser) linkedUserId = targetUser._id;
        }

        // 6. Tinh thanh tien cuoi
        const totalDiscount = discountByPercent + discountByVoucher;
        const finalAmount = Math.max(0, baseTotal - totalDiscount);
        console.log(`[Payment] createWalkInPayment - Giam %: ${discountByPercent}, Giam voucher: ${discountByVoucher}, Thanh tien: ${finalAmount}`);

        // 7. Luu hoa don (Appointment) voi trang thai done + paid
        const invoice = new Appointment({
            customerName: (customerName || 'Khach vang lai').trim(),
            phone: (phone || '---').trim(),
            email: userEmail || '',
            services: servicesArr,
            appointmentDate: new Date(), // dat lich = thoi diem hien tai
            userId: linkedUserId || undefined,
            totalAmount: finalAmount,
            voucherCode: appliedVoucherCode,
            discountAmount: totalDiscount,
            paymentStatus: 'paid',
            status: 'done',
            note: pct > 0 ? `Giam gia ${pct}%` : '',
        });
        await invoice.save();
        console.log(`[Payment] createWalkInPayment - Da tao hoa don id: ${invoice._id}`);

        // 4. Cong diem cho user (ti le: 100000 VND = 1 diem)
        let pointsEarned = 0;
        if (linkedUserId && finalAmount > 0) {
            pointsEarned = Math.floor(finalAmount / 100000);
            const user = await User.findById(linkedUserId);
            if (user) {
                user.points += pointsEarned;
                await user.save();
                console.log(`[Payment] createWalkInPayment - Cong ${pointsEarned} diem cho: ${user.username}`);
            }
        }

        res.status(201).json({
            success: true,
            message: 'Thanh toan thanh cong!',
            data: invoice,
            summary: {
                baseTotal,
                discountByPercent,
                discountByVoucher,
                finalAmount,
                pointsEarned
            }
        });
    } catch (error) {
        console.error('[Payment] createWalkInPayment - Loi:', error.message);
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
    addPoints,
    getInvoices,
    createWalkInPayment
};

