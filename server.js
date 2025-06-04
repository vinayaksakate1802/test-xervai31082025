require('dotenv').config(); // Optional in Azure App Service
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many submissions, please try again later.'
});
app.use('/submit-contact', limiter);

// Gmail transporter (current setup)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Office 365 transporter (uncomment when switching)
// const transporter = nodemailer.createTransport({
//   host: 'smtp.office365.com',
//   port: 587,
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   },
//   tls: {
//     ciphers: 'SSLv3'
//   }
// });

// Office 365 with OAuth2 (uncomment if required)
// const transporter = nodemailer.createTransport({
//   host: 'smtp.office365.com',
//   port: 587,
//   secure: false,
//   auth: {
//     type: 'OAuth2',
//     user: process.env.EMAIL_USER,
//     clientId: process.env.OAUTH_CLIENT_ID,
//     clientSecret: process.env.OAUTH_CLIENT_SECRET,
//     refreshToken: process.env.OAUTH_REFRESH_TOKEN
//   }
// });

app.post('/submit-contact', async (req, res) => {
  const { name, phone, email, onlineMeeting, preferredTime, timezone, reason, service, message } = req.body;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: `New Contact Form Submission: ${reason}`,
    text: `
      Name: ${name}
      Phone: ${phone}
      Email: ${email}
      Online Meeting: ${onlineMeeting ? 'Yes' : 'No'}
      Preferred Time: ${preferredTime || 'Not specified'}
      Timezone: ${timezone || 'Not specified'}
      Reason: ${reason}
      Service: ${service}
      Message: ${message}
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send('Form submitted successfully.');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Error submitting form.');
  }
});

app.post('/chatbot-notify', async (req, res) => {
  const { message } = req.body;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: 'Chatbot Interaction',
    text: `User message: ${message}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send('Notification sent.');
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).send('Error sending notification.');
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/services', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'services', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
