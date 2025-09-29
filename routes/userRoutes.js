const express = require('express');
const userController = require('../controllers/userController');
const userAuthentication = require('../controllers/authenticationController');

//User Routes
const router = express.Router();

const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  deleteMe,
  updateMe,
  getMe,
  getUser,
} = //updateMe
  userController;

const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  logout,
} = userAuthentication;

//sign up route
router.post('/signup', signup);

//Login route
router.post('/login', login);

//Logged in user route
router.get('/logout', logout);

router.get('/me', protect, getMe, getUser);

//Forget password route
router.post('/forgotPassword', forgotPassword);

//reset password route
router.patch('/resetPassword/:token', resetPassword);

//Used to protect all the middle ware that comes after this middle ware to require all users to be logged in
router.use(protect);

//reset password route
router.patch('/updatePassword', updatePassword);

//Update user Information
router.patch('/updateMe', updateMe);

//Delete User Information
router.delete('/deleteMe', deleteMe);

router.use(userAuthentication.restrictTo('admin'));

router.route('/').get(getAllUsers).post(createUser);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
