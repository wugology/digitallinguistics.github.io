// App UI Javascript for Danny's app

// APP
// The UI, with regions/interfaces and general nav views

var app = {
  initialize: function() {
    var loadPreferences = function() {
      if (localStorage.wugbotPreferences) { app.preferences = JSON.parse(localStorage.wugbotPreferences); }
      if (app.preferences.currentWorkview) {
        app.router.setWorkview(app.preferences.currentWorkview);
      } else {
        app.router.setWorkview('texts');
      }
    };
    
    idb.open('WugbotDev', loadPreferences);
  },
  
  // Change this function to use popups.blank instead
  notify: function(text) {
    alert(text);
  },
  
  save: function() {
    localStorage.wugbotPreferences = JSON.stringify(app.preferences, null, 2);
  },
  
  preferences: {}
};


// ROUTER
var Router = function(options) {
  Events.call(this, options);
  
  this.setWorkview = function(workview) {
    app.appNav.buttons.forEach(function(button) {
      button.classList.remove('underline');
      if (button.textContent.toLowerCase() == workview) { button.classList.add('underline'); }
    });
    
    Object.keys(modules).forEach(function(key) {
      modules[key].hide();
    });
    
    modules[workview + 'Overview'].render();
    
    app.preferences.currentWorkview = workview;
  };
  
  this.update = function(action, data) {
    if (action == 'appNavClick') { this.setWorkview(data); }
  };
};

app.router = new Router();


// APP VIEWS
var Nav = function(options) {
  View.call(this, null, options);
  delete this.model;
};

var Module = function(options) {
  View.call(this, null, options);
  delete this.model;
};

var Popup = function(options) {
  View.call(this, null, options);
  delete this.model;
};


// NAVS
app.appNav = new Nav({
  el: $('#appNav'),
  buttons: $('#appNav a'),
  
  update: function(action, data) {
    if (data == 'boxIcon') {
      this.toggleDisplay();
      app.mainNav.hide();
    }
  }
});

app.appNav.observers.add(app.router, 'appNavClick');

app.mainNav = new Nav({
  el: $('#mainNav'),
  
  update: function(action, data) {
    if (data == 'menuIcon') {
      this.toggleDisplay();
      app.appNav.hide();
    }
  }
});

app.navIcons = new Nav({
  el: $('#navIcons')
});

app.navIcons.observers.add(app.appNav, 'navIconClick');
app.navIcons.observers.add(app.mainNav, 'navIconClick');


// MODULES
var modules = {};

modules.documentsOverview = new Module({
  el: $('#documentsOverview'),
  
  render: function() {
    this.display();
  }
});

modules.lexiconOverview = new Module({
  el: $('#lexiconOverview'),
  
  render: function() {
    this.display();
  }
});

modules.mediaOverview = new Module({
  el: $('#mediaOverview'),

  render: function() {
    this.display();
  }
});

modules.orthographiesOverview = new Module({
  el: $('#orthographiesOverview'),
  
  render: function() {
    this.display();
  }
});

modules.tagsOverview = new Module({
  el: $('#tagsOverview'),
  
  render: function() {
    this.display();
  }
});

modules.textsOverview = new Module({
  el: $('#textsOverview'),
  
  render: function() {
    this.display();
  }
});

modules.documentsDetail = new Module({
  el: $('#documentsDetail'),
  
  render: function() {
    this.display();
  }
});

modules.lexiconDetail = new Module({
  el: $('#lexiconDetail'),
  
  render: function() {
    this.display();
  }
});

modules.mediaDetail = new Module({
  el: $('#mediaDetail'),
  
  render: function() {
    this.display();
  }
});

modules.orthographiesDetail = new Module({
  el: $('#orthographiesDetail'),
  
  render: function() {
    this.display();
  }
});

modules.tagsDetail = new Module({
  el: $('#tagsDetail'),
  
  render: function() {
    this.display();
  }
});

modules.textsDetail = new Module({
  el: $('#textsDetail'),
  
  render: function() {
    this.display();
  }
});


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


// EVENT LISTENERS
app.appNav.el.addEventListener('click', function(ev) {
  if (ev.target.tagName == 'A') { app.appNav.notify('appNavClick', ev.target.textContent.toLowerCase()); }
});

app.navIcons.el.addEventListener('click', function(ev) { app.navIcons.notify('navIconClick', ev.target.id); });

window.addEventListener('load', app.initialize);
window.addEventListener('unload', app.save);