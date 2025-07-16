const express = require('express');
const reviewController = require('../controllers/reviewController');
const authenticationController = require('../controllers/authenticationController');

const router = express.Router();

const { getAllReview, createReview } = reviewController;
const { restrictTo, protect } = authenticationController;

router
  .route('/')
  .get(getAllReview)
  .post(protect, restrictTo('user'), createReview);

module.exports = router;
