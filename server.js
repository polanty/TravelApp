// Using Node.js `require()`
const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION 🎃 Shutting down.....');

  process.exit(1);
});

dotenv.config({
  path: './.env',
});

const app = require('./app');

// console.log(app.get('env'));

// console.log(process.env);
const DB_PASSWORD = process.env.MONGODB_PASSWORD;
const DB = process.env.DATEBASE.replace('<PASSWORD>', DB_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true, // Ensures support for the new Server Discovery and Monitoring engine
  })
  .then(() => console.log('Database Connected'));
//.catch((err) => console.error('Database Connection Error:', err));

const port = process.env.PORT;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}.....`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION 🎃 Shutting down.....');

  server.close(() => {
    process.exit(1);
  });
});
