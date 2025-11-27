/*eslint-disable*/
const axios =
  (require('axios') && require('axios').default) || require('axios');
const { showAlert } = require('./alerts');

const getErrorMessage = (err) =>
  (err && err.response && err.response.data && err.response.data.message) ||
  (err && err.message) ||
  'An unexpected error occurred';

module.exports.login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res && res.data && res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (error) {
    showAlert('error', getErrorMessage(error));
  }
};

module.exports.logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });

    if (res && res.data && res.data.status === 'success') location.reload();
  } catch (error) {
    showAlert('error', getErrorMessage(error));
  }
};
