const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/shopController');
const auth = require('../middleware/auth');

router.get('/states', auth, ctrl.getStates);
router.get('/districts/:stateId', auth, ctrl.getDistricts);
router.get('/cities/:districtId', auth, ctrl.getCities);
router.post('/addShops', auth, ctrl.addShop);
router.get('/myShop', auth, ctrl.getMyShop);
router.get('/categories', auth, ctrl.getCategories);

router.get('/getShop/myShops', auth, ctrl.getMyShops);
router.get('/getShop/:shopId', auth, ctrl.getShopById);
router.put('/updateShop/:shopId', auth, ctrl.updateShop);
router.delete('/getShop/:shopId', auth, ctrl.deleteShop);

module.exports = router;
