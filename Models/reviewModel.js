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

reviewModel.index(
  { tourRef: 1, userRef: 1 },
  {
    unique: true,
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

  // const roundedAverageRatings = Math.round(stats[0].avgRatings);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRatings,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

//Calculate stats as soon as a Review model is saved
reviewModel.post('save', function () {
  //this points to current review
  this.constructor.calcAverageRatings(this.tourRef);
});

//Function to update the ratings based on an Update and delete call on a Tour
//Under where i stated below functionality, this immediate middle ware passes this.r straight to the next middle ware
//I have to always remeber , excel is build on middleware
reviewModel.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();

  next();
});

reviewModel.post(/^findOneAnd/, async function () {
  // console.log('post middle ware');
  // console.log(this.r.tourRef);
  await this.r.constructor.calcAverageRatings(this.r.tourRef);
});

const Review = mongoose.model('Review', reviewModel);

module.exports = Review;
