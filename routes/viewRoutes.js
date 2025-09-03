const express = require('express');
const viewController = require('../controllers/viewsController');

const router = express.Router();

const { getTourPage, getOverview } = viewController;

//Routes for the View Rendered by pugs
router.get('/', getOverview);

router.get('/tour', getTourPage);

module.exports = router;
