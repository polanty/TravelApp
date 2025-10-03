const express = require('express');
const viewController = require('../controllers/viewsController');
const authenticationController = require('../controllers/authenticationController');

const router = express.Router();

const { isLoggedIn, protect } = authenticationController;

const { getTour, getOverview, getLoginForm, getAccount, updateUserData } =
  viewController;

//Routes for the View Rendered by pugs
router.get('/', isLoggedIn, getOverview);

router.get('/tour/:name', isLoggedIn, getTour);

router.get('/login', isLoggedIn, getLoginForm);

router.get('/me', protect, getAccount);

router.post('/submit-user-data', protect, updateUserData);

module.exports = router;
