// Route nguoi dung (users)
var express = require('express');
var router = express.Router();
var ctrl = require('../controllers/usersController');

// GET /api/users
router.get('/', ctrl.getAll);

// GET /api/users/:id
router.get('/:id', ctrl.getOne);

// POST /api/users
router.post('/', ctrl.create);

// PUT /api/users/:id
router.put('/:id', ctrl.update);

// DELETE /api/users/:id
router.delete('/:id', ctrl.remove);

module.exports = router;
