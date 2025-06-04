const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Rate limiting for contact form
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many submissions, please try again later.'
});
app.use('/submit-contact', limiter);

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'test01@gmail.com',
    pass: process.env.EMAIL_PASS // Set in environment variables
  }
});

// Contact form submission
app.post('/submit-contact', async (req, res) => {
  const { name, phone, email, onlineMeeting, preferredTime, timezone, reason, service, message } = req.body;

  const mailOptions = {
    from: 'test01@gmail.com',
    to: 'test01@gmail.com',
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

// Chatbot notification (e.g., user queries "contact")
app.post('/chatbot-notify', async (req, res) => {
  const { message } = req.body;

  const mailOptions = {
    from: 'test01@gmail.com',
    to: 'test01@gmail.com',
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

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve services page
app.get('/services', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'services', 'index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
