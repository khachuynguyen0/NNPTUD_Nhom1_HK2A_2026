// Controller xu ly lich hen (appointments)
const Appointment = require('../models/Appointment');
const Product = require('../models/Product');
const User = require('../models/User');
const { sendConfirmEmail } = require('../config/mailer');

// GET /api/appointments - Admin: lay tat ca lich hen (chua thanh toan, sap xep moi nhat len dau)
const getAll = async (req, res) => {
    try {
        // Chi lay lich chua thanh toan (da thanh toan thi xem o Q.Ly Hoa Don)
        // Sap xep theo appointmentDate giam dan: lich sap toi / moi nhat len dau
        const list = await Appointment.find({ paymentStatus: { $ne: 'paid' } })
            .populate('services', 'name price')
            .sort({ appointmentDate: -1 });
        console.log(`[Appointment] getAll - Tim thay ${list.length} lich hen chua thanh toan`);
        res.json({ success: true, data: list });

    } catch (err) {
        console.error('[Appointment] getAll - loi:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/appointments/my - User: lay lich hen cua chinh minh
const getMyAppointments = async (req, res) => {
    try {
        const userId = req.user.id;
        const list = await Appointment.find({ userId })
            .populate('services', 'name price image')
            .sort({ appointmentDate: -1 }); // moi nhat len tren
        console.log(`[Appointment] getMyAppointments - User ${req.user.username}: ${list.length} lich hen`);
        res.json({ success: true, data: list });
    } catch (err) {
        console.error('[Appointment] getMyAppointments - loi:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/appointments/:id - lay 1 lich hen
const getOne = async (req, res) => {
    try {
        const item = await Appointment.findById(req.params.id)
            .populate('services', 'name price');
        if (!item) {
            return res.status(404).json({ success: false, message: 'Khong tim thay lich hen' });
        }
        console.log(`[Appointment] getOne - id: ${req.params.id}`);
        res.json({ success: true, data: item });
    } catch (err) {
        console.error('[Appointment] getOne - loi:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/appointments - tao lich hen moi (cho phep khach hoac user dang nhap dat lich)
const create = async (req, res) => {
    try {
        const { customerName, phone, email, serviceIds, appointmentDate, note, voucherCode } = req.body;
        console.log(`[Appointment] create - ${customerName} | ${phone} | serviceIds: ${serviceIds}`);

        // Kiem tra phai co it nhat 1 dich vu
        if (!serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0) {
            return res.status(400).json({ success: false, message: 'Phai chon it nhat 1 dich vu' });
        }

        // Lay thong tin cac dich vu de tinh tong tien
        // Dung $in se tra ve unique, nen phai map gia sau do tinh theo tung phan tu cua serviceIds (co the trung nhau)
        const serviceList = await Product.find({ _id: { $in: serviceIds } });
        if (serviceList.length === 0) {
            return res.status(404).json({ success: false, message: 'Khong tim thay dich vu nao hop le' });
        }

        // Tao map: id -> price de tinh nhanh
        const priceMap = {};
        serviceList.forEach(s => { priceMap[s._id.toString()] = s.price; });

        // Tinh tong dua tren tung phan tu cua serviceIds (ke ca trung nhau = so luong > 1)
        const totalBeforeDiscount = serviceIds.reduce((sum, id) => sum + (priceMap[id] || 0), 0);
        console.log(`[Appointment] create - Tong tien truoc giam: ${totalBeforeDiscount} (${serviceIds.length} dich vu, bao gom dup)`);


        // Xu ly token thu cong neu co (cho phep khach hoac user dang nhap dat lich)
        let userId = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_loan_spa');
                userId = decoded.id;
            } catch (err) {
                return res.status(401).json({ success: false, message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng xuất và đăng nhập lại để tích lũy điểm hẹn!' });
            }
        }

        // Xu ly voucher (chi ap dung neu co userId va co ma voucher)
        let appliedVoucherCode = '';
        let discountAmount = 0;

        if (voucherCode && voucherCode.trim() !== '' && userId) {
            const user = await User.findById(userId);
            if (user) {
                // Tim voucher trong vi user (chua dung)
                const voucherIdx = user.vouchers.findIndex(
                    v => v.code === voucherCode.trim().toUpperCase() && !v.isUsed
                );
                if (voucherIdx !== -1) {
                    discountAmount = user.vouchers[voucherIdx].discount;
                    appliedVoucherCode = user.vouchers[voucherIdx].code;
                    // Danh dau voucher da duoc su dung
                    user.vouchers[voucherIdx].isUsed = true;
                    await user.save();
                    console.log(`[Appointment] create - Ap dung voucher ${appliedVoucherCode}, giam: ${discountAmount}`);
                } else {
                    // Voucher khong hop le hoac da dung — bao loi
                    return res.status(400).json({
                        success: false,
                        message: 'Mã voucher không hợp lệ hoặc đã được sử dụng'
                    });
                }
            }
        } else if (voucherCode && voucherCode.trim() !== '' && !userId) {
            // Khach vang lai khong the dung voucher
            return res.status(400).json({
                success: false,
                message: 'Bạn cần đăng nhập để sử dụng voucher'
            });
        }

        // Tinh tong tien sau giam gia (khong am)
        const totalAmount = Math.max(0, totalBeforeDiscount - discountAmount);
        console.log(`[Appointment] create - Giam: ${discountAmount}, Tong sau giam: ${totalAmount}`);

        const newItem = new Appointment({
            customerName,
            phone,
            email: email || '',
            services: serviceIds,
            appointmentDate,
            note,
            userId,
            totalAmount,
            voucherCode: appliedVoucherCode,
            discountAmount,
        });
        const saved = await newItem.save();
        console.log(`[Appointment] create - Da tao lich hen id: ${saved._id}`);
        res.status(201).json({ success: true, data: saved });
    } catch (err) {
        console.error('[Appointment] create - loi:', err.message);
        res.status(400).json({ success: false, message: err.message });
    }
};

// POST /api/appointments/:id/confirm - Admin: xac nhan lich hen va gui email
const confirm = async (req, res) => {
    try {
        const appt = await Appointment.findById(req.params.id)
            .populate('services', 'name price');
        if (!appt) {
            return res.status(404).json({ success: false, message: 'Khong tim thay lich hen' });
        }

        // Cap nhat trang thai
        appt.status = 'confirmed';
        await appt.save();
        console.log(`[Appointment] confirm - Da xac nhan lich hen id: ${appt._id}`);

        // Tong hop ten dich vu de gui email
        const serviceNames = (appt.services || []).map(s => s.name).join(', ') || 'Dich vu spa';

        // Gui email thong bao KHONG await -> tra response ngay, email gui ngam o background
        if (appt.email) {
            sendConfirmEmail({
                toEmail: appt.email,
                customerName: appt.customerName,
                serviceName: serviceNames,
                appointmentDate: appt.appointmentDate,
            }).then(() => {
                console.log(`[Appointment] confirm - Da gui email (background) den: ${appt.email}`);
            }).catch(mailErr => {
                console.error('[Appointment] confirm - Loi gui email (background):', mailErr.message);
            });
        } else {
            console.log('[Appointment] confirm - Khong co email khach hang, bo qua gui mail');
        }

        // Tra response ngay (khong cho email gui xong)
        res.json({ success: true, data: appt, emailSent: !!appt.email });

    } catch (err) {
        console.error('[Appointment] confirm - loi:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

// PUT /api/appointments/:id - cap nhat trang thai lich hen
const update = async (req, res) => {
    try {
        console.log(`[Appointment] update - id: ${req.params.id}, data:`, req.body);
        const updated = await Appointment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Khong tim thay lich hen' });
        }
        res.json({ success: true, data: updated });
    } catch (err) {
        console.error('[Appointment] update - loi:', err.message);
        res.status(400).json({ success: false, message: err.message });
    }
};

// DELETE /api/appointments/:id - xoa lich hen
const remove = async (req, res) => {
    try {
        console.log(`[Appointment] remove - id: ${req.params.id}`);
        const deleted = await Appointment.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Khong tim thay lich hen' });
        }
        res.json({ success: true, message: 'Da xoa lich hen' });
    } catch (err) {
        console.error('[Appointment] remove - loi:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getAll, getMyAppointments, getOne, create, confirm, update, remove };
