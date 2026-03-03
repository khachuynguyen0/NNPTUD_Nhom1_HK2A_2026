// Route danh muc (categories)
var express = require('express');
var router = express.Router();
var ctrl = require('../controllers/categoriesController');

// GET /api/categories
router.get('/', ctrl.getAll);

// GET /api/categories/:id
router.get('/:id', ctrl.getOne);

// POST /api/categories
router.post('/', ctrl.create);

// PUT /api/categories/:id
router.put('/:id', ctrl.update);

// DELETE /api/categories/:id
router.delete('/:id', ctrl.remove);

// GET /api/categories/:id/products - San pham thuoc danh muc nay
router.get('/:id/products', ctrl.getProducts);

module.exports = router;
