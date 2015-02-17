var page = {};

page.nodes = {
  appNav: document.querySelector('#appNav'),
  menuIcon: document.querySelector('#menuIcon'),
  mainNav: document.querySelector('#mainNav')
};

page.hide = function(el) {
  el.classList.add('hideonDesktop');
  el.classList.add('hideonMobile');
};

page.setWorkview = function(workview) {
  
};

page.toggleDisplay = function(el) {
  el.classList.toggle('hideonMobile');
  el.classList.toggle('hideonDesktop');
};

/* EVENT LISTENERS */
page.nodes.menuIcon.addEventListener('click', function(ev) {
  page.toggleDisplay(page.nodes.mainNav);
  if (page.nodes.appNav) {
    page.hide(page.nodes.appNav);
  }
});