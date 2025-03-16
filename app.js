const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// console.log(process.env.NODE_ENV);

// Middle wares
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestedTime = new Date().toISOString();

  next();
});

//Routes to the tour aspects
app.use('/api/v1/tours', tourRouter);

//Routes to the user aspects
app.use('/api/v1/users', userRouter);

module.exports = app;
