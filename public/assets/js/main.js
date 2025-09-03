document.addEventListener('DOMContentLoaded', () => {
  const words = document.querySelectorAll('.animated-title .word');
  words.forEach((word, index) => {
    word.style.animationDelay = `${index * 0.2}s`;
  });

  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = link.getAttribute('href');
    });
  });

  const hamburger = document.querySelector('#hamburger');
  const menu = document.querySelector('.menu');
  if (hamburger && menu) {
    hamburger.addEventListener('click', () => {
      menu.classList.toggle('active');
    });
  }

  const contactForm = document.querySelector('#contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(contactForm);
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          body: formData
        });
        if (response.ok) {
          alert('Message sent successfully!');
          contactForm.reset();
        } else {
          alert('Failed to send message.');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred.');
      }
    });
  }
});
