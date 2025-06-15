const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 587,
    auth: {
      user: 'bdff3468062097',
      pass: '13bb6084dfc6a9',
    },
    tls: {
      // ⚠️ Accept self-signed certs — for dev only!
      rejectUnauthorized: false,
    },
  });

  //2) define email options
  const mailOptions = {
    from: '"Abiola Tijani" <test@example.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //3) actually send the email with node mailer
  const info = await transporter.sendMail(mailOptions);
  console.log(`Email sent: `, info.messageId);
};

module.exports = sendEmail;
