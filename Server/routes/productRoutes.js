const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/auth');

// ✅ All routes with authentication
router.post('/products', authMiddleware, productController.upload, productController.createProduct);
router.get('/products', authMiddleware, productController.getProducts);
router.get('/products/:id', authMiddleware, productController.getProduct);
router.put('/products/:id', authMiddleware, productController.upload, productController.updateProduct);
router.delete('/products/:id', authMiddleware, productController.deleteProduct);

module.exports = router;
