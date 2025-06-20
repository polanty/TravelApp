const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../Models/userModel');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  //Log this user in immediately they sign up
  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'sucess',
    token: token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) check if email and password exists
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  //2) check if the user exists and password is correct
  const user = await User.findOne({ email: email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password!', 401));
  }

  //3) if everything is okay, send token to client
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token: token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  //1) Get token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in ! Please log in to get access.', 401),
    );
  }
  //2) Validate the token by checking if the signature is valid (unaltered against the one in the database)
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3) if verification is successful, check if the user still exists
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(new AppError('This user no longer exist', 401));
  }

  //4) check if user changed password after the token is issued
  if (currentUser.changedPasswordsAfter(decoded.iat)) {
    return next(
      next(
        new AppError(
          'User recently changed password! Please log in again.',
          401,
        ),
      ),
    );
  }

  // Goes straight tothe next middle ware
  req.user = currentUser;
  next();
});

exports.restrictTo =
  (...roles) =>
  //roles is an array of ['admin', 'lead-guide']
  (req, res, next) => {
    //Check if the requested user is authorised to make this delete request

    // Get the user from the protect middleware. In express ,
    //  so far the middle ware site above the other middle ware, the current middle ware as access to the properties if it calls next

    const { user } = req;
    if (!roles.includes(user.role)) {
      return next(
        new AppError('You are not authorised to perform this Action', 403),
      );
    }
    next();
  };

//Reset password functionality
//First to send a post request forgetting password
//Then to be able to reset the password from the link sent to the email
exports.forgotPassword = catchAsync(async (req, res, next) => {
  //Get the user based on the posted email from request
  //Check if the user exist in our database
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with that Email address', 404));
  }

  // 2) Generate the token
  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  // 3)  send password reset token
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a Patch request with your new password and passwordConfirm to: ${resetURL}. \n If you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Your password reset token ( Valid for 10 minutes)`,
      message: message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500,
      ),
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) get user based on the token || Only way to find the user is to search by the token to reset their password
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  //2) if token has not expired, and there is user, set the new password
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError('This password reset url does not exist', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //3) Update changedPasswordAt property for the user
  // return res.status(200).json({
  //   message: 'sucess',
  //   user: user,
  // });

  //4) Log the user in, send
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token: token,
  });
});
