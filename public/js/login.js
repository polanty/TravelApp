/*eslint-disable*/
const axios = require('axios').default;
const { showAlert } = require('./alerts');

module.exports.login = async (email, password) => {
  console.log(email, password);

  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:8000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      showAlert('Logged in successfully!');

      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }

    // console.log(res);
    // console.log('This came from here');
  } catch (error) {
    showAlert(
      'error',
      error?.response?.data?.message ||
        error?.message ||
        'An unexpected error occurred',
    );
  }
};
