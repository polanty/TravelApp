const express = require('express');
const reviewController = require('../controllers/reviewController');
const authenticationController = require('../controllers/authenticationController');

const router = express.Router({ mergeParams: true });

const { getAllReview, createReview, deleteReview } = reviewController;
const { restrictTo, protect } = authenticationController;

//GET /tour/234534/reviews - get all the reviews associated with that tour
router
  .route('/')
  .get(getAllReview)
  .post(protect, restrictTo('user'), createReview);

//Delete Review
router.route('/:id').delete(protect, restrictTo('user'), deleteReview);
module.exports = router;
