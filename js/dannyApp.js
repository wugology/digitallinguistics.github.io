// App UI Javascript for Danny's app

// APP
// The UI, with regions/interfaces and general nav views

var app = {
  initialize: function() {
    idb.open('WugbotDev');
  },
  
  // Change this function to use popups.blank instead
  notify: function(text) {
    alert(text);
  },
  
  preferences: {}
};


// APP VIEWS
// Nav View
var Nav = function(options) {
  View.call(this, null, options);
  delete this.model;
};

var Popup = function(options) {
  View.call(this, null, options);
  delete this.model;
};


// APP SECTIONS
// Navs
app.appNav = new Nav({ el: $('#appNav') });
app.appNav.update = function(action, data) {
  if (data == 'boxIcon') {
    this.toggleDisplay();
    app.mainNav.hide();
  }
};

app.mainNav = new Nav({ el: $('#mainNav') });
app.mainNav.update = function(action, data) {
  if (data == 'menuIcon') {
    this.toggleDisplay();
    app.appNav.hide();
  }
};

app.navIcons = new Nav({ el: $('#navIcons') });

app.navIcons.el.addEventListener('click', function(ev) {
  app.navIcons.notify('navIconClick', ev.target.id);
});

app.navIcons.events.add(app.appNav, 'navIconClick');
app.navIcons.events.add(app.mainNav, 'navIconClick');

window.addEventListener('load', app.initialize);


// POPUPS
var popups = {};

popups.fileUpload = new Popup({
  el: $('#fileUploadPopup'),
  button: $('#fileUploadButton'),
  input: $('#fileUpload'),
  
  // Applies the callback function to the uploaded file when the 'Go' button is clicked
  render: function(goButtonCallback) {
    var processFile = function() {
      goButtonCallback(this.input.files[0]);
      this.button.removeEventListener('click', processFile);
    }.bind(this);
    
    this.button.addEventListener('click', processFile);
    this.display();
  }
});