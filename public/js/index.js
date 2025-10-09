/*eslint-disable*/
const { login, logout } = require('./login');
const displayMap = require('./mapbox');
const updateData = require('./updateSettings').updateData;

require('@babel/polyfill');

//DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');

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

    updateData(name, email);
  });
}
