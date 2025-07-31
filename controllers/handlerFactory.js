const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

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
