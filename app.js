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

//Security packages
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const app = express();

//template engine for front end rendering
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Set Security HTTP headers
//app.use(helmet());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'default-src': ["'self'"],

        // ✅ Allow Mapbox scripts
        'script-src': [
          "'self'",
          'http://127.0.0.1:8000',
          'http://localhost:8000',
          'https://api.mapbox.com',
          'https://cdnjs.cloudflare.com',
          'https://cdnjs.cloudflare.com/ajax/',
          'https://cdnjs.cloudflare.com/ajax/libs/',
          'https://cdnjs.cloudflare.com/ajax/libs/axios/',
        ],

        // ✅ Allow Mapbox & Google Fonts styles
        'style-src': [
          "'self'",
          "'unsafe-inline'",
          'https://api.mapbox.com',
          'https://fonts.googleapis.com',
        ],

        // ✅ Allow Mapbox fonts
        'font-src': ["'self'", 'https://fonts.gstatic.com'],

        // ✅ Allow images (local, base64, Mapbox)
        'img-src': [
          "'self'",
          'data:',
          'https://api.mapbox.com',
          'https://events.mapbox.com',
        ],

        // ✅ Allow API calls to Mapbox
        'connect-src': [
          "'self'",
          'http://127.0.0.1:8000',
          'http://localhost:8000',
          'https://api.mapbox.com',
          'https://events.mapbox.com',
          'https://cdnjs.cloudflare.com',
          'https://cdnjs.cloudflare.com/ajax/',
          'https://cdnjs.cloudflare.com/ajax/libs/',
          'https://cdnjs.cloudflare.com/ajax/libs/axios/',
        ],

        // ✅ Allow workers created from blob URLs
        'worker-src': ["'self'", 'blob:'],

        // (optional) if you use inline mapbox styles as JSON
        'object-src': ["'none'"],
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

//app.use(express.static(`${__dirname}/public`)); //Serving static files
app.use(express.static(path.join(__dirname, 'public'))); //Serving static files

//Set time on the request object which is avaialaible on all the request
app.use((req, res, next) => {
  req.requestedTime = new Date().toISOString();
  console.log(req.cookies);

  next();
});

app.use('/', viewRoute);

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
