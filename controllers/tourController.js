const Tour = require('../Models/tourModel');
const multer = require('multer');
const sharp = require('sharp');
// const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  // 1) Resize imageCover
  req.files.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.files.imageCover}`);

  // 2) Resize images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(req.files.images[i].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${file.filename}`);

      req.body.images.push(filename);
    }),
  );

  next();
});

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';

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

exports.getAllDistance = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;

  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please Provide latitude and Longitude in the format lat,lng.',
        400,
      ),
    );
  }

  // const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  const distances = await Tour.aggregate([
    {
      //This is the only value geospatial aggregation pipeline receives
      //It will only work if you have at least one index(in the model already) referecing a geopatial value
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
