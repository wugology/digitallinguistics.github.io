// APP

// Controls general app functionality
var app = {
  initialize: function() {
    var initSequence = function() {
      // Load the preferences
      if (localStorage.wugbotPreferences != 'undefined') { app.preferences = JSON.parse(localStorage.wugbotPreferences); }
      
      // Set the current workview
      var setWorkview = function() {
        if (app.preferences.currentWorkview) {
          appView.setWorkview(app.preferences.currentWorkview);
        } else {
          appView.setWorkview();
        }
      };
      
      // Render the corpus selector and prompt for a new corpus if needed
      idb.getAll('corpora', function(corpora) {
        if (corpora.length == 0) {
          popups.manageCorpora.display();
          
        } else {
          if (app.preferences.currentCorpus) {
            app.preferences.currentCorpus = hydrate(app.preferences.currentCorpus);
            appView.corpusSelector.render(app.preferences.currentCorpus.id, setWorkview);
          } else {
            appView.corpusSelector.render();
          }
        }
      });
    };
    
    idb.open('WugbotDev', initSequence);
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

// APP VIEW
var appView = new View(null, {
  setWorkview: function(workview) {
    if (!workview) { workview = 'texts'; }
    
    this.appNav.setButton(workview);
    
    this.notify('setWorkview', workview);
    
    switch (workview) {
      case 'documents':
        app.preferences.currentCorpus.get('documents', function(docs) {
          var docs = new models.Documents(docs);
          new modules.DocumentsOverview(docs, modules.documentsOverviewDefaults).render();
        });
        break;
      case 'lexicon':
        new modules.LexiconOverview(null, modules.lexiconOverviewDefaults).render();
        break;
      case 'media':
        new modules.MediaOverview(null, modules.mediaOverviewDefaults).render();
        break;
      case 'orthographies':
        new modules.OrthographiesOverview(null, modules.orthographiesOverviewDefaults).render();
        break;
      case 'tags':
        modules.TagsOverview(null, modules.tagsOverviewDefaults).render();
        break;
      case 'texts':
        app.preferences.currentCorpus.get('texts', function(texts) {
          var texts = new models.Texts(texts);
          new modules.TextsOverview(texts, modules.textsOverviewDefaults).render();
        });
        break;
      default:
    }
    
    app.preferences.currentWorkview = workview;
  },
  
  update: function(action, data) {
    if (action == 'appNavClick') { this.setWorkview(data); }
  }
});


// APP COMPONENT VIEWS
var Nav = function(options) {
  View.call(this, null, options);  
  delete this.model;
};

var Module = function(model, options) {
  View.call(this, model, options);
  appView.observers.add('setWorkview', this);
};

var Popup = function(options) {
  View.call(this, null, options);
  delete this.model;
};


// APP COMPONENTS
appView.appNav = new Nav({
  el: $('#appNav'),
  buttons: $('#appNav a'),
  
  handlers: [{
    el: 'el',
    evType: 'click',
    functionCall: function(ev) { appView.appNav.notify('appNavClick', ev.target.textContent.toLowerCase()); }
  }],
  
  observers: [{ action: 'appNavClick', observer: appView }],
  
  setButton: function(workview) {
    this.buttons.forEach(function(button) {
      button.classList.remove('underline');
      if (button.textContent.toLowerCase() == workview) { button.classList.add('underline'); }
    }, this);
  },

  update: function(action, data) {
    if (data == 'boxIcon') {
      appView.appNav.toggleDisplay();
      appView.mainNav.hide();
    }
  }
});

appView.corpusSelector = new View(null, {
  el: $('#corpusSelector'),
  
  handlers: [{
    el: 'el',
    evType: 'change',
    functionCall: function(ev) {
      if (ev.target.value == 'manage') {
        popups.manageCorpora.display();
      } else if (ev.target.value != 'select') {
        idb.get(Number(ev.target.value), 'corpora', function(results) { results[0].setAsCurrent(); });
      }
    }
  }],
  
  // Optionally takes a corpus ID to set the dropdown to after rendering
  render: function(corpusID, callback) {
    idb.getAll('corpora', function(corpora) {
      this.el.innerHTML = '';
      
      var option = createElement('option', { textContent: 'Select a corpus', value: 'select' });
      this.el.appendChild(option);
      option.classList.add('unicode');
      
      corpora.forEach(function(corpus) {
        var option = createElement('option', { textContent: corpus.name, value: corpus.id });
        this.el.appendChild(option);
        option.classList.add('unicode');
      }, this);
      
      var option = createElement('option', { textContent: 'Manage corpora', value: 'manage' });
      this.el.appendChild(option);
      option.classList.add('unicode');

      if (corpusID) {
        this.el.value = corpusID;
      }
      
      if (typeof callback == 'function') { callback(); }
    }.bind(this));
  }
});

appView.mainNav = new Nav({
  el: $('#mainNav'),
  
  update: function(action, data) {
    if (data == 'menuIcon') {
      appView.mainNav.toggleDisplay();
      appView.appNav.hide();
    }
  }
});


appView.navIcons = new Nav({
  el: $('#navIcons'),
  
  handlers: [{
    el: 'el',
    evType: 'click',
    functionCall: function(ev) { appView.navIcons.notify('navIconClick', ev.target.id); }
  }],
  
  observers: [
    { action: 'navIconClick', observer: appView.appNav },
    { action: 'navIconClick', observer: appView.mainNav }
  ]
});


// MODULES
var modules = {};

modules.DocumentsOverview = function(collection, options) {
  Module.call(this, collection, options);
};

modules.documentsOverviewDefaults = {
  el: $('#documentsOverview'),
  workview: 'documents',
  
  render: function() {
    this.display();
  },
  
  update: function(action, data) {
    if (data != this.workview) { this.hide(); }
    appView.observers.remove(this);
  }
};

modules.LexiconOverview = function(collection, options) {
  Module.call(this, collection, options);
};

modules.lexiconOverviewDefaults = {
  el: $('#lexiconOverview'),
  workview: 'lexicon',
  
  render: function() {
    this.display();
  },

  update: function(action, data) {
    if (data != this.workview) { this.hide(); }
    appView.observers.remove(this);
  }
};

modules.MediaOverview = function(collection, options) {
  Module.call(this, collection, options);
};

modules.mediaOverviewDefaults = {
  el: $('#mediaOverview'),
  workview: 'media',

  render: function() {
    this.display();
  },
  
  update: function(action, data) {
    if (data != this.workview) { this.hide(); }
    appView.observers.remove(this);
  }
};

modules.OrthographiesOverview = function(collection, options) {
  Module.call(this, collection, options);
};

modules.orthographiesOverviewDefaults = {
  el: $('#orthographiesOverview'),
  workview: 'orthographies',
  
  render: function() {
    this.display();
  },

  update: function(action, data) {
    if (data != this.workview) { this.hide(); }
    appView.observers.remove(this);
  }
};

modules.TagsOverview = function(collection, options) {
  Module.call(this, collection, options);
};

modules.tagsOverviewDefaults = {
  el: $('#tagsOverview'),
  workview: 'tags',
  
  render: function() {
    this.display();
  },

  update: function(action, data) {
    if (data != this.workview) { this.hide(); }
    appView.observers.remove(this);
  }
};

modules.TextsOverview = function(collection, options) {
  Module.call(this, collection, options);
};

modules.textsOverviewDefaults = {
  el: $('#textsOverview'),
  importButton: $('#importTextButton'),
  textsList: $('#textsList'),
  workview: 'texts',
  
  handlers: [
    {
      el: 'importButton',
      evType: 'click',
      functionCall: function() {
        popups.fileUpload.render(function(file) {
          var importText = function(text) {
            text.store(function(textIDs) {
              text.id = textIDs[0];
              Breadcrumb.reset(text);
              text.addToCorpus();
              text.store(function() { appView.setWorkview('texts'); });
            });
          };
          
          tools.elan2json(file, ekegusiiColumns, importText);
        });
      }
    },
    {
      el: 'textsList',
      evType: 'click',
      functionCall: function(ev) {
        if (ev.target.classList.contains('textsListItem')) {
          var text = this.model.filter(function(text) { return text.id == Number(ev.target.id); })[0];
          text.render();
        }
      }
    }
  ],
  
  render: function() {
    var populateListItem = function(text, li) {
      var p1 = createElement('p', { textContent: Breadcrumb.stringify(text.breadcrumb) });
      var p2 = createElement('p', { textContent: text.titles.en });
      li.appendChild(p1);
      li.appendChild(p2);
    };
    
    this.model.list(this.textsList, populateListItem);
    this.display();
  },
  
  update: function(action, data) {
    if (data != this.workview) { this.hide(); }
    appView.observers.remove(this);
  }
};

modules.DocumentsDetail = function(model, options) {
  Module.call(this, collection, options);
};

modules.documentsDetailDefaults = {
  el: $('#documentsDetail'),
  workview: 'documents',
  
  render: function() {
    this.display();
  },

  update: function(action, data) {
    if (data != this.workview) { this.hide(); }
    appView.observers.remove(this);
  }
};

modules.LexiconDetail = function(model, options) {
  Module.call(this, collection, options);
};

modules.lexiconDetailDefaults = {
  el: $('#lexiconDetail'),
  workview: 'lexicon',
  
  render: function() {
    this.display();
  },
  
  update: function(action, data) {
    if (data != this.workview) { this.hide(); }
    appView.observers.remove(this);
  }
};

modules.MediaDetail = function(model, options) {
  Module.call(this, collection, options);
};

modules.mediaDetailDefaults = {
  el: $('#mediaDetail'),
  workview: 'media',
  
  render: function() {
    this.display();
  },
  
  update: function(action, data) {
    if (data != this.workview) { this.hide(); }
    appView.observers.remove(this);
  }
};

modules.OrthographiesDetail = function(model, options) {
  Module.call(this, collection, options);
};

modules.orthographiesDetailDefaults = {
  el: $('#orthographiesDetail'),
  workview: 'orthographies',
  
  render: function() {
    this.display();
  },

  update: function(action, data) {
    if (data != this.workview) { this.hide(); }
    appView.observers.remove(this);
  }
};

modules.TagsDetail = function(model, options) {
  Module.call(this, collection, options);
};

modules.tagsDetailDefaults = {
  el: $('#tagsDetail'),
  workview: 'tags',
  
  render: function() {
    this.display();
  },

  update: function(action, data) {
    if (data != this.workview) { this.hide(); }
    appView.observers.remove(this);
  }
};

modules.TextsDetail = function(model, options) {
  Module.call(this, collection, options);
};

modules.textsDetailDefaults = {
  el: $('#textsDetail'),
  workview: 'texts',
  
  render: function() {
    this.display();
  },

  update: function(action, data) {
    if (data != this.workview) { this.hide(); }
    appView.observers.remove(this);
  }
};


// POPUPS
var popups = {};

popups.fileUpload = new Popup({
  el: $('#fileUploadPopup'),
  button: $('#fileUploadButton'),
  input: $('#fileUpload'),
  
  // Applies the callback function to the uploaded file when the 'Go' button is clicked
  render: function(goButtonCallback) {
    var processFile = function() {
      if (typeof goButtonCallback != 'function') {
        console.log('Define a function to run when the Go button is clicked.');
      } else {
        goButtonCallback(this.input.files[0]);
      }
      
      this.hide();
      
      this.button.removeEventListener('click', processFile);
    }.bind(this);
    
    this.button.addEventListener('click', processFile);
    
    this.display();
  }
});

popups.manageCorpora = new Popup({
  el: $('#manageCorporaPopup'),
  button: $('#createCorpusButton'),
  input: $('#corpusNameBox'),
  
  handlers: [{
    el: 'button',
    evType: 'click',
    functionCall: function(ev) {
      ev.preventDefault();
      var data = { name: popups.manageCorpora.input.value };
      var corpus = new models.Corpus(data);
      corpus.store(function(corpusIDs) {
        corpus.id = corpusIDs[0];
        appView.corpusSelector.render(corpus.id);
        corpus.setAsCurrent();
        appView.setWorkview();
      });
      popups.manageCorpora.hide();
    }
  }]
});

popups.settings = new Popup({
  el: $('#settingsPopup'),
  icon: $('#settingsIcon'),
  
  handlers: [{
    el: 'icon',
    evType: 'click',
    functionCall: function() { popups.settings.toggleDisplay(); }
  }]
});


// EVENT LISTENERS
$('#popups').addEventListener('click', function(ev) {
  if (ev.target.classList.contains('icon')) { popups[ev.target.parentNode.id.replace('Popup', '')].hide(); }
});
window.addEventListener('load', app.initialize);
window.addEventListener('unload', app.save);