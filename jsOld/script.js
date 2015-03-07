// A handful of useful site-wide functions and event listeners
// The remainder of the objects within the views and events namespaces live within views.js and events.js respectively

// Dependencies: none

var views = {};

views.page = {  
  // Displays a DOM element that was previously hidden
  // The optional media argument specifies whether you would only like to display the element on desktop or mobile
  display: function(el, media) {
    if (media !== 'mobile') {
      el.classList.remove('hideonDesktop');
    }
    if (media !== 'desktop') {
      el.classList.remove('hideonMobile');
    }
  },
  
  // Hides a DOM element, and content reflows to fill that empty space
  // The optional media argument specifies whether you would only like to hide the element on desktop or mobile
  hide: function(el, media) {
    if (media !== 'mobile') {
      el.classList.add('hideonDesktop');
    }
    
    if (media !== 'desktop') {
      el.classList.add('hideonMobile');
    }
  },
  
  // Displays a popup alert to the user with the specified text
  // This function should be changed to use views.popups.blank rather than an Javascript alert
  notify: function(text) {
    alert(text);
  },
  
  // Displays or hides the appNav or mainNav as appropriate when the user clicks either of the nav icons
  toggleMenu: function(ev) {
    var clickedMenu = ev.target.id === 'boxIcon' ? 'appNav' : 'mainNav';
    views.page.toggleDisplay(views.page.nodes[clickedMenu]);
    if (views.page.appNav) {
      var otherMenu = ev.target.id === 'boxIcon' ? 'mainNav' : 'appNav';
      views.page.hide(views.page.nodes[otherMenu]);
    }
  },
  
  // Hides the element if it is currently displayed, and displays the element if it is currently hidden
  toggleDisplay: function(el) {
    el.classList.toggle('hideonMobile');
    el.classList.toggle('hideonDesktop');
  }
};

views.page.nodes = {
  appNav: document.querySelector('#appNav'),
  menuIcon: document.querySelector('#menuIcon'),
};

/* EVENT LISTENERS */
views.page.nodes.menuIcon.addEventListener('click', views.page.toggleMenu);