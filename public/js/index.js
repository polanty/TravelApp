/*eslint-disable*/
const { login, logout } = require('./login');
const displayMap = require('./mapbox');
const updateData = require('./updateSettings').updateData;
const updateSettings = require('./updateSettings').updateSettings;

require('@babel/polyfill');

//DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

// DELEGATIONS
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);

  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // VALUES
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // console.log('hello');

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    // const photo = document.getElementById('photo').files[0];

    // updateData(name, email);
    updateSettings({ name, email }, 'data');
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    // console.log('hello');

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    // updatePassword(passwordCurrent, password, passwordConfirm);
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password',
    );

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}
