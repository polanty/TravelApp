const express = require('express');
const reviewController = require('../controllers/reviewController');
const authenticationController = require('../controllers/authenticationController');

const router = express.Router({ mergeParams: true });

const {
  getAllReview,
  createReview,
  deleteReview,
  updateReview,
  setTourUserIds,
  getReview,
} = reviewController;
const { restrictTo, protect } = authenticationController;

router.use(protect);

//GET /tour/234534/reviews - get all the reviews associated with that tour
router
  .route('/')
  .get(getAllReview)
  .post(restrictTo('user'), setTourUserIds, createReview);

//Delete Review
router
  .route('/:id')
  .get(getReview)
  .patch(restrictTo('user', 'admin'), updateReview)
  .delete(restrictTo('user', 'admin'), deleteReview);

module.exports = router;
