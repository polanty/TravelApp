const crypto = require('crypto');
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
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
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
  passwordResetToken: String,
  passwordResetExpires: Date,
});

userSchema.pre('save', async function (next) {
  //the isModified function comes from mongoose
  //This mean the function will only run when the user has just been created and the password is not modified
  if (!this.isModified('password')) return next();

  //Import bcrypt
  //bcrypt salts then hashes any value we pass in usually passwords/ strings
  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;

  next();
});

userSchema.pre('save', async function (next) {
  //the isModified function comes from mongoose
  //This mean the function will only run when the user has just been created and the password is not modified
  if (!this.isModified('password') || this.isNew()) return next();

  this.passwordChangedAt = Date.now() - 1000;

  next();
});

//To check if password provided is correct
//Encrypted password comparison using bycrypt
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassWord,
) {
  return await bcrypt.compare(candidatePassword, userPassWord);
};

//Compare if the time stamp from the JWT token is lesser than the password change time
//This will be put to use based on the password change function
userSchema.methods.changedPasswordsAfter = function (JWTTimestamp) {
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

//Creating a password reste token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
