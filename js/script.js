var page = {};

page.nodes = {
  appNav: document.querySelector('#appNav'),
  menuIcon: document.querySelector('#menuIcon'),
  mainNav: document.querySelector('#mainNav')
};

page.display = function(el) {
  el.style.display = 'flex';
};

page.hide = function(el) {
  el.style.display = 'none';
};

/* EVENT LISTENERS */
page.nodes.menuIcon.addEventListener('click', function() {
  if (page.nodes.mainNav.style.display !== 'flex') {
    if (page.nodes.appNav) {
      page.hide(page.nodes.appNav);
    }
    page.display(page.nodes.mainNav);
  } else {
    page.hide(page.nodes.mainNav);
  }
});