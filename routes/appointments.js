// Route lich hen (appointments)
var express = require('express');
var router = express.Router();
var ctrl = require('../controllers/appointmentsController');

// GET /api/appointments
router.get('/', ctrl.getAll);

// GET /api/appointments/:id
router.get('/:id', ctrl.getOne);

// POST /api/appointments
router.post('/', ctrl.create);

// PUT /api/appointments/:id
router.put('/:id', ctrl.update);

// DELETE /api/appointments/:id
router.delete('/:id', ctrl.remove);

module.exports = router;
