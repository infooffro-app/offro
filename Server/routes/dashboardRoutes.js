const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

router.get('/getOffers', auth, ctrl.getOffers);
router.get('/getBanner', auth, ctrl.getBanners);
module.exports = router;
