const express = require('express');
const userController = require('../controllers/userController');
const userAuthentication = require('../controllers/authenticationController');

//User Routes
const router = express.Router();

const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  deleteMe,
  updateMe,
} = //updateMe
  userController;

const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
} = userAuthentication;

//sign up route
router.post('/signup', signup);

//Login route
router.post('/login', login);

//Forget password route
router.post('/forgotPassword', forgotPassword);

//reset password route
router.patch('/resetPassword/:token', resetPassword);

//reset password route
router.patch('/updatePassword', protect, updatePassword);

//Update user Information
router.patch('/updateMe', protect, updateMe);

//Delete User Information
router.delete('/deleteMe', protect, deleteMe);

router.route('/').get(getAllUsers).post(createUser);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
