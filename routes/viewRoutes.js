const express = require('express');
const viewController = require('../controllers/viewsController');
const authenticationController = require('../controllers/authenticationController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

const { isLoggedIn, protect } = authenticationController;

const { getTour, getOverview, getLoginForm, getAccount, updateUserData } =
  viewController;

const { createBookingCheckout } = bookingController;

//Routes for the View Rendered by pugs
router.get('/', createBookingCheckout, isLoggedIn, getOverview);

router.get('/tour/:name', isLoggedIn, getTour);

router.get('/login', isLoggedIn, getLoginForm);

router.get('/me', protect, getAccount);

router.get('/my-tours', protect, bookingController.getMyTours, getOverview);

router.post('/submit-user-data', protect, updateUserData);

module.exports = router;
