var page = {};

page.nodes = {
  appNav: document.querySelector('#appNav'),
  menuIcon: document.querySelector('#menuIcon'),
  mainNav: document.querySelector('#mainNav')
};

page.toggleDisplay = function(el) {
  el.classList.toggle('hideonMobile');
  el.classList.toggle('hideonDesktop');
};

/* EVENT LISTENERS */
page.nodes.menuIcon.addEventListener('click', function(ev) {
  page.toggleDisplay(page.nodes.mainNav);
});