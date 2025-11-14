const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;

  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}.  Please use another value !`;

  return new AppError(message, 400);
};

const handleValidatorErrDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;

  return new AppError(message, 400);
};

//Json error validation
const handleJsonValidationError = (err) =>
  new AppError('Invalid token. Please log in again!', 401);

//Token expired error handler
const handleTokenExpirationError = (err) => new AppError('Invalid token', 401);

const sendErrorDev = (err, req, res) => {
  //API
  const isApi = req.originalUrl && req.originalUrl.startsWith('/api');
  if (isApi) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  //RENDERED WEBSITES
  console.error('Error 🤢');
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    message: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  const isApi = req.originalUrl && req.originalUrl.startsWith('/api');
  if (isApi) {
    //API
    //This Operational error shpuld be sent to the customer while the other error should be sent to developer to identify an arror occured
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
      // Programming or unknown error, we do not want the client seeing this details
    }
    // 1) Log the error
    console.error('Error 🤢');

    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }

  //RENDERED WEBSITE
  //This Operational error shpuld be sent to the customer while the other error should be sent to developer to identify an arror occured
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: err.status,
      message: err.message,
    });
    // Programming or unknown error, we do not want the client seeing this details
  }
  // 1) Log the error
  console.error('Error 🤢');

  return res.status(500).json({
    title: 'error',
    message: 'Please try again later',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    //Cast Hnadler - Incase you pass in an invalid ID
    if (error.name === 'CastError') error = handleCastErrorDB(error);

    //Error code handler - for case where you enter a duplicate value where it is not allowed
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);

    //Validator error coming from wrong values as defined in the Model
    if (error.name === 'ValidationError') error = handleValidatorErrDB(error);

    //Json validation
    if (error.name === 'JsonWebTokenError')
      error = handleJsonValidationError(error);

    //expired token handling error
    if (error.name === 'TokenExpiredError')
      error = handleTokenExpirationError(error);
    sendErrorProd(error, res);
  }
};
