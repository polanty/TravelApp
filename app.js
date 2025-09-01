const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

//Security packages
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();

//template engine for front end rendering
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Set Security HTTP headers
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//console.log(process.env);
// Used to define how many request per IP to stop Denial of service or Brute force attack
//Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP , please try again in an hour!',
});

app.use('/api', limiter);

// Middle wares
app.use(express.json({ limit: '10kb' })); // without this code, the Json function from the Postman will not work

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

//Data sanitization against XSS
app.use(xss());

//Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroup',
      'difficulty',
      'price',
    ],
  }),
);

//app.use(express.static(`${__dirname}/public`)); //Serving static files
app.use(express.static(path.join(__dirname, 'public'))); //Serving static files

//Set time on the request object which is avaialaible on all the request
app.use((req, res, next) => {
  req.requestedTime = new Date().toISOString();
  // console.log(req.headers);

  next();
});

//Routes for the View Rendered by pugs
app.get('/', (req, res) => {
  res.status(200).render('base', {
    tour: 'The Tour',
    user: 'John doe',
  });
});

//Routes to the tour aspects
app.use('/api/v1/tours', tourRouter);

//Routes to the user aspects
app.use('/api/v1/users', userRouter);

//Routes to the Reviews
app.use('/api/v1/reviews', reviewRouter);

//Handles all unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//Error handling middleware
//handles any other error not caught in program functionality

app.use(globalErrorHandler);
module.exports = app;
