// This is a better architecture than the above approach
//This is the tour route
const express = require('express');
const tourController = require('../controllers/tourController');

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
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;
