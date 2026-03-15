// Controller xu ly lich hen (appointments)
const Appointment = require('../models/Appointment');

// GET /api/appointments - lay tat ca lich hen
const getAll = async (req, res) => {
    try {
        console.log('[Appointment] lay danh sach lich hen');
        const list = await Appointment.find()
            .populate('serviceId', 'name price') // lay ten va gia dich vu
            .sort({ appointmentDate: 1 });        // sap xep theo ngay tang dan
        res.json({ success: true, data: list });
    } catch (err) {
        console.error('[Appointment] loi lay danh sach:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/appointments/:id - lay 1 lich hen
const getOne = async (req, res) => {
    try {
        console.log('[Appointment] lay lich hen id:', req.params.id);
        const item = await Appointment.findById(req.params.id)
            .populate('serviceId', 'name price');
        if (!item) {
            return res.status(404).json({ success: false, message: 'Khong tim thay lich hen' });
        }
        res.json({ success: true, data: item });
    } catch (err) {
        console.error('[Appointment] loi lay 1 lich hen:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/appointments - tao lich hen moi
const create = async (req, res) => {
    try {
        const { customerName, phone, serviceId, appointmentDate, note } = req.body;
        console.log('[Appointment] tao moi:', customerName, phone, serviceId, appointmentDate);

        // Lay thong tin dich vu de lay gia
        const Product = require('../models/Product');
        const service = await Product.findById(serviceId);
        if (!service) {
            return res.status(404).json({ success: false, message: 'Khong tim thay dich vu nay' });
        }

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

        const newItem = new Appointment({ 
            customerName, 
            phone, 
            serviceId, 
            appointmentDate, 
            note,
            userId: userId, 
            totalAmount: service.price 
        });
        const saved = await newItem.save();

        res.status(201).json({ success: true, data: saved });
    } catch (err) {
        console.error('[Appointment] loi tao moi:', err.message);
        res.status(400).json({ success: false, message: err.message });
    }
};

// PUT /api/appointments/:id - cap nhat lich hen
const update = async (req, res) => {
    try {
        console.log('[Appointment] cap nhat id:', req.params.id);
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
        console.error('[Appointment] loi cap nhat:', err.message);
        res.status(400).json({ success: false, message: err.message });
    }
};

// DELETE /api/appointments/:id - xoa lich hen
const remove = async (req, res) => {
    try {
        console.log('[Appointment] xoa id:', req.params.id);
        const deleted = await Appointment.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Khong tim thay lich hen' });
        }
        res.json({ success: true, message: 'Da xoa lich hen' });
    } catch (err) {
        console.error('[Appointment] loi xoa:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getAll, getOne, create, update, remove };
