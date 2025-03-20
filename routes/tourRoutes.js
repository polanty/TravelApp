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
  // getTopTours, //Second option to get the top 5 tours
  aliasTopTours,
} = tourController;

const router = express.Router();

// router.param('id', checkID);

router.route('/').get(getAllTours).post(createTour);

//Top 5 rated tours
router.route('/top-5-tours').get(aliasTopTours, getAllTours);

router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
