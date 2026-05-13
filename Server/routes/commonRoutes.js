const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/commonController');
const auth = require('../middleware/auth');


router.get('/import-state',  ctrl.importStates);
router.get('/import-districts',  ctrl.importDistricts);
router.get('/import-cities',  ctrl.importCities);
router.get('/import-category',  ctrl.importCategory);


module.exports = router;
