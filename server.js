require('dotenv').config();
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

// Rate limit for contact form submissions
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many submissions, please try again later.'
});
app.use('/submit-contact', limiter);

// Rate limit for chatbot notifications
const chatbotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many chatbot interactions, please try again later.'
});
app.use('/chatbot-notify', chatbotLimiter);

// Office 365 transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    ciphers: 'SSLv3'
  }
});

// Validate input fields
function validateInput(data, requiredFields) {
  for (const field of requiredFields) {
    if (!data[field] || data[field].trim() === '') {
      return false;
    }
  }
  return true;
}

app.post('/submit-contact', async (req, res) => {
  const { name, phone, emailId, onlineMeeting, preferredDateTime, timezone, reason, service, message } = req.body;

  // Validate required fields
  if (!validateInput(req.body, ['name', 'emailId', 'reason', 'service', 'message'])) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const mailOptions = {
    from: `"Xerv-Ai Contact" <${process.env.EMAIL_ADDRESS}>`,
    to: process.env.CEMAIL_ADDRESS,
    subject: `New Contact Form Submission: ${reason}`,
    text: `
      Name: ${name}
      Phone: ${phone || 'Not specified'}
      Email: ${emailId}
      Online Meeting: ${onlineMeeting ? 'Yes' : 'No'}
      Preferred Time: ${preferredDateTime || 'Not specified'}
      Timezone: ${timezone || 'Not specified'}
      Reason: ${reason}
      Service: ${service}
      Message: ${message}
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Form submitted successfully!' });
  } catch (error) {
    console.error('Error sending contact form email:', error.message);
    res.status(500).json({ error: 'Failed to submit form. Please try again.' });
  }
});

app.post('/chatbot-notify', async (req, res) => {
  const { type, name, message, preferredTime, timezone } = req.body;

  // Validate required fields based on type
  if (!type || !message) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  if (type === 'schedule' && (!preferredTime || !timezone)) {
    return res.status(400).json({ error: 'Missing time or timezone for scheduling.' });
  }

  let subject = 'Chatbot Interaction';
  let body = `User Message: ${message}\n`;
  if (type === 'schedule') {
    subject = `Chatbot Scheduling Request from ${name || 'Anonymous'}`;
    body += `Type: Schedule Call\nPreferred Time: ${preferredTime}\nTimezone: ${timezone}\nName: ${name || 'Unknown'};
  } else if (type === 'phone') {
    subject = `Chatbot Phone Inquiry from ${name || 'Anonymous'}`;
    body += `Type: Phone Inquiry\nName: ${name || 'Unknown'}`;
  }

  const mailOptions = {
    from: `"Xerv-Ai Chatbot" <${process.env.EMAIL_ADDRESS}>`,
    to: process.env.CEMAIL_ADDRESS,
    subject,
    text: body
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Notification sent successfully!' });
  } catch (error) {
    console.error('Error sending chatbot notification:', error.message);
    res.status(500).json({ error: 'Failed to send notification. Please try again.' });
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
