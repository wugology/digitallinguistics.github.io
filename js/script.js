var page = {};

page.nodes = {
  menuIcon: document.querySelector('#menuIcon'),
  nav: document.querySelector('#nav')
};

page.display = function(el) {
  el.style.display = 'flex';
};

page.hide = function(el) {
  el.style.display = 'none';
};

/* EVENT LISTENERS */
page.nodes.menuIcon.addEventListener('click', function() {
  if (page.nodes.nav.style.display !== 'flex') {
    page.display(page.nodes.nav);
  } else {
    page.hide(page.nodes.nav);
  }
});