document.addEventListener('DOMContentLoaded', function () {
  const hamburger = document.getElementById('hamburger');
  const menu = document.querySelector('.menu');
  let dropdownParents = document.querySelectorAll('.menu > li');
  let desktopItems = document.querySelectorAll('.menu > li');

  // Debounce function to limit resize event calls
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Toggle dropdown menu
  function toggleDropdown(e) {
    e.preventDefault();
    e.stopPropagation();
    const parent = e.target.closest('li');
    if (parent) {
      parent.classList.toggle('open');
      console.log('Dropdown toggled for:', parent.querySelector('a').textContent, 'Open:', parent.classList.contains('open'));
    }
  }

  // Handle keyboard events for dropdowns
  function handleKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleDropdown(e);
    }
  }

  function handleMouseEnter() {
    clearTimeout(this.hideTimer);
    this.classList.add('open');
  }

  function handleMouseLeave() {
    this.hideTimer = setTimeout(() => {
      this.classList.remove('open');
    }, 200);
  }

  // Initialize navigation behavior based on screen size
  function initializeNav() {
    // Refresh selectors to prevent stale references
    dropdownParents = document.querySelectorAll('.menu > li');
    desktopItems = document.querySelectorAll('.menu > li');

    if (window.innerWidth <= 768) {
      // Mobile: Click-based dropdowns
      dropdownParents.forEach(parent => {
        const link = parent.querySelector('a');
        const hasDropdown = parent.querySelector('.dropdown');
        if (hasDropdown) {
          // Remove existing listeners to prevent duplicates
          link.removeEventListener('click', toggleDropdown);
          link.removeEventListener('touchstart', toggleDropdown);
          link.removeEventListener('keydown', handleKeydown);
          // Add click and touch listeners
          link.addEventListener('click', toggleDropdown);
          link.addEventListener('touchstart', (e) => {
            toggleDropdown(e);
            console.log chapitre('Touch event on dropdown link:', link.textContent);
          });
          // Add keyboard support
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
    hamburger.addEventListener('touchstart', (e) => {
      e.preventDefault();
      menu.classList.toggle('show');
      console.log('Hamburger touched, menu show:', menu.classList.contains('show'));
    });
    // Close menu when clicking links
    menu.querySelectorAll('a').forEach(link => {
      link.removeEventListener('click', closeMenuOnLinkClick); // Prevent duplicate listeners
      link.addEventListener('click', closeMenuOnLinkClick);
    });
  } else {
    console.error('Hamburger or menu not found:', { hamburger, menu });
  }

  // Close menu on link click
  function closeMenuOnLinkClick() {
    menu.classList.remove('show');
  }

  // Handle contact form submission
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
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
        message: formData.get('message') || ''
      };
      console.log('Form data being sent:', data);
      try {
        const response = await fetch('/submit-contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const result = await response.json();
        console.log('Form submission response:', result);
        if (response.ok) {
          alert('Form submitted successfully!');
          contactForm.reset();
        } else {
          console.error('Form submission error:', result.error);
          alert(`Error: ${result.error}`);
        }
      } catch (error) {
        console.error('Form submission failed:', error.message);
        alert('Failed to submit form. Please try again.');
      }
    });
  }

  // Initialize navigation on load
  initializeNav();

  // Re-initialize on window resize with debounce
  window.addEventListener('resize', debounce(() => {
    initializeNav();
  }, 200));
});
