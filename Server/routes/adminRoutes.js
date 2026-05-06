const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Register new admin
router.post('/register', adminController.register);

// Admin login
router.post('/login', adminController.login);

// DB check
router.get('/check-db', adminController.checkDb);

module.exports = router;
