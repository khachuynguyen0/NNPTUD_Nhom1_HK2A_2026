// Route san pham (products)
var express = require('express');
var router = express.Router();
var ctrl = require('../controllers/productsController');
var multer = require('multer');
var path = require('path');

// Cau hinh multer de luu anh
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/images/services/'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });
const { verifyToken, verifyAdmin } = require('../middlewares/auth');

// GET /api/products?categoryId=xxx (co the loc theo category)
router.get('/', ctrl.getAll);

// GET /api/products/:id
router.get('/:id', ctrl.getOne);

// POST /api/products
router.post('/', verifyToken, verifyAdmin, upload.single('image'), ctrl.create);

// PUT /api/products/:id
router.put('/:id', verifyToken, verifyAdmin, upload.single('image'), ctrl.update);

// DELETE /api/products/:id
router.delete('/:id', verifyToken, verifyAdmin, ctrl.remove);

module.exports = router;
