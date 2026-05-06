const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/', auth, ctrl.getUsers);
router.post('/login', ctrl.login);
router.post('/register', ctrl.addUser);
router.post('/verify-otp', ctrl.verifyOTP);
router.post('/resend-otp', ctrl.resendOTP);
router.put('/:id', auth, ctrl.updateUser);
router.delete('/:id', auth, ctrl.deleteUser);
router.get('/profile', auth, ctrl.getProfile);

router.post('/change-password', auth, ctrl.changePassword);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/forgot-verify-otp',      ctrl.forgotVerifyOtp);
router.post('/reset-password',  ctrl.resetPassword);

module.exports = router;
