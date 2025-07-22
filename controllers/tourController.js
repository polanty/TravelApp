const Tour = require('../Models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
//const Tour = require('../Models/tourModel');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
// );

// exports.checkID = (req, res, next, val) => {
//   const tourLength = tours.length;

//   const searchId = val * 1;

//   if (searchId * 1 > tourLength) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   }

//   next();
// };
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficlty';

  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  //read all tours from data base
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitting()
    .pagination();

  //Execute the query
  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    date: req.requestedTime,
    results: tours.length,
    data: {
      tours: tours,
    },
  });
});

//Getting all tours

exports.getTour = catchAsync(async (req, res, next) => {
  // console.log(process.env);
  //read one single tour from data base
  const tourID = req.params.id;

  //finding one from the DB by the parameter
  const tour = await Tour.findById(tourID).populate('reviews');

  if (!tour) {
    return next(new AppError('This Tour does not Exists', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: tour,
    },
  });
});

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

//Generic function that can be passed to handla all the error within any controller
// const catchAsync = (fn) => {
//   return (req, res, next) => {
//     fn(req, res, next).catch(next);
//   };
// }; or

//Getting a single tour :id stands for parameter

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'status',
    data: {
      tour: newTour,
    },
  });
});

//Sending data to a single tour
exports.updateTour = catchAsync(async (req, res, next) => {
  //read one single tour from data base
  const tourID = req.params.id;

  //finding one from the DB by the parameter
  const tour = await Tour.findByIdAndUpdate(tourID, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError('This Tour does not Exists', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  //read one single tour from data base
  const tourID = req.params.id;

  //finding one from the DB by the parameter
  const tour = await Tour.findByIdAndDelete(tourID);

  if (!tour) {
    return next(new AppError('This Tour does not Exists', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

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
