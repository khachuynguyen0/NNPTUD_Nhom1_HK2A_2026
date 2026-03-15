// Route lich hen (appointments)
var express = require('express');
var router = express.Router();
var ctrl = require('../controllers/appointmentsController');
const { verifyToken, verifyAdmin } = require('../middlewares/auth');

// GET /api/appointments
router.get('/', verifyToken, verifyAdmin, ctrl.getAll);

// GET /api/appointments/:id
router.get('/:id', verifyToken, verifyAdmin, ctrl.getOne);

// POST /api/appointments
router.post('/', verifyToken, ctrl.create);

// PUT /api/appointments/:id
router.put('/:id', verifyToken, verifyAdmin, ctrl.update);

// DELETE /api/appointments/:id
router.delete('/:id', verifyToken, verifyAdmin, ctrl.remove);

module.exports = router;
