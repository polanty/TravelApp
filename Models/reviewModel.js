const mongoose = require('mongoose');
const Tour = require('./tourModel');

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
  // this.populate({
  //   path: 'userRef',
  //   select: '-__v -passwordResetToken -passwordResetExpires',
  // });

  // this.populate('tourRef');

  this.populate({
    path: 'userRef',
    select: '-__v -passwordResetToken -passwordResetExpires',
  });
  next();
});

//Static method to create function to get an action done
reviewModel.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tourRef: tourId },
    },
    {
      $group: {
        _id: '$tourRef',
        nRating: { $sum: 1 },
        avgRatings: { $avg: '$ratings' },
      },
    },
  ]);

  console.log(stats);

  Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0].nRating,
    ratingsAverage: stats[0].avgRatings,
  });
};

//Calculate stats as soon as a Review model is saved
reviewModel.post('save', function () {
  //this points to current review
  this.constructor.calcAverageRatings(this.tourRef);
});

const Review = mongoose.model('Review', reviewModel);

module.exports = Review;
