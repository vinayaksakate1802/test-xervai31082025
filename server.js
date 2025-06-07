require('dotenv').config();
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

app.set('trust proxy', 1); // Trust first proxy for X-Forwarded-For
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Log email config
console.log('Email config:', {
  user: process.env.EMAIL_ADDRESS,
  pass: process.env.EMAIL_PASSWORD ? 'Set' : 'Not set',
  recipient: process.env.CEMAIL_ADDRESS || 'Not set'
});

// Rate limit for contact form submissions
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many submissions, please try again.',
  keyGenerator: (req) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
    return ip.split(':')[0]; // Remove port if present
  }
});
app.use('/submit-contact', limiter);

// Rate limit for chatbot notifications
const chatbotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many chatbot interactions, please try again later.',
  keyGenerator: (req) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
    return ip.split(':')[0]; // Remove port if present
  }
});
app.use('/chatbot-notify', chatbotLimiter);

// Gmail transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verify transporter configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error('Transporter verification failed:', error.message);
  } else {
    console.log('Transporter is ready to send emails');
  }
});

// Validate input fields
function validateInput(data, requiredFields) {
  for (const field of requiredFields) {
    if (!data[field] || data[field].trim() === '') {
      console.error(`Validation failed: Missing or empty field: ${field}`);
      return false;
    }
  }
  return true;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/submit-contact', async (req, res) => {
  const { name, phone, emailId, onlineMeeting, preferredDateTime, timezone, reason, service, message, captchaAnswer, captchaNum1, captchaNum2 } = req.body;
  
  // Log received form data
  console.log('Received form data:', req.body);

  // Validate CAPTCHA
  const expectedAnswer = parseInt(captchaNum1) + parseInt(captchaNum2);
  if (parseInt(captchaAnswer) !== expectedAnswer) {
    console.error('CAPTCHA validation failed:', { captchaAnswer, expectedAnswer });
    return res.status(400).json({ error: 'Incorrect CAPTCHA answer.' });
  }

  // Validate required fields
  if (!validateInput(req.body, ['name', 'emailId', 'reason', 'service', 'message'])) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  // Check if CEMAIL_ADDRESS is set
  if (!process.env.CEMAIL_ADDRESS) {
    console.error('CEMAIL_ADDRESS is not set');
    return res.status(500).json({ error: 'Server configuration error: Missing recipient email.' });
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

  // Check if CEMAIL_ADDRESS is set
  if (!process.env.CEMAIL_ADDRESS) {
    console.error('CEMAIL_ADDRESS is not set');
    return res.status(500).json({ error: 'Server configuration error: Missing recipient email.' });
  }

  let subject = 'Chatbot Interaction';
  let body = `User Message: ${message}\n`;
  if (type === 'schedule') {
    subject = `Chatbot Scheduling Request from ${name || 'Anonymous'}`;
    body += `Type: Schedule Call\nPreferred Time: ${preferredTime}\nTimezone: ${timezone}\nName: ${name || 'Unknown'}`;
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

// Routes for existing pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/services', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'services', 'index.html'));
});

app.get('/contact-us', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contact-us', 'index.html'));
});

app.get('/careers', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'careers', 'index.html'));
});

// About routes
app.get('/our-story', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'About', 'our-story', 'index.html'));
});

app.get('/our-team', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'About', 'our-team', 'index.html'));
});

app.get('/vision', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'About', 'vision', 'index.html'));
});

// Industries routes
app.get('/healthcare', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Industries', 'healthcare', 'index.html'));
});

app.get('/banking-finance', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Industries', 'banking-finance', 'index.html'));
});

app.get('/pharma', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Industries', 'pharma', 'index.html'));
});

app.get('/consumer', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Industries', 'consumer', 'index.html'));
});

app.get('/energy', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Industries', 'energy', 'index.html'));
});

app.get('/retail', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Industries', 'retail', 'index.html'));
});

app.get('/manufacturing', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Industries', 'manufacturing', 'index.html'));
});

// Whatwedo routes
app.get('/ai', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Whatwedo', 'ai', 'index.html'));
});

app.get('/cloud', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Whatwedo', 'cloud', 'index.html'));
});

app.get('/cybersecurity', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Whatwedo', 'cybersecurity', 'index.html'));
});

app.get('/data-analytics', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Whatwedo', 'data-analytics', 'index.html'));
});

app.get('/devops', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Whatwedo', 'devops', 'index.html'));
});

app.get('/engineering-solutions', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Whatwedo', 'engineering-solutions', 'index.html'));
});

app.get('/go-digital', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Whatwedo', 'go-digital', 'index.html'));
});

app.get('/it-consulting', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Whatwedo', 'it-consulting', 'index.html'));
});

app.get('/migration', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Whatwedo', 'migration', 'index.html'));
});

app.get('/onpremise', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Whatwedo', 'onpremise', 'index.html'));
});

app.get('/smartapps', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Whatwedo', 'smartapps', 'index.html'));
});

app.get('/startup-zone', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Whatwedo', 'startup-zone', 'index.html'));
});

// Catch-all for unmatched routes
app.use((req, res) => {
  res.status(404).send('Page not found');
});

app.listen(port, () => {
  console.log(`XervAi server started on port ${port} at ${new Date().toISOString()}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'Production'}`);
  console.log(`Email configured for: ${process.env.EMAIL_ADDRESS || 'Not set'}`);
});
