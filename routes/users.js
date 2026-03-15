// Route nguoi dung (users)
var express = require('express');
var router = express.Router();
var ctrl = require('../controllers/usersController');
const { verifyToken, verifyAdmin } = require('../middlewares/auth');

// GET /api/users
router.get('/', verifyToken, verifyAdmin, ctrl.getAll);

// GET /api/users/:id
router.get('/:id', verifyToken, verifyAdmin, ctrl.getOne);

// POST /api/users
router.post('/', verifyToken, verifyAdmin, ctrl.create);

// PUT /api/users/:id
router.put('/:id', verifyToken, verifyAdmin, ctrl.update);

// DELETE /api/users/:id
router.delete('/:id', verifyToken, verifyAdmin, ctrl.remove);

module.exports = router;
