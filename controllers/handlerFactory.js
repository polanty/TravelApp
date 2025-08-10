const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    //read one single document from data base
    const docID = req.params.id;

    //finding one from the DB by the parameter
    const doc = await Model.findByIdAndDelete(docID);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.createDocument = (Model) =>
  catchAsync(async (req, res, next) => {
    //create using the request body
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: doc,
    });
  });

exports.UpdateDocument = (Model) =>
  catchAsync(async (req, res, next) => {
    //read one single document from data base
    const docID = req.params.id;

    //finding one from the DB by the parameter
    const doc = await Model.findByIdAndUpdate(docID, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

exports.getOneDocument = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    //read one single document from data base
    const docID = req.params.id;

    //finding one from the DB by the parameter
    let query = Model.findById(docID);
    if (popOptions) query = query.populate(popOptions);

    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

exports.getAllDocuments = (Model) =>
  catchAsync(async (req, res, next) => {
    //Allow for nested get reviews on Tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    //read all tours from data base
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitting()
      .pagination();

    //Execute the query
    const doc = await features.query;

    res.status(200).json({
      status: 'success',
      date: req.requestedTime,
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
