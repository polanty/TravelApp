const Review = require('../Models/reviewModel');
// const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tourRef) req.body.tourRef = req.params.tourId;
  if (!req.body.userRef) req.body.userRef = req.user.id;

  next();
};

exports.getAllReview = factory.getAllDocuments(Review);

// exports.createReview = catchAsync(async (req, res, next) => {
//   const review = await Review.create(req.body);

//   res.status(201).json({
//     status: 'success',
//     data: {
//       reviews: review,
//     },
//   });
// });

exports.getReview = factory.getOneDocument(Review);
exports.createReview = factory.createDocument(Review);

exports.updateReview = factory.UpdateDocument(Review);
exports.deleteReview = factory.deleteOne(Review);
