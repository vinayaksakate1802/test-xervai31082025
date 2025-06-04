XervAi Website
XervAi Solutions LLP website, showcasing IT services including Managed IT, Cybersecurity, Cloud, AI, DevOps, and more, with a contact form and AI-powered chatbot.
Features

Homepage: Hero section with Discover More CTA linking to /services, contact form, and service cards (AI, Managed IT, Customer First).
Services Page: 3x3 grid + 2-card row showcasing 11 services (AI, Cybersecurity, Data Analytics, etc.) with Azure, AWS, SSO, MFA, SailPoint focus.
Contact Form: Submits to /submit-contact, emails test01@gmail.com with name, phone, email, online meeting preference, time, timezone, reason, service, and message.
Chatbot: Toggles with #FF4500 button, reads sitemap.xml, responds to "contact" with test01@gmail.com, notifies via email.
Styling: Montserrat font, #FF4500 color scheme, responsive hamburger menu, scrambled text animations, card hover effects.
Images: Hosted on Azure Blob Storage (e.g., https://xervaiblobstorage.blob.core.windows.net/blog-images/).

Project Structure
Xervai-Main/
├── public/
│   ├── assets/
│   │   ├── css/
│   │   │   ├── styles.css           # Main CSS with #FF4500, animations
│   │   │   └── chatbot.css          # Chatbot styling
│   │   ├── js/
│   │   │   ├── main.js             # Navigation and animations
│   │   │   └── chatbot.js          # Chatbot functionality
│   │   └── images/                 # Empty (uses Azure Blob Storage)
│   ├── index.html                  # Homepage
│   └── services/
│       └── index.html              # Services page (3x3 grid + 2-card row)
├── server.js                       # Node.js server
├── package.json                    # Dependencies and scripts
├── sitemap.xml                     # Sitemap for SEO and chatbot
├── .gitignore                      # Git ignore
└── README.md                       # This file

Installation

Clone the repository:git clone <repository-url>
cd Xervai-Main


Install dependencies:npm install


Set environment variables:
Create a .env file in the root:EMAIL_USER=test01@gmail.com
EMAIL_PASS=your-app-specific-password
PORT=3000


Generate an app-specific password for Gmail (enable 2FA, go to Google Account > Security > App passwords).


Run the server:npm start

or for development with auto-restart:npm run dev


Access the site at http://localhost:3000.

Usage

Homepage: Navigate to / for the main page with contact form and service cards.
Services: Access /services for detailed service listings (links from Discover More CTA).
Contact Form: Submit inquiries via the form on /; emails are sent to test01@gmail.com.
Chatbot: Click the Talk to Xerv-Ai button (bottom-right) to interact; queries like "contact" or service-related terms pull from sitemap.xml.
Deployment: Host on a platform like Azure or AWS, ensuring .env variables are set and static files are served from /public.

Dependencies

express: Web server framework
nodemailer: Email sending
express-rate-limit: Form submission rate limiting
body-parser: Parse form data
nodemon: Development auto-restart (dev dependency)

Notes

Images: Stored in Azure Blob Storage; ensure URLs (e.g., https://xervaiblobstorage.blob.core.windows.net/blog-images/) are accessible.
Navigation: Uses absolute URLs (e.g., https://xervai.com/it-consulting). For local dev, consider relative paths (e.g., /Whatwedo/it-consulting).
Copyright: Set to 2023 for consistency; update to 2025 if preferred (per index.html).
Contact Form: Validates phone (+1 123-456-7890 format), email, and required fields; supports optional online meeting and time/timezone.
Chatbot: Reads sitemap.xml for dynamic responses; emails notifications to test01@gmail.com.

License
© 2023 XervAi Solutions LLP. All rights reserved.
