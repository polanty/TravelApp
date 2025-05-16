const User = require('../Models/userModel');
const catchAsync = require('../utils/catchAsync');

// const createUser = catchAsync(async () => {

// })
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  res.status(201).json({
    status: 'status',
    data: {
      user: newUser,
    },
  });
});
