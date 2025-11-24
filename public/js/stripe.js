/*eslint-disable*/
const axios =
  (require('axios') && require('axios').default) || require('axios');
const { showAlert } = require('./alerts');

let stripePromise = null;
const getStripe = async () => {
  if (!stripePromise) {
    // load Stripe using CommonJS require to avoid parser errors in this environment
    const { loadStripe } = require('@stripe/stripe-js');
    stripePromise = loadStripe(
      'pk_test_51SWiKpEIA2zSyutJrRPeGXbONI3DgRe3lxM0BLMSRdF5setGFEi8PAjynRqzExuESGQTQZcfYEAYddGkIaJM9mne00jjstmlKR',
    );
  }
  return stripePromise;
};

const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from the server
    const { data } = await axios.get(
      `/api/v1/bookings/checkout-session/${tourId}`,
    );

    // 2) Redirect to checkout
    const stripe = await getStripe();
    await stripe.redirectToCheckout({
      sessionId: data.session.id,
    });
  } catch (err) {
    console.error(err);
    showAlert('error', err.message);
    // alert(
    //   (err.response && err.response.data && err.response.data.message) ||
    //     err.message,
    // );
  }
};

module.exports = { bookTour };
