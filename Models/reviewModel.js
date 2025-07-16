const mongoose = require('mongoose');

const reviewModel = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A review must have a Ratings'],
    },
    ratings: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: { type: Date, default: Date.now },
    tourRef: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    userRef: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'User must belong to a tour.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewModel.pre(/^find/, function (next) {
  this.populate({
    path: 'userRef',
    select: '-__v -passwordResetToken -passwordResetExpires',
  });

  this.populate('tourRef');

  next();
});

const Review = mongoose.model('Review', reviewModel);

module.exports = Review;
