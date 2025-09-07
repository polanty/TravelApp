const Tour = require('../Models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();

  // 2) Build template

  // 3) Render that on the browser
  res.status(200).render('overview', {
    title: 'All Tours',
    tours: tours,
  });
});

exports.getTour = catchAsync(async (req, res) => {
  // 1) Get the data, for the requested tour (including reviews and guides)
  // 2) Build template
  // 3) Render template to user
  const tour = await Tour.findOne({ name: req.params.name }).populate({
    path: 'reviews',
    fields: 'review rating userRef',
  });

  console.log(tour);
  // console.log(req.params.name);

  res.status(200).render('tour', {
    tour: tour,
  });
});
