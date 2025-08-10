const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Tour = require('../../Models/tourModel');
const Review = require('../../Models/reviewModel');
const User = require('../../Models/userModel');

dotenv.config({
  path: './.env',
});

const DB_PASSWORD = process.env.MONGODB_PASSWORD;
const DB = process.env.DATEBASE.replace('<PASSWORD>', DB_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true, // Ensures support for the new Server Discovery and Monitoring engine
  })
  .then(() => console.log('Database Connected'))
  .catch((err) => console.error('Database Connection Error:', err));

//READ JSON FILE
const readFile = JSON.parse(
  fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'),
);

const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'),
);

//IMPORT DATA TO DATABASE
const importDataIntoDB = async () => {
  try {
    await Tour.create(readFile);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('Data successfully loaded!');
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

//DELETED ALL DATA FROM COLLECTION
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await Review.deleteMany();
    await User.deleteMany();
    console.log('Data successfully deleted!');
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

if (process.argv[2] === '--import') {
  importDataIntoDB();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

console.log(process.argv);
