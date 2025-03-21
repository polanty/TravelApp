// This is a better architecture than the above approach
//This is the tour route
const express = require('express');
const tourController = require('../controllers/tourController');

const { getAllTours, createTour, getTour, updateTour, deleteTour } =
  tourController;

const router = express.Router();

// router.param('id', checkID);

router.route('/').get(getAllTours).post(createTour);

router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
