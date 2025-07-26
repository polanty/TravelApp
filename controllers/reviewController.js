const Review = require('../Models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getAllReview = catchAsync(async (req, res, next) => {
  //Get the current Id if it exist from the Review routes
  //This is due to the merge effect incoperated by the
  let filter = {};

  if (req.params.tourId) filter = { tourRef: req.params.tourId };

  const reviews = await Review.find(filter);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews: reviews,
    },
  });
});

// exports.createReview = catchAsync(async (req, res, next) => {
//   const review = await Review.create(req.body);

//   res.status(201).json({
//     status: 'success',
//     data: {
//       reviews: review,
//     },
//   });
// });

exports.createReview = catchAsync(async (req, res, next) => {
  // Allow nested routes
  if (!req.body.tourRef) req.body.tourRef = req.params.tourId;
  if (!req.body.userRef) req.body.userRef = req.user.id;

  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});

exports.deleteReview = factory.deleteOne(Review);
