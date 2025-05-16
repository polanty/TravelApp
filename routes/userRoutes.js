const express = require('express');
const userController = require('../controllers/userController');
const userAuthentication = require('../controllers/authenticationController');

//User Routes
const router = express.Router();

const { getAllUsers, createUser, getUser, updateUser, deleteUser } =
  userController;

const { signup } = userAuthentication;

router.post('/signup', signup);

router.route('/').get(getAllUsers).post(createUser);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
