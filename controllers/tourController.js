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

exports.getAllTours = async (req, res) => {
  //read all tours from data base

  // console.log(req.query);
  try {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    const queryOBJ = { ...req.query };
    const excludedFields = ['page', 'limit', 'limit', 'fields'];

    excludedFields.forEach((el) => delete queryOBJ[el]);

    const query = Tour.find(queryOBJ);

    console.log(query);

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
