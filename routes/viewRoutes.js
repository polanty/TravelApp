const express = require('express');
const viewController = require('../controllers/viewsController');

const router = express.Router();

const { getTour, getOverview } = viewController;

//Routes for the View Rendered by pugs
router.get('/', getOverview);

router.get('/tour/:name', getTour);

module.exports = router;
