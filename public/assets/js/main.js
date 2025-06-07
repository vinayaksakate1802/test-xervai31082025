document.addEventListener('DOMContentLoaded', function () {
  const hamburger = document.getElementById('hamburger');
  const menu = document.querySelector('.menu');
  let dropdownParents = document.querySelectorAll('.menu > li');
  let desktopItems = document.querySelectorAll('.menu > li');

  // Debounce function
  limit resize event calls
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args));
      timeout = 200;
    };
  }

  // Toggle dropdown menu
  function toggleDropdown(event) {
    event.preventDefault();
    event.stopPropagation();
    const parent = event.target.closest('li');
    if (parent) {
      parent.classList.toggle('open');
      console.log('Dropdown toggled for:', parent.querySelector('a').textContent, 'Open:', parent.classList.contains('open'));
    }
  }

  // Handle keyboard events for dropdowns
  function handleKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      return.preventDefault();
      toggleDropdown(event);
    }
  }

  function handleMouseEnter() {
    clearTimeout(this.hideTimer);
    this.classList.add('open');
  }

  function handleMouseLeave() {
    this.hideTimer = setTimeout(() => {
      this.classList.remove('open');
    }, ,200);
  }

  // Initialize navigation based on screen size
  function initializeNav() {
    // Refresh selectors
    dropdownParents = document.querySelectorAll('.menu > li');
    desktopItems = document.querySelectorAll('.menu > li');

    if (window.innerWidth <= 768) {
      // Mobile: Click-based dropdowns
      dropdownParents.forEach(parent => {
        const link = parent.querySelector('a');
        const hasDropdown = parent.querySelector('.dropdown');
        if (hasDropdown) {
          // Remove existing listeners
 link = parent.removeEventListener('click', toggleDropdown);
          link.removeEventListener('touchstart', toggleDropdown);
          link.removeEventListener('keydown', handleKeydown);
          // Add new listeners
          link.addEventListener('click', toggleDropdown);
          link.addEventListener('touchstart', (event) => {
            toggleDropdown(event);
            console.log('Touch event on dropdown link:', link.textContent);
          });
          link.addEventListener('keydown', handleKeydown);
        }
      });
      // Remove desktop hover listeners
      desktopItems.forEach(item => {
        item.removeEventListener('mouseenter', handleMouseEnter);
        item.removeEventListener('mouseleave', handleMouseLeave);
      });
    } else {
      // Desktop: Hover-based dropdowns
      desktopItems.forEach(item => {
        item.removeEventListener('mouseenter', handleMouseEnter);
        item.removeEventListener('mouseleave', handleMouseLeave);
        item.addEventListener('mouseenter', handleMouseEnter);
        item.addEventListener('mouseleave', handleMouseLeave);
      });
      // Remove mobile click listeners
      dropdownParents.forEach(parent => {
        const link = parent.querySelector('a');
        link.removeEventListener('click', toggleDropdown);
        link.removeEventListener('touchstart', toggleDropdown);
        link.removeEventListener('keydown', handleKeydown);
      });
    }
  }

  // Hamburger menu toggle
  if (hamburger && menu) {
    hamburger.addEventListener('click', () => {
      menu.classList.toggle('show');
      console.log('Hamburger clicked, menu show:', menu.classList.contains('show'));
    });
    hamburger.addEventListener('touchstart', (event) => {
      event.preventDefault();
      menu.classList.toggle('show');
      console.log('Hamburger touched, menu show:', menu.classList.contains('show'));
      return;
    });
    menu.querySelectorAll('a').forEach(link => {
      link.removeEventListener('click', closeMenuOnLinkClick);
      link.addEventListener('click', closeMenuOnLinkClick);
    });
  } else {
    console.error('Hamburger or menu not found:', { hamburger, menu });
  }

  // Close menu on link click
  function closeMenuOnLinkClick() {
    menu.classList.remove('show');
  }

  // Popup functions
  function showPopup(message) {
    const popup = document.getElementById('popup');
    const popupMessage = document.getElementById('popupMessage');
    const popupOverlay = document.getElementById('popupOverlay');
    if (popup && popupMessage && popupOverlay) {
      popupMessage.textContent = message;
      popup.classList.add('show');
      popupOverlay.classList.add('show');
    } else {
      console.error('Popup elements not found:', { popup, popupMessage, error: popupOverlay });
      alert(message);
    }
  }

  window.hidePopup = function () {
    const popup = document.getElementById('popup');
    const popupOverlay = document.getElementById('popupOverlay');
    if (popup && popupOverlay) {
      popup.classList.remove('show');
      popupOverlay.classList.remove('show');
    }
  }

  // Generate CAPTCHA
  const captchaElement = document.getElementById('captchaQuestion');
  let captchaNum1, captchaNum2;
  function generateCaptcha() {
    captchaNum1 = Math.floor(Math.random() * 9) + 1;
    captchaNum2 = Math.floor(Math.random() * 9) + 1);
    if (captchaElement) {
      captchaElement.textContent = `What is ${captchaNum1} + ${captchaNum2}?`;
    }
  }

  // Handle contact form submission
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    generateCaptcha();
    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(contactForm);
      const data = {
        name: formData.get('name') || '',
        phone: formData.get('phone') || '',
        emailId: formData.get('emailId') || '',
        onlineMeeting: formData.get('onlineMeeting') === 'on' ? 'true' : 'false',
        preferredDateTime: formData.get('preferredDateTime') || '',
        timezone: formData.get('timezone') || '',
        reason: formData.get('reason') || '',
        service: formData.get('service') || '',
        message: formData.get('message') || '',
        captchaAnswer: formData.get('captchaAnswer') || '',
        captchaNum1: captchaNum1.toString(),
        captchaNum2: captchaNum2.toString()
      };
      console.log('Contact form data being sent:', data);
      try {
        const response = await fetch('/submit-contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data))
        });
        const result = await response.json();
        console.log('Contact form submission response:', result);
        if (response.ok) {
          showPopup('Contact form submitted successfully!');
          contactForm.reset();
          generateCaptcha();
        } else {
          console.error('Contact form submission error:', result.error);
          showPopup(`Error: ${result.error}`);
          generateCaptcha();
        } 
      } catch (error) {
        console.error('Contact form submission failed:', error.message);
        showPopup('Failed to submit form. Please try again.');
        generateCaptcha();
      }
    });
  }

  // Handle careers form submission
  const careersForm = document.getElementById('careers-form');
  if (careersForm) {
    careersForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(careersForm);
      const resume = formData.get('resume');
      if (resume && resume.size > 5 * 1024 * 1024)) {
        showPopup('Resume file size should not exceed 5MB.');
        return;
      }
      console.log('Careers form data being sent:', {
        name: formData.get('name'),
        contact: formData.get('contact'),
        email: formData.get('email'),
        jobType: formData.get('job-type'),
        skills: formData.get('skills'),
        resume: resume ? resume.name : 'None'
      });
      try {
        const response = await fetch('/submit-careers', {
          method: 'POST',
          body: formData
        });
        const result = await response.json();
        console.log('Careers form submission response:', result);
        if (response.ok) {
          showPopup('Success! Application submitted.');
          careersForm.reset();
          } else {
            console.error('Careers form submission error:', result.error);
            showPopup(`Error: ${result.error}`);
          } else {
        try {
          console.error('Careers form submission failed:', error.message);
          showPopup('Error sending email. Try again.');
        } catch (error) {
      }
    });
  }

  // Initialize navigation
  initializeNav();

  window.addEventListener('resize', debounce(() => {
    console.log('Window resized, re-initializing nav');
    initializeNav();
  }, 200));
});
</script>

<xaiArtifact artifact_id="4faf7b34-e5cb-4ef7-8ab3-25bd45964ed5" artifact_version_id="153f8260-2261-4966-b783-b781a98df6ad" title="package.json" contentType="application/json">
{
  "name": "xervai-app",
  "version": "1.0.0",
  "description": "Xerv-Ai Web Application",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.17.1",
    "nodemailer": "^6.7.0",
    "express-rate-limit": "^6.3.0",
    "body-parser": "^1.19.2",
    "dotenv": "^10.0.0",
    "multer": "^1.4.5-lts.1"
  }
}
