// APP

// Controls general app functionality
var app = {
  initialize: function() {
    var initSequence = function() {
      // Load the preferences
      if (localStorage.wugbotPreferences != 'undefined') { app.preferences = JSON.parse(localStorage.wugbotPreferences); }
      
      // Initialize app views
      appView.mainNav = new appView.MainNav();
      appView.appNav = new appView.AppNav();
      appView.navIcons = new appView.NavIcons(); // Needs to be ordered after mainNav and appNav
      appView.corpusSelector = new appView.CorpusSelector();
      
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
          popups.manageCorpora.render();
          
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


// NAV VIEWS
appView.AppNav = function() {
  Nav.call(this);
  
  this.el = $('#appNav');
  this.buttons = $('#appNav a');
  
  this.observers = [{ action: 'appNavClick', observer: appView }];
  
  this.setButton = function(workview) {
    this.buttons.forEach(function(button) {
      button.classList.remove('underline');
      if (button.textContent.toLowerCase() == workview) { button.classList.add('underline'); }
    }, this);
  };
  
  this.update = function(action, data) {
    if (data == 'boxIcon') {
      this.toggleDisplay();
      appView.mainNav.hide();
    }
  }.bind(this);
  
  this.el.addEventListener('click', function(ev) {
    appView.appNav.notify('appNavClick', ev.target.textContent.toLowerCase());
  });
};

appView.CorpusSelector = function() {
  Nav.call(this);
  
  this.el = $('#corpusSelector');
  
  this.render = function(corpusID, callback) {
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
  };
  
  this.el.addEventListener('change', function(ev) {
    if (ev.target.value == 'manage') {
      this.el.value = app.preferences.currentCorpus.id;
    } else if (ev.target.value != 'select') {
      var setCorpus = function(results) {
        app.preferences.currentCorpus = results[0];
        appView.setWorkview(app.preferences.currentWorkview);
      };
      
      idb.get(Number(ev.target.value), 'corpora', setCorpus);
    }
  }.bind(this));
};

appView.MainNav = function() {
  Nav.call(this);
  
  this.el = $('#mainNav');
  
  this.update = function(action, data) {
    if (data == 'menuIcon') {
      this.toggleDisplay();
      appView.appNav.hide();
    }
  };
};

appView.NavIcons = function() {
  Nav.call(this);
  
  this.el = $('#navIcons');
  
  this.observers = [
    { action: 'navIconClick', observer: appView.appNav },
    { action: 'navIconClick', observer: appView.mainNav }
  ];
  
  this.el.addEventListener('click', function(ev) { this.notify('navIconClick', ev.target.id); }.bind(this));
};


// MODULE VIEWS
var modules = {};

modules.DocumentsOverview = function(collection) {
  Module.call(this, collection);
  this.workview = 'documents';
  
  this.el = $('documentsOverview');
  
  this.render = function() {
    this.display();
  };
  
  this.update = function(action, data) {
    if (data != this.workview) {
      this.hide();
      appView.observers.remove(this);
    }
  };
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
        if (ev.target.parentNode.classList.contains('textsListItem')) {
          var text = modules.textsOverview.model.filter(function(text) {
            return text.id == Number(ev.target.parentNode.dataset.id);
          })[0];
          
          text.render(function(text) {
            modules.textsDetail = new modules.TextsDetail(text, modules.textsDetailDefaults);
            modules.textsDetail.observers.add('titleChange', modules.textsOverview);
            modules.textsDetail.observers.add('deleteText', modules.textsOverview);
            modules.textsDetail.render();
            text.setAsCurrent();
          });
        }
      }
    }
  ],
  
  populateListItem: function (text, li) {
    li.dataset.id = text.id;
    li.classList.add('textsListItem');
    var p = createElement('p', { textContent: text.titles.Eng || '[click to display this text]' });
    li.appendChild(p);
  },
  
  render: function() {
    modules.textsOverview.model.list(modules.textsOverview.textsList, modules.textsOverview.populateListItem);
    modules.textsOverview.display();
  },
  
  update: function(action, data) {
    if (action == 'setWorkview') {
      if (data != this.workview) { this.hide(); }
      appView.observers.remove(this);
    } else if (action == 'deleteText' || action == 'titleChange') {
      this.model.list(this.textsList, this.populateListItem);
    }
  }
};


// DETAIL MODULES
modules.DocumentsDetail = function(model, options) {
  Module.call(this, model, options);
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
  Module.call(this, model, options);
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
  Module.call(this, model, options);
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
  Module.call(this, model, options);
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
  Module.call(this, model, options);
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
  Module.call(this, model, options);
};

modules.textsDetailDefaults = {
  el: $('#textsDetail'),
  deleteButton: $('#deleteTextButton'),
  phrases: $('#textsDetail .phrases'),
  titles: $('#textsDetail .titles'),
  workview: 'texts',
  
  handlers: [
    {
      el: 'titles',
      evType: 'input',
      functionCall: function(ev) {
        modules.textsDetail.model.titles[ev.target.id] = ev.target.value;
      }
    },
    {
      el: 'titles',
      evType: 'keyup',
      functionCall: function(ev) {
        if (ev.keyCode == 13 || ev.keyCode == 27) {
          ev.target.blur();
          modules.textsDetail.notify('titleChange');
          modules.textsDetail.model.store();
        }
      }
    },
    {
      el: 'deleteButton',
      evType: 'click',
      functionCall: function(ev) {
        modules.textsDetail.hide();
        modules.textsDetail.model.removeFromCorpus();
        modules.textsDetail.model.delete(function() { appView.setWorkview('texts'); });
        app.preferences.currentText = null;
        modules.textsDetail.notify('deleteText');
      }
    },
    {
      el: 'phrases',
      evType: 'click',
      functionCall: function(ev) {
        if (ev.target.classList.contains('play')) {
          console.log(ev.target.parentNode.dataset.breadcrumb);
        }
      }
    }
  ],
  
  render: function() {
    this.titles.innerHTML = '';
    
    Object.keys(this.model.titles).forEach(function(key) {
      var li = createElement('li', { id: key });
      var label = createElement('label', { htmlFor: key });
      var p = createElement('p', { textContent: key });
      var input = createElement('input', { value: this.model.titles[key] || '', id: key });
      label.appendChild(p);
      label.appendChild(input);
      li.appendChild(label);
      this.titles.appendChild(li);
      input.addEventListener('blur', modules.textsDetail.model.store);
    }, this);
    
    modules.textsDetail.phrases.innerHTML = '';
    
    modules.textsDetail.model.phrases.render(modules.textsDetail.phrases);
    
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
  corpusList: $('#corpusList'),
  button: $('#createCorpusButton'),
  el: $('#manageCorporaPopup'),
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
  }],
  
  render: function() {
    var populateListItem = function(corpus, li) {
      var input = createElement('input', { value: corpus.name, type: 'text' });
      input.id = corpus.id;
      li.appendChild(input);
      input.addEventListener('input', function(ev) {
        corpus.name = ev.target.value;
        corpus.store(appView.corpusSelector.render);
      });
    };
    
    var renderList = function(corpora) {
      createList(popups.manageCorpora.corpusList, corpora, populateListItem);
      popups.manageCorpora.display();
    };
    
    idb.getAll('corpora', renderList);
  }.bind(this)
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