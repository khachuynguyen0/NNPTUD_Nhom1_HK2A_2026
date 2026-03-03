// Route san pham (products)
var express = require('express');
var router = express.Router();
var ctrl = require('../controllers/productsController');

// GET /api/products?categoryId=xxx (co the loc theo category)
router.get('/', ctrl.getAll);

// GET /api/products/:id
router.get('/:id', ctrl.getOne);

// POST /api/products
router.post('/', ctrl.create);

// PUT /api/products/:id
router.put('/:id', ctrl.update);

// DELETE /api/products/:id
router.delete('/:id', ctrl.remove);

module.exports = router;
