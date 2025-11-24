const express = require('express');
const bookingController = require('../controllers/bookingController');
const authenticationController = require('../controllers/authenticationController');

const router = express.Router();

const { protect } = authenticationController;
const { getCheckoutSession } = bookingController;

//Protect all the routes after this middleware
router.get('/checkout-session/:tourId', protect, getCheckoutSession);

router.use(protect);

module.exports = router;
