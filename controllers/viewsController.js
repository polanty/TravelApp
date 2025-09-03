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

exports.getTourPage = (req, res) => {
  res.status(200).render('base', {
    tour: 'The Tour',
    user: 'John doe',
  });
};
