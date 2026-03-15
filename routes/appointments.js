// Route lich hen (appointments)
var express = require('express');
var router = express.Router();
var ctrl = require('../controllers/appointmentsController');
const { verifyToken, verifyAdmin } = require('../middlewares/auth');

// GET /api/appointments/my — User xem lich hen cua chinh minh (phai dat truoc /:id)
router.get('/my', verifyToken, ctrl.getMyAppointments);

// GET /api/appointments — Admin xem tat ca lich hen
router.get('/', verifyToken, verifyAdmin, ctrl.getAll);

// GET /api/appointments/:id — Admin xem 1 lich hen
router.get('/:id', verifyToken, verifyAdmin, ctrl.getOne);

// POST /api/appointments — cho phep khach hoac user dat lich (controller tu xu ly JWT neu co)
router.post('/', ctrl.create);

// POST /api/appointments/:id/confirm — Admin xac nhan lich hen + gui email
router.post('/:id/confirm', verifyToken, verifyAdmin, ctrl.confirm);

// PUT /api/appointments/:id — Admin cap nhat trang thai
router.put('/:id', verifyToken, verifyAdmin, ctrl.update);

// DELETE /api/appointments/:id — Admin xoa lich hen
router.delete('/:id', verifyToken, verifyAdmin, ctrl.remove);

module.exports = router;
