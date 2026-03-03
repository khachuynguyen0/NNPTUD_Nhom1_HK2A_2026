// Route goc - tra ve thong tin API
var express = require('express');
var router = express.Router();

// GET /api - kiem tra server con song
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'NNPTUD Nhom1 HK2A 2026 - API dang hoat dong!',
    endpoints: {
      categories: '/api/categories',
      products: '/api/products',
      users: '/api/users',
    }
  });
});

module.exports = router;
