const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Voucher = require('../models/Voucher');

// [POST] /api/payments/pay/:appointmentId
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
        appointment.status = 'confirmed'; // doi trang thai lich qua confirmed hoac done
        await appointment.save();

        // 2. Tinh toan diem cho User (neu co userId) vao tai khoan
        // Ti le: 10000 VND = 1 diem
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

        console.log(`[Payment] Thanh toan don: ${appointmentId} - Diem thuong: ${pointsEarned}`);
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

// [POST] /api/payments/redeem-voucher
const redeemVoucher = async (req, res) => {
    try {
        // user da dang nhap (nho co auth middleware verifyToken)
        const userId = req.user.id;
        const { voucherCode } = req.body; 

        // 1. Tim voucher tron he thong
        const voucher = await Voucher.findOne({ code: voucherCode.toUpperCase(), isActive: true });
        if (!voucher) {
            return res.status(404).json({ success: false, message: 'Voucher khong ton tai hoac da het han' });
        }

        // 2. Kiem tra user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Khong tim thay nguoi dung' });
        }

        // 3. Kiem tra diem
        if (user.points < voucher.pointCost) {
            return res.status(400).json({ 
                success: false, 
                message: `Ban can it nhat ${voucher.pointCost} diem, hien tai ban dang co ${user.points} diem` 
            });
        }

        // 4. Kiem tra voucher da co trong vi chua
        const alreadyHasVoucher = user.vouchers.some(v => v.code === voucher.code && !v.isUsed);
        if (alreadyHasVoucher) {
            return res.status(400).json({ success: false, message: 'Ban da doi ma nay va chua su dung.' });
        }

        // 5. Tru diem va them vao danh sach
        user.points -= voucher.pointCost;
        user.vouchers.push({
            code: voucher.code,
            discount: voucher.discountAmount,
            isUsed: false
        });

        await user.save();
        
        console.log(`[Payment] User ${user.username} doi voucher ${voucher.code} thanh cong. Diem con lai: ${user.points}`);
        res.json({ 
            success: true, 
            message: 'Doi ma giam gia thanh cong!', 
            voucher: voucher.code,
            pointsRemaining: user.points
        });
    } catch (error) {
        console.error('[Payment] redeemVoucher - Loi:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};


module.exports = { payAppointment, redeemVoucher };
