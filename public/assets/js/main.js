document.addEventListener('DOMContentLoaded', function () {
  const hamburger = document.getElementById('hamburger');
  const menu = document.querySelector('.menu');

  hamburger.addEventListener('click', () => {
    menu.classList.toggle('show');
  });

  if (window.innerWidth <= 768) {
    const dropdownParents = document.querySelectorAll('.menu > li');
    dropdownParents.forEach(parent => {
      const link = parent.querySelector('a');
      const hasDropdown = parent.querySelector('.dropdown');
      if (hasDropdown) {
        link.addEventListener('click', function (e) {
          e.preventDefault();
          parent.classList.toggle('open');
        });
      }
    });
  }

  if (window.innerWidth > 768) {
    const items = document.querySelectorAll('.menu > li');
    items.forEach(item => {
      let hideTimer;
      item.addEventListener('mouseenter', () => {
        clearTimeout(hideTimer);
        item.classList.add('open');
      });
      item.addEventListener('mouseleave', () => {
        hideTimer = setTimeout(() => {
          item.classList.remove('open');
        }, 200);
      });
    });
  }
});
