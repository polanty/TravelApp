const Tour = require('../Models/tourModel');
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
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    const queryOBJ = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    //filtering away above array as these are essential for sorting and pagination
    excludedFields.forEach((el) => delete queryOBJ[el]);

    //Advanced filtering
    //replace the following as this are reserved MongoDB function that do not appear in the req.query
    //The above line mean , the "$" is not included within the query and is needed as a mongodb quer
    let queryStr = JSON.stringify(queryOBJ);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    let query = Tour.find(JSON.parse(queryStr));

    //sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    //field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    //Pagination
    const page = req.query.page * 1 || 1;
    const limitVal = req.query.limit * 1 || 100;
    const skipVal = (page - 1) * limitVal;

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skipVal >= numTours) throw new Error('This page does not Exist');
    }

    //Pagination on the routes below
    //skip function provided by MongoDb
    query = query.skip(skipVal).limit(limitVal).exec();

    //Execute the query
    const tours = await query;

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
