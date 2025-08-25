const Tour = require('../Models/tourModel');
// const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficlty';

  next();
};

exports.getAllTours = factory.getAllDocuments(Tour);

//Getting all tours
exports.getTour = factory.getOneDocument(Tour, { path: 'reviews' });

//Get the top 5 tours// I used the second option listed uptop to prefil
exports.getTopTours = catchAsync(async (req, res, next) => {
  const limit = 5;
  const sortBy = req.query.sort.split(',').join(' ');

  const tours = await Tour.find().limit(limit).sort(sortBy);
  const tourCount = tours.length;

  res.status(200).json({
    status: 'success',
    count: tourCount,
    data: {
      tours: tours,
    },
  });
});

//Getting a single tour :id stands for parameter
exports.createTour = factory.createDocument(Tour);

//Sending data to a single tour
exports.updateTour = factory.UpdateDocument(Tour);

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   //read one single tour from data base
//   const tourID = req.params.id;

//   //finding one from the DB by the parameter
//   const tour = await Tour.findByIdAndDelete(tourID);

//   if (!tour) {
//     return next(new AppError('This Tour does not Exists', 404));
//   }

//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

//Refactored delete one model
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStat = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRatings: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: stats,
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: {
          $push: '$name',
        },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 6,
    },
  ]);

  const size = plan.length;

  res.status(200).json({
    status: 'success',
    length: size,
    data: {
      plan: plan,
    },
  });
});

// catchAsync(async (req, res, next) => {
//   // console.log(process.env);
//   //read one single tour from data base
//   const tourID = req.params.id;

//   //finding one from the DB by the parameter
//   const tour = await Tour.findById(tourID).populate('reviews');

//   if (!tour) {
//     return next(new AppError('This Tour does not Exists', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: tour,
//     },
//   });
// });

//'/tours-within/:distance/center/:latlng/unit/:unit'
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;

  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) {
    next(
      new AppError(
        'Please Provide latitude and Longitude in the format lat,lng.',
        400,
      ),
    );
  }

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});
