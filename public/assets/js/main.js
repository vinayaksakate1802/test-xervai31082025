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
      console.log('Hamburger clicked, menu show:', menu.classList.contains('show'));
    });
    hamburger.addEventListener('touchstart', (e) => {
      e.preventDefault();
      menu.classList.toggle('show');
      console.log('Hamburger touched, menu show:', menu.classList.contains('show'));
    });
    // Close menu when clicking links
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('show');
      });
    });
  } else {
    console.error('Hamburger or menu not found:', { hamburger, menu });
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
});
