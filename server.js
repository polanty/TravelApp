// Using Node.js `require()`
const mongoose = require('mongoose');
const dotenv = require('dotenv');

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
  .then(() => console.log('Database Connected'))
  .catch((err) => console.error('Database Connection Error:', err));

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`App running on port ${port}.....`);
});
