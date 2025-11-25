const express = require('express');
const bookingController = require('../controllers/bookingController');
const authenticationController = require('../controllers/authenticationController');

const router = express.Router();

const { protect } = authenticationController;
const {
  getCheckoutSession,
  getAllBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
} = bookingController;

router.use(protect);

//Protect all the routes after this middleware
router.get('/checkout-session/:tourId', getCheckoutSession);

router.use(authenticationController.restrictTo('admin', 'lead-guide'));

router.route('/').get(getAllBookings).post(createBooking);

router.route('/:id').get(getBooking).patch(updateBooking).delete(deleteBooking);

module.exports = router;
