const express = require('express');
const viewController = require('../controllers/viewsController');
const authenticationController = require('../controllers/authenticationController');

const router = express.Router();

const { isLoggedIn } = authenticationController;

const { getTour, getOverview, getLoginForm } = viewController;

//Protect all the routes to only logged in user
router.use(isLoggedIn);

//Routes for the View Rendered by pugs
router.get('/', getOverview);

router.get('/tour/:name', getTour);

router.get('/login', getLoginForm);

module.exports = router;
