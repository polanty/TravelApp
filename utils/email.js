const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Abiola Tijani <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      //SendGrid
      return 1;
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        // ⚠️ Accept self-signed certs — for dev only!
        rejectUnauthorized: false,
      },
    });
  }

  send(template, subject) {
    //1) Create a transporter
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      },
    );

    //2) define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html: html,
      text: htmlToText.fromString(html),
    };

    //Create Transport and send email
    return this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send(
      'Welcome to the Natours Family!',
      `Hello ${this.firstName},\n Welcome to the Natours family! We are excited to have you on board.\n If you have any questions, feel free to reach out to us at any time.\n Best regards,\n The Natours Team`,
    );
  }

  async sendPasswordReset() {
    await this.send(
      'Your password reset token (valid for only 10 minutes)',
      `Hello ${this.firstName},\n You requested a password reset. Please click on the following link to reset your password:\n ${this.url}\n If you did not request this, please ignore this email.\n Best regards,\n The Natours Team`,
    );
  }
};
