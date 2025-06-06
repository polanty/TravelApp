const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, ' A user must have a name'],
  },

  email: {
    type: String,
    required: [true, 'A user must have a valid email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please enter a valid email!'],
  },

  photo: {
    type: String,
  },

  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },

  passwordConfirm: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    validate: {
      //The variable el represent the entire Object
      //validator only works on SAVE!! or ON CREATE!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
  passwordChangedAt: {
    type: Date,
  },
});

userSchema.pre('save', async function (next) {
  //the isModified function comes from mongoose
  //This mean the function will only run when the user has just been created or modified
  if (!this.isModified('password')) return next();

  //Import bcrypt
  //bcrypt salts then hashes any value we pass in usually passwords/ strings
  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;

  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassWord,
) {
  return await bcrypt.compare(candidatePassword, userPassWord);
};

userSchema.methods.changedPasswordsAfter = async function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimestamp < changedTimestamp;
  }

  //False means Not changed
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
