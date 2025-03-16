const express = require('express');
const userController = require('../controllers/userController');

//User Routes
const router = express.Router();

const { getAllUsers, createUser, getUser, updateUser, deleteUser } =
  userController;

router.route('/').get(getAllUsers).post(createUser);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
