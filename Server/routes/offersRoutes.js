const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/offersController');
const auth = require('../middleware/auth');


router.post('/offers', auth, ctrl.addOffer);
router.put('/offers/:id', auth, ctrl.updateOffer);
router.get('/myOffers', auth, ctrl.getMyOffers);
router.get('/getOffers/:offerId', auth,ctrl.getOfferDetails);
//router.get('/getShops', auth, ctrl.getShop);
router.get('/getShops/:shopId', auth, ctrl.getShopDetails);
router.get('/offer-analytics/:offerId',auth, ctrl.getOfferAnalytics);

module.exports = router;




