const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRoute = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

//Security packages
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const app = express();

app.enable('trust proxy');

//template engine for front end rendering
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Set Security HTTP header

// ...existing code...
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'default-src': ["'self'"],
        'script-src': [
          "'self'",
          'http://127.0.0.1:8000',
          'http://localhost:8000',
          'https://api.mapbox.com',
          'https://cdnjs.cloudflare.com',
          'https://js.stripe.com', // allow Stripe.js
        ],
        'style-src': [
          "'self'",
          "'unsafe-inline'",
          'https://api.mapbox.com',
          'https://fonts.googleapis.com',
        ],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
        'img-src': [
          "'self'",
          'data:',
          'https://api.mapbox.com',
          'https://events.mapbox.com',
        ],
        'connect-src': [
          "'self'",
          'http://127.0.0.1:8000',
          'http://localhost:8000',
          'https://api.mapbox.com',
          'https://events.mapbox.com',
          'https://js.stripe.com', // allow Stripe network calls
        ],
        'worker-src': ["'self'", 'blob:'],
        'object-src': ["'none'"],
        'frame-src': ["'self'", 'https://js.stripe.com'], // allow Stripe checkout frames
      },
    },
  }),
);

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

//Middle ware to allow me to get submit POST request from HTML forms
//from a URL encoded form
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

//Cookie parser
app.use(cookieParser());

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

app.use(compression());

//app.use(express.static(`${__dirname}/public`)); //Serving static files
app.use(express.static(path.join(__dirname, 'public'))); //Serving static files

//Set time on the request object which is avaialaible on all the request
app.use((req, res, next) => {
  req.requestedTime = new Date().toISOString();
  // console.log(req.cookies);

  next();
});

app.use('/', viewRoute);

//Routes to the tour aspects
app.use('/api/v1/tours', tourRouter);

//Routes to the user aspects
app.use('/api/v1/users', userRouter);

//Routes to the Reviews
app.use('/api/v1/reviews', reviewRouter);

app.use('/api/v1/bookings', bookingRouter);

//Handles all unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//Error handling middleware
//handles any other error not caught in program functionality

app.use(globalErrorHandler);
module.exports = app;
