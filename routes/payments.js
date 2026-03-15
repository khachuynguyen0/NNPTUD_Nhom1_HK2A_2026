// Route thanh toan & diem thuong (payments)
var express = require('express');
var router = express.Router();
var ctrl = require('../controllers/paymentController');
const { verifyToken, verifyAdmin } = require('../middlewares/auth');

// [POST] /api/payments/pay/:appointmentId - (Admin) Xac nhan thanh toan don & cong diem
// Ghi chu: thong thuong nhan vien (admin) ghi nhan khach da tra tien
router.post('/pay/:appointmentId', verifyToken, verifyAdmin, ctrl.payAppointment);

// [POST] /api/payments/redeem-voucher - (User) Dung diem doi ma
router.post('/redeem-voucher', verifyToken, ctrl.redeemVoucher);

module.exports = router;
