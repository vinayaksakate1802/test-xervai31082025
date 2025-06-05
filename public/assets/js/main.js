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

  // Initialize navigation behavior based on screen size
  function initializeNav() {
    if (window.innerWidth <= 768) {
      // Mobile: Click-based dropdowns
      dropdownParents.forEach(parent => {
        const link = parent.querySelector('a');
        const hasDropdown = parent.querySelector('.dropdown');
        if (hasDropdown) {
          // Remove existing listeners to prevent duplicates
          link.removeEventListener('click', toggleDropdown);
          link.addEventListener('click', toggleDropdown);
          // Add keyboard support
          link.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleDropdown(e);
            }
          });
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
        let hideTimer;
        item.removeEventListener('mouseenter', handleMouseEnter);
        item.removeEventListener('mouseleave', handleMouseLeave);
        item.addEventListener('mouseenter', handleMouseEnter);
        item.addEventListener('mouseleave', handleMouseLeave);
      });
      // Remove mobile click listeners
      dropdownParents.forEach(parent => {
        const link = parent.querySelector('a');
        link.removeEventListener('click', toggleDropdown);
        link.removeEventListener('keydown', toggleDropdown);
      });
    }
  }

  function toggleDropdown(e) {
    e.preventDefault();
    const parent = e.target.closest('li');
    parent.classList.toggle('open');
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

  // Hamburger menu toggle
  if (hamburger && menu) {
    hamburger.addEventListener('click', () => {
      menu.classList.toggle('show');
    });
  }

  // Initialize navigation on load
  initializeNav();

  // Re-initialize on window resize with debounce
  window.addEventListener('resize', debounce(() => {
    // Refresh selectors to handle dynamic content
    dropdownParents = document.querySelectorAll('.menu > li');
    desktopItems = document.querySelectorAll('.menu > li');
    initializeNav();
  }, 200));

  // -------------------------------------------------------------------
  // Quick Reply Handler for Chatbot Fallback Quick Replies
  // This function simulates a user message based on the choice made
  // in a clickable fallback response.
  function handleQuickReply(choice) {
    const chatBody = document.querySelector('.chat-body');
    let simulatedMessage = '';

    if (choice === "services") {
      simulatedMessage = 'Tell me about your services';
    } else if (choice === "contact") {
      simulatedMessage = 'I would like to contact you';
    }

    // Create and append a user message element if chatBody exists
    if (chatBody) {
      const userMessage = document.createElement('div');
      userMessage.className = 'user-message';
      userMessage.textContent = simulatedMessage;
      chatBody.appendChild(userMessage);
    }

    // Process the simulated message as if the user typed it.
    // Ensure that handleUserMessage is defined in your chatbot logic.
    if (typeof handleUserMessage === 'function') {
      handleUserMessage(simulatedMessage);
    } else {
      console.warn("handleUserMessage function is not defined.");
    }
  }
  // Expose the function globally if needed by fallback HTML handlers
  window.handleQuickReply = handleQuickReply;
});
