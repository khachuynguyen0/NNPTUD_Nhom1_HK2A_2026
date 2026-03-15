// Route thanh toan, diem thuong, voucher
var express = require('express');
var router = express.Router();
var ctrl = require('../controllers/paymentController');
const { verifyToken, verifyAdmin } = require('../middlewares/auth');

// [POST] /api/payments/pay/:appointmentId - Admin xac nhan thanh toan don, cong diem
router.post('/pay/:appointmentId', verifyToken, verifyAdmin, ctrl.payAppointment);

// [POST] /api/payments/redeem-voucher - User doi diem lay voucher
router.post('/redeem-voucher', verifyToken, ctrl.redeemVoucher);

// [GET] /api/payments/vouchers - Lay cac voucher dang hoat dong (ai cung xem duoc)
router.get('/vouchers', ctrl.getVouchers);

// [GET] /api/payments/vouchers/all - Admin: lay tat ca voucher
router.get('/vouchers/all', verifyToken, verifyAdmin, ctrl.getAllVouchers);

// [POST] /api/payments/vouchers - Admin tao voucher moi
router.post('/vouchers', verifyToken, verifyAdmin, ctrl.createVoucher);

// [PUT] /api/payments/vouchers/:code - Admin cap nhat voucher
router.put('/vouchers/:code', verifyToken, verifyAdmin, ctrl.updateVoucher);

// [DELETE] /api/payments/vouchers/:code - Admin xoa voucher
router.delete('/vouchers/:code', verifyToken, verifyAdmin, ctrl.deleteVoucher);

// [POST] /api/payments/add-points - Admin cong diem thu cong cho user
router.post('/add-points', verifyToken, verifyAdmin, ctrl.addPoints);

module.exports = router;
