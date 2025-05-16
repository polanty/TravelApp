const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//console.log(process.env);

// Middle wares
app.use(express.json());
app.use(express.static(`${__dirname}/p  ublic`));

app.use((req, res, next) => {
  req.requestedTime = new Date().toISOString();

  next();
});

//Routes to the tour aspects
app.use('/api/v1/tours', tourRouter);

//Routes to the user aspects
app.use('/api/v1/users', userRouter);

//Handles all unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//Error handling middleware
//handles any other error not caught in program functio nality

app.use(globalErrorHandler);
module.exports = app;
