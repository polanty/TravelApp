const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../Models/userModel');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  // const cookiesOptions = {
  //   expires: new Date(
  //     Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
  //   ),
  //   secure: true,
  //   httpOnly: true,
  // };

  // if (process.env.NODE_ENV === 'production') cookiesOptions.secure = true;
  //Implementing cookies, this mean our browser can securely read this token and we do not have to pass it as a response with the json Object
  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    httpOnly: true,
  });

  //Remove the password from selection
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token: token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  const url = `${req.protocol}://${req.get('host')}/me`;

  console.log(url);

  await new Email(newUser, url).sendWelcome();

  //Log this user in immediately they sign up
  createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) check if email and password exists
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  //2) check if the user exists and password is correct
  const user = await User.findOne({ email: email }).select('+password');

  // console.log(user);

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password!', 401));
  }

  //3) if everything is okay, send token to client
  createSendToken(user, 200, req, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  //1) Get token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
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
  res.locals.user = currentUser;
  next();
});

//Only for rendered pages and no errors
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      //1) Validate the token by checking if the signature is valid (unaltered against the one in the database)
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      //2) if verification is successful, check if the user still exists
      const currentUser = await User.findById(decoded.id);

      if (!currentUser) {
        return next();
      }

      //4) check if user changed password after the token is issued
      if (currentUser.changedPasswordsAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      //if no current user, function returns next straight away as there is no current user
      return next();
    }
  }

  next();
};

//Log Out route - Implementation is to send a new jwt but with an empty token and a very short expiry date
exports.logout = catchAsync(async (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
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
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: message,
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
    return next(new AppError('This token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //3) Update changedPasswordAt property for the user
  // Already implemented this with the Middle ware in the user model

  //4) Log the user in, send
  createSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findOne({ email: req.body.email }).select(
    '+password',
  );

  // 2) Check if posted current password is correct
  if (
    !user ||
    !(await user.correctPassword(req.body.passwordCurrent, user.password))
  ) {
    return next(new AppError('Incorrect email or password!', 401));
  }

  // 3) if so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.confirmPassword;
  await user.save(); // any function other than save will not run the validators
  //so it is advisable to always use save()

  // 4) Log user in, send JWT
  createSendToken(user, 200, req, res);
});
