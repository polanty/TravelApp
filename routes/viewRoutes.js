const express = require('express');
const viewController = require('../controllers/viewsController');

const router = express.Router();

const { getTour, getOverview, getLoginForm } = viewController;

//Routes for the View Rendered by pugs
router.get('/', getOverview);

router.get('/tour/:name', getTour);

router.get('/login', getLoginForm);

module.exports = router;
