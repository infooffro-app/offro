const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

router.get('/getOffers', auth, ctrl.getOffers);

module.exports = router;
