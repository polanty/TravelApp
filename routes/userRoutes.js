const express = require('express');
const userController = require('../controllers/userController');
const userAuthentication = require('../controllers/authenticationController');

//User Routes
const router = express.Router();

const { getAllUsers, createUser, getUser, updateUser, deleteUser } =
  userController;

const { signup, login, forgotPassword, resetPassword } = userAuthentication;

//sign up route
router.post('/signup', signup);

//Login route
router.post('/login', login);

//Forget password route
router.post('/forgotPassword', forgotPassword);

//reset password route
router.patch('/resetPassword/:token', resetPassword);

router.route('/').get(getAllUsers).post(createUser);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
