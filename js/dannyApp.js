// APP

// Controls general app functionality
var app = {
  initialize: function() {
    var initSequence = function() {
      // Load the preferences
      if (localStorage.wugbotPreferences != 'undefined') { app.preferences = JSON.parse(localStorage.wugbotPreferences); }
      
      // Initialize app views
      appView = new AppView();
      appView.mainNav = new AppView.MainNav();
      appView.appNav = new AppView.AppNav();
      appView.navIcons = new AppView.NavIcons(); // Needs to be ordered after mainNav and appNav
      appView.corpusSelector = new AppView.CorpusSelector();
      
      // Initialize popups
      popups.blank = new popups.Blank();
      popups.fileUpload = new popups.FileUpload();
      popups.manageCorpora = new popups.ManageCorpora();
      popups.settings = new popups.Settings();
      popups.tag = new popups.Tag();
      
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
        
        // Set preferences
        } else {
          if (app.preferences.currentCorpus) {
            app.preferences.currentCorpus = hydrate(app.preferences.currentCorpus);
            appView.corpusSelector.render(app.preferences.currentCorpus.id, setWorkview);
          } else {
            appView.corpusSelector.render();
          }
        }
        
        if (app.preferences.currentText) { app.preferences.currentText = hydrate(app.preferences.currentText); }
        
        if (app.preferences.display) {
          if (app.preferences.display) {
            if (app.preferences.display.overviewPane == 'closed') { appView.toggleOverviewPane(); }
            if (app.preferences.display.toolbar == 'closed') { appView.toggleToolbar(); }
          }
        } else {
          app.preferences.display = {
            overviewPane: 'open',
            toolbar: 'open'
          };
        }
        
        if (!app.preferences.currentPhrase) { app.preferences.currentPhrase = null; }
        
        // Key bindings (using Mousetrap)
        Mousetrap.bindGlobal(['alt+right', 'alt+down'], function() {
          if (app.preferences.currentPhrase && app.preferences.currentWorkview == 'texts') {
            appView.notify('nextPhrase');
          }
          return false;
        });

        Mousetrap.bindGlobal(['alt+left', 'alt+up'], function() {
          if (app.preferences.currentPhrase && app.preferences.currentWorkview == 'texts') {
            appView.notify('prevPhrase');
          }
          return false;
        });
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
  
  searchByTag: function(tag, callback) {
    app.searchResults = [];
    app.preferences.currentCorpus.searchByTag(tag, function(results, tagType) {
      if (typeof callback == 'function') { callback(results, tagType); }
    });
  },
  
  searchText: function(attribute, searchExpr, callback) {
    searchExpr = new RegExp(searchExpr, 'g');
    app.searchResults = [];
    app.preferences.currentCorpus.searchText(attribute, searchExpr, function(results, lingType) {
      if (typeof callback == 'function') { callback(results, lingType); }
    });
  },
  
  searchResults: [],
  
  preferences: {}
};

// APP VIEW
var AppView = function() {
  View.call(this);
  
  this.setWorkview = function(workview) {
    if (!workview) { workview = 'texts'; }

    this.appNav.setButton(workview);
    
    this.notify('setWorkview', workview);
    
    switch (workview) {
      case 'documents':
        app.preferences.currentCorpus.get('documents', function(docs) {
          var docs = new models.Documents(docs);
          modules.documentsOverview = new modules.DocumentsOverview(docs);
          modules.documentsOverview.render()
        });
        break;
      case 'lexicon':
        modules.lexiconOverview = new modules.LexiconOverview(null);
        modules.lexiconOverview.render();
        break;
      case 'media':
        app.preferences.currentCorpus.get('media', function(media) {
          var media = new models.MediaFiles(media);
          modules.mediaOverview = new modules.MediaOverview(media);
          modules.mediaOverview.render()
        });
        break;
      case 'orthographies':
        modules.orthographiesOverview = new modules.OrthographiesOverview(null);
        modules.orthographiesOverview.render()
        break;
      case 'tags':
        modules.tagsOverview = new modules.TagsOverview(app.preferences.currentCorpus.tags)
        modules.tagsOverview.render();
        modules.tagger = new modules.Tagger([]);
        modules.tagger.render();
        break;
      case 'texts':
        app.preferences.currentCorpus.get('texts', function(texts) {
          var texts = new models.Texts(texts);
          modules.textsOverview = new modules.TextsOverview(texts);
          modules.textsOverview.render();
        });
        break;
      default:
    }
    
    app.preferences.currentWorkview = workview;
  };
  
  this.toggleOverviewPane = function() {
    if ($('#overviewPane').classList.contains('open')) {
      $('#collapseLeft').src = 'img/collapseRight.svg';
      app.preferences.display.overviewPane = 'closed';
    } else {
      $('#collapseLeft').src = 'img/collapseLeft.svg';
      app.preferences.display.overviewPane = 'open';
    }
    
    $('#overviewPane').classList.toggle('closed');
    $('#overviewPane').classList.toggle('open');
    $('#sideNav li:not(:first-child)').forEach(function(navButton) { navButton.classList.toggle('hideonDesktop'); });
  };
  
  this.toggleToolbar = function() {
    if ($('#toolbar').classList.contains('open')) {
      $('#collapseRight').src = 'img/collapseLeft.svg';
      app.preferences.display.toolbar = 'closed';
    } else {
      $('#collapseRight').src = 'img/collapseRight.svg';
      app.preferences.display.toolbar = 'open';
    }
    
    $('#toolbar').classList.toggle('closed');
    $('#toolbar').classList.toggle('open');
    $('#toolbarNav li:not(:first-child)').classList.toggle('hideonDesktop');
  };
  
  this.update = function(action, data) {
    if (action == 'appNavClick') { this.setWorkview(data); }
    if (action == 'newTagger') {
      modules.tagsOverview = new modules.TagsOverview(app.preferences.currentCorpus.tags)
      modules.tagsOverview.render();
      if (data) {
        modules.tagger = new modules.Tagger(data.results, { lingType: data.lingType });
        modules.tagger.render();
      }
    }
  };
  
  $('#collapseLeft').addEventListener('click', this.toggleOverviewPane);
  $('#collapseRight').addEventListener('click', this.toggleToolbar);
};


// NAV VIEWS
AppView.AppNav = function() {
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

AppView.CorpusSelector = function() {
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
  }.bind(this);
  
  this.el.addEventListener('change', function(ev) {
    if (ev.target.value == 'manage') {
      popups.manageCorpora.render();
      this.el.value = app.preferences.currentCorpus.id;
    } else if (ev.target.value != 'select') {
      var setCorpus = function(results) {
        app.preferences.currentCorpus = results[0];
        this.notify('switchCorpus');
        appView.setWorkview(app.preferences.currentWorkview);
      }.bind(this);
      
      idb.get(Number(ev.target.value), 'corpora', setCorpus);
    }
  }.bind(this));
};

AppView.MainNav = function() {
  Nav.call(this);
  
  this.el = $('#mainNav');
  
  this.update = function(action, data) {
    if (data == 'menuIcon') {
      this.toggleDisplay();
      appView.appNav.hide();
    }
  };
};

AppView.NavIcons = function() {
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
  
  this.el = $('#documentsOverview');
};

modules.LexiconOverview = function(collection) {
  Module.call(this, collection);
  
  this.workview = 'lexicon';
  
  this.el = $('#lexiconOverview');
};

modules.MediaOverview = function(collection) {
  Module.call(this, collection);
  
  this.workview = 'media';
  
  this.el = $('#mediaOverview');
  this.mediaList = $('#mediaList');
  
  var populateListItem = function(media, li) {
    li.dataset.id = media.id;
    var p = createElement('p', { textContent: media.file.name });
    var img = createElement('img', { src: 'img/delete.svg', alt: 'remove this media file from this corpus'});
    img.classList.add('icon');
    li.appendChild(p);
    li.appendChild(img);
  };
  
  this.render = function() {
    this.collection.list(this.mediaList, populateListItem);
    this.display();
  };
  
  this.mediaList.addEventListener();
};

modules.OrthographiesOverview = function(collection) {
  Module.call(this, collection);
  
  this.workview = 'orthographies';
  
  this.el = $('#orthographiesOverview');
};

modules.Tagger = function(searchResults, options) {
  Module.call(this, searchResults, options);
  
  this.workview = 'tags';
  
  this.el = $('#tagger');
  this.searchBar = $('#searchBar');
  this.searchBox = $('#tagSearchBox');
  this.taggingList = $('#taggingList');
  this.template = $('#tagItemTemplate');
  
  this.listResults = function() {
    this.taggingList.innerHTML = '';
    
    switch (this.tagType) {
      case 'corpus':
        this.collection.forEach(function(corpus) {
          this.renderCorpus(corpus);
        }, this);
        break;
      case 'phrase':
        this.collection.forEach(function(phrase) {
          this.renderPhrase(phrase);
        }, this);
        break;
      default:
        this.collection.forEach(function(phrase) {
          this.renderPhrase(phrase);
        }, this);
    }
  };
  
  this.render = function() {
    this.listResults();
    this.display();
  };
  
  this.addTag = function(tag, result, callback) {
    result.tags.push(tag);
    
    var pushToCorpus = function() {
      app.preferences.currentCorpus.tags.push(tag);
      app.preferences.currentCorpus.store(callback);
    };
    
    result.store(pushToCorpus);
  };
  
  this.getTag = function(callback) {
    var makeTag = function(category, value) {
      var tag = new models.Tag({ type: this.lingType, category: category, value: value });
      if (typeof callback == 'function') { callback(tag); }
    }.bind(this);
    
    popups.tag.render(makeTag);
  }.bind(this);
  
  this.renderCorpus = function(corpus) {
  };
  
  this.renderPhrase = function(phrase, replaceNode) {
    var li = this.template.content.querySelector('li').cloneNode(true);
    li.dataset.breadcrumb = Breadcrumb.stringify(phrase.breadcrumb);
    
    var tagsWrapper = li.querySelector('.tags');
    
    phrase.tags.forEach(function(tag) {
      var text = tag.value ? tag.category + ' : ' + tag.value : tag.category;
      var p = createElement('p', { textContent: text });
      tagsWrapper.appendChild(p);
    });
    
    if (replaceNode) {
      replaceNode.parentNode.insertBefore(li, replaceNode);
      replaceNode.parentNode.removeChild(replaceNode);
    } else {
      this.taggingList.appendChild(li);
    }

    var pv = new PhraseView(phrase, { contentEditable: true });
    pv.render(li.querySelector('.wrapper'));
  }.bind(this);
  
  var newTag = function(ev) {
    if (ev.target.classList.contains('tag')) {
      var listItem = ev.target.parentNode;
      var crumb = Breadcrumb.parse(listItem.dataset.breadcrumb);
      
      var getTag = function(results) {
        var addTag = function(tag) {
          var notifyRender = function() {
            this.notify('newTagger');
            
            var phrase = results[0];
            var replaceNode = listItem;
            this.renderPhrase(phrase, replaceNode);
          }.bind(this);
          
          this.addTag(tag, results[0], notifyRender);
        }.bind(this);
        
        this.getTag(addTag);
      }.bind(this);
      
      idb.getBreadcrumb(crumb, getTag);
    }
  }.bind(this);
  
  this.search = function(attribute, searchExpr) {
    var newTagger = function(results, lingType) {
      this.searchBar.removeEventListener('submit', runSearch);
      this.taggingList.removeEventListener('click', newTag);
      this.notify('newTagger', { results: results, lingType: lingType });
    }.bind(this);
    
    app.searchText(attribute, searchExpr, newTagger);
  };
  
  var runSearch = function(ev) {
    ev.preventDefault();
    var options = Array.prototype.slice.call(document.getElementsByName('field'));
    var selected = options.filter(function(option) { return option.checked; });
    
    this.search(selected[0].value, this.searchBox.value);
  }.bind(this);
  
  this.observers.add('newTagger', appView);
  
  this.searchBar.addEventListener('submit', runSearch);
  this.taggingList.addEventListener('click', newTag);
};

modules.TagsOverview = function(collection) {
  Module.call(this, collection);
  
  this.collection.sort(function(a, b) {
    if (a.type > b.type) {return 1; }
    if (a.type < b.type) { return -1; } else {
      if (a.category > b.category) { return 1; }
      if (a.category < b.category) { return -1; } else {
        if (a.value > b.value) { return 1; }
        if (a.valueu < b.value) { return -1; } else {
          return 0;
        }
      }
    }
  });
  
  this.workview = 'tags';
  
  this.el = $('#tagsOverview');
  this.tagsList = $('#tagsList');
  
  this.listTags = function() {
    this.tagsList.innerHTML = '';
    
    var types = getUnique('type', this.collection);
    
    types.forEach(function(type) {
      var typeli = createElement('li');
        var h2 = createElement('h2', { textContent: type });
        h2.dataset.tag = type;
        typeli.appendChild(h2);
        var catwrapper = createElement('ul');
        typeli.appendChild(catwrapper);
        
        var ofType = this.collection.filter(function(tag) { return tag.type == type; });
        var categories = getUnique('category', ofType);
        
        categories.forEach(function(category) {
          var catli = createElement('li');
          catli.classList.add('tagCategory');
            var h3 = createElement('h3', { textContent: category });
            h3.dataset.tag = type + ':' + category;
            catli.appendChild(h3);
            var valwrapper = createElement('ul');
            catli.appendChild(valwrapper);
            
            var ofTypeCat = ofType.filter(function(tag) { return tag.category == category; });
            
            ofTypeCat.forEach(function(tag) {
              if (tag.value) {
                var valueli = createElement('li', { textContent: tag.value });
                valueli.dataset.tag = tag.type + ':' + tag.category + ':' + tag.value;
                valueli.classList.add('tagValue');
                valwrapper.appendChild(valueli);
              }
            }, this);
            
          catwrapper.appendChild(catli);
        }, this);
      this.tagsList.appendChild(typeli);
    }, this);
  }.bind(this);
  
  this.render = function() {
    this.listTags();
    this.display();
  };
  
  this.tagsList.addEventListener('click', function(ev) {
    if (ev.target.dataset.tag) {
      var renderTags = function(results, tagType) {
        modules.tagger = new modules.Tagger(results, { tagType: tagType });
        modules.tagger.render();
      };
      
      app.searchByTag(models.Tag.parse(ev.target.dataset.tag), renderTags);
    }
  });
};

modules.TextsOverview = function(collection) {
  Module.call(this, collection);
  
  this.workview = 'texts';
  
  this.el = $('#textsOverview');
  this.importButton = $('#importTextButton');
  this.textsList = $('#textsList');
  
  var populateTextsListItem = function(text, li) {
    li.dataset.id = text.id;
    li.classList.add('textsListItem');
    var p = createElement('p', { textContent: text.titles.Eng || '[click to display this text]' });
    p.classList.add('unicode');
    li.appendChild(p);
  };
  
  this.render = function() {
    this.collection.list(this.textsList, populateTextsListItem);
    this.display();
  };
  
  this.update = function(action, data) {
    if (action == 'setWorkview') {
      this.textsList.removeEventListener('click', renderTextsList);
      if (data != this.workview) { this.hide(); }
    } else if (action == 'deleteText' || action == 'titleChange') {
      this.collection.list(this.textsList, populateTextsListItem);
    } else if (action == 'switchCorpus') {
      this.textsList.removeEventListener('click', renderTextsList);
    }
  };
  
  appView.corpusSelector.observers.add('switchCorpus', this);
  
  // Event listeners
  this.importButton.addEventListener('click', function() {    
    popups.fileUpload.render(function(file) {
      var importText = function(text) {
        var incorporate = function(textIDs) {
          text.id = textIDs[0];
          Breadcrumb.reset(text);
          text.addToCorpus();

          var setView = function() { appView.setWorkview('texts'); };
          
          text.store(setView);
        };
        
        text.store(incorporate);
      };
      
      tools.elan2json(file, ekegusiiColumns, importText);
    });
  });
  
  var renderTextsList = function renderTextsList(ev) {
    if (ev.target.parentNode.classList.contains('textsListItem')) {
      var text = this.collection.filter(function(text) {
        return text.id == Number(ev.target.parentNode.dataset.id);
      })[0];
      
      var renderFunction = function(text) {
        var tv = new TextView(text);
        tv.render();
        tv.observers.add('titleChange', this);
        tv.observers.add('deleteText', this);
        text.setAsCurrent();
      }.bind(this);

      text.render(renderFunction);
    }
  }.bind(this);
  
  this.textsList.addEventListener('click', renderTextsList);
};


// POPUP VIEWS
var popups = {};

popups.Blank = function() {
  Popup.call(this);
  
  this.displayArea = $('.displayArea');
  this.el = $('#blankPopup');
  
  this.render = function(renderFunction) {
    this.displayArea.innerHTML = '';
    if (typeof renderFunction == 'function') { renderFunction(this.displayArea); }
    this.display();
  }.bind(this);
};

popups.FileUpload = function() {
  Popup.call(this);
  
  this.button = $('#fileUploadButton');
  this.el = $('#fileUploadPopup');
  this.input = $('#fileUpload');

  // Applies the callback function to the uploaded file when the 'Go' button is clicked
  this.render = function(goButtonCallback) {
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
  };
};

popups.ManageCorpora = function() {
  Popup.call(this);
  
  this.button = $('#createCorpusButton');
  this.corpusList = $('#corpusList');
  this.el = $('#manageCorporaPopup');
  this.input = $('#corpusNameBox');
  
  this.render = function() {
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
      createList(this.corpusList, corpora, populateListItem);
      this.display();
    }.bind(this);
    
    idb.getAll('corpora', renderList);
  }.bind(this);
  
  this.button.addEventListener('click', function(ev) {
    ev.preventDefault();

    var corpus = new models.Corpus({ name: this.input.value });
    
    var setCorpus = function(corpusIDs) {
      corpus.id = corpusIDs[0];
      appView.corpusSelector.render(corpus.id);
      corpus.setAsCurrent();
      appView.setWorkview();
    };
    
    corpus.store(setCorpus);
    this.hide();
  }.bind(this));
};

popups.Settings = function() {
  Popup.call(this);
  
  this.el = $('#settingsPopup');
  this.icon = $('#settingsIcon');
  
  this.icon.addEventListener('click', this.toggleDisplay);
};

popups.Tag = function(callback) {
  Popup.call(this);

  this.el = $('#tagPopup');
  this.form = $('#tagPopup form');
  this.categoryInput = $('#categoryInput');
  this.valueInput = $('#valueInput');
  
  
  this.render = function(callback) {
    var submit = function(ev) {
      ev.preventDefault();
      if (typeof callback == 'function') { callback(this.categoryInput.value, this.valueInput.value); }
      this.form.removeEventListener(submit);
      this.hide();
    }.bind(this);

    this.form.addEventListener('submit', submit);
    this.display();
    this.categoryInput.focus();
  }.bind(this);
};


// EVENT LISTENERS
$('#popups').addEventListener('click', function(ev) {
  if (ev.target.classList.contains('icon')) { popups[ev.target.parentNode.id.replace('Popup', '')].hide(); }
});
window.addEventListener('keydown', function(ev) {
  if (ev.keyCode == 9 && app.preferences.currentPhrase && app.preferences.currentWorkview == 'texts') {
    ev.preventDefault();

    if (app.preferences.currentPhrase[0] == app.preferences.currentText.id) {
      app.preferences.currentText.phrases[app.preferences.currentPhrase[1]].play();
      
    } else {
      var playAudio = function(results) {
        results[0].phrases[app.preferences.currentPhrase[1]].play();
      };
      
      idb.get(app.preferences.currentPhrase[0], 'texts', playAudio);
    }
  }
});
window.addEventListener('load', app.initialize);
window.addEventListener('unload', app.save);