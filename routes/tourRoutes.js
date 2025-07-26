// This is a better architecture than the above approach
//This is the tour route
const express = require('express');
const tourController = require('../controllers/tourController');
// const reviewController = require('../controllers/reviewController');
const reviewRouter = require('./reviewRoutes');

const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  getTourStat,
  getMonthlyPlan,
  // getTopTours, //Second option to get the top 5 tours
  aliasTopTours,
} = tourController;

// const { createReview } = reviewController;

const authenticationController = require('../controllers/authenticationController');

//Destructure protect from auth controller
const { protect, restrictTo } = authenticationController;

const router = express.Router();

// router.param('id', checkID);

router.route('/').get(protect, getAllTours).post(createTour);

//stattistic Route
router.route('/tour-stats').get(getTourStat);

//Monthly Tours Route
router.route('/monthly-plan/:year').get(getMonthlyPlan);

//Top 5 rated tours
router.route('/top-5-tours').get(aliasTopTours, getAllTours);

router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(protect, restrictTo('admin', 'guide'), deleteTour);

//POST /tour/23445/reviews - Create a review
//GET /tour/234534/reviews - get all the reviews associated with that tour
//GET /tour/234534/reviews/23456 - get a particular review for a single tour

//First implementation , but this is not best practice
// router
//   .route('/:tourId/reviews')
//   .post(protect, restrictTo('user'), createReview);

//Importing the review Router instead
router.use('/:tourId/reviews', reviewRouter);

module.exports = router;
