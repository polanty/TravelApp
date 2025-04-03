class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    const queryOBJ = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    //filtering away above array as these are essential for sorting and pagination
    excludedFields.forEach((el) => delete queryOBJ[el]);

    let queryStr = JSON.stringify(queryOBJ);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitting() {
    if (this.query.fields) {
      const fields = this.query.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limitVal = this.queryString.limit * 1 || 100;
    const skipVal = (page - 1) * limitVal;

    //Pagination on the routes below
    //skip function provided by MongoDb
    this.query = this.query.skip(skipVal).limit(limitVal).exec();

    return this;
  }
}

module.exports = APIFeatures;
