// App UI Javascript for Danny's app

// APP
// The UI, with regions/interfaces and general nav views

var app = {
  // Change this function to use app.popups.blank instead
  notify: function(text) {
    alert(text);
  }
};


// APP VIEWS
// Nav View
var Nav = function(options) {
  View.call(this, null, options);
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

app.navIcons.observers.add(app.appNav, 'navIconClick');
app.navIcons.observers.add(app.mainNav, 'navIconClick');