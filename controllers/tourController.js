const Tour = require('../Models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
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

exports.getAllTours = async (req, res) => {
  //read all tours from data base

  // console.log(req.query);
  try {
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitting()
      .pagination();

    //Execute the query
    const tours = await features.query;

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours: tours,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'Failed',
      message: error,
    });
  }
};

//Getting all tours

exports.getTour = async (req, res) => {
  //read one single tour from data base
  try {
    const tourID = req.params.id;

    //finding one from the DB by the parameter
    const tour = await Tour.findById(tourID);

    res.status(200).json({
      status: 'success',
      data: {
        tour: tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'Failed',
      message: error,
    });
  }
};

//Get the top 5 tours// I used the second option listed uptop to prefil
exports.getTopTours = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(404).json({
      status: 'Failed',
      message: error,
    });
  }
};

//Getting a single tour :id stands for parameter

exports.createTour = async (req, res) => {
  /* eslint-disable node/no-unsupported-features/es-syntax */
  //const newTour = { id: newId, ...req.body };
  /* eslint-disable node/no-unsupported-features/es-syntax */

  //Alternative to the "Create method used below"
  // const newTour = new Tour({});
  // newTour.save()

  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'status',
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      data: {
        message: error,
      },
    });
  }
};

//Sending data to a single tour
exports.updateTour = async (req, res) => {
  //read one single tour from data base
  try {
    const tourID = req.params.id;

    //finding one from the DB by the parameter
    const tour = await Tour.findByIdAndUpdate(tourID, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour: tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'Failed',
      message: error,
    });
  }
};

exports.deleteTour = async (req, res) => {
  //read one single tour from data base
  try {
    const tourID = req.params.id;

    //finding one from the DB by the parameter
    await Tour.findByIdAndDelete(tourID);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(404).json({
      status: 'Failed',
      message: error,
    });
  }
};

exports.getTourStat = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(404).json({
      status: 'Failed',
      message: error,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(404).json({
      status: 'Failed',
      message: error,
    });
  }
};
