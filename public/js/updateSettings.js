const axios = require('axios').default;
const { showAlert } = require('./alerts');

// update Data
exports.updateData = async (name, email) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:8000/api/v1/users/updateMe',
      data: {
        name,
        email,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Data updated successfully!');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

// update Data and Password
// A modification from the above function
exports.updateSettings = async (data, type) => {
  //type is either password or data

  const url =
    type === 'password'
      ? 'http://127.0.0.1:8000/api/v1/users/updateMyPassword'
      : 'http://127.0.0.1:8000/api/v1/users/updateMe';

  try {
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
