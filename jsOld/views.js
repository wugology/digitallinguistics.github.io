// The corpus selection dropdown in the top right of the page
views.page.corpusSelector = {
  el: document.querySelector('#corpusSelector'),
  
  // Handles the selection of an item from the corpusSelector dropdown
  menuEvent: function (ev) {
    var id = ev.target.options[ev.target.selectedIndex].dataset.id;
    
    switch (id) {
      case 'select':
        break;
      case 'manage':
        views.popups.manageCorpora.render();
        break;
      default:
        var setCorpus = function(corpus) {
          corpus.setAsCurrent();
        };
        idb.get(Number(id), 'corpora', setCorpus);
    }
  },
  
  // Accepts an optional value to set the dropdown to once it has finished rendering
  render: function(value) {
    var render = function(results) {
      views.page.corpusSelector.el.innerHTML = '';
      
      var selectOption = views.page.createElement('option', { textContent: 'Select a corpus' });
      selectOption.dataset.id = 'select';
      views.page.corpusSelector.el.add(selectOption);
      
      results.forEach(function(result, i) {
        var option = views.page.createElement('option', { textContent: result.value.name });
        option.dataset.id = result.key;
        views.page.corpusSelector.el.add(option);
      });
      
      var manageOption = views.page.createElement('option', { textContent: 'Manage corpora' });
      manageOption.dataset.id = 'manage';
      views.page.corpusSelector.el.add(manageOption);
      
      app.preferences.setCorpus();
      
      if (value) {
        views.page.corpusSelector.set(value);
      } else {
        views.page.corpusSelector.el.selectedIndex = 0;
      }
    };
    
    idb.getAll('corpora', render);
  },
  
  set: function(value) {
    views.page.corpusSelector.el.value = value;
  }
};

// Renders the app, and calls more local rendering methods on other views
views.page.render = function() {
  if (!app.preferences.currentCorpus) {
    var countCorpora = function(corpora) {
      if (!corpora.length) {
        views.popups.manageCorpora.render();
      } else {
        views.page.corpusSelector.render();
        views.page.corpusSelector.el.selectedIndex = 0;
        views.page.notify('Select a corpus to work on using the dropdown at the top of the page.');
      }
    };

    idb.getAll('corpora', countCorpora);
  } else {
    views.page.corpusSelector.render(app.preferences.currentCorpus.name);
    views.workviews.setWorkview(app.preferences.currentWorkview);
    
    if (views.page.panes.overviewPane.currentDisplayState !== app.preferences.displayState.overviewPane) {
      views.page.panes.overviewPane.toggleDisplay();
    }
    
    if (views.page.panes.toolbar.currentDisplayState !== app.preferences.displayState.toolbar) {
      views.page.panes.toolbar.toggleDisplay();
    }
  }
};

// Switches between desktop and mobile layouts
views.page.switchLayout = function() {
  var small = '(min-width: 1000px)';
  var large = '(max-width: 1000px)';
  if (views.page.desktopCSS.media === small) {
    views.page.desktopCSS.media = large;
    views.page.mobileCSS.media = small;
  } else {
    views.page.desktopCSS.media = small;
    views.page.mobileCSS.media = large;
  }
};

views.page.panes = {
  overviewPane: {
    el: document.querySelector('#overviewPane'),
    collapse: document.querySelector('#collapseLeft'),
    modules: document.querySelectorAll('#overviewPane .module'),
    sideNavButtons: document.querySelectorAll('#sideNav li'),
    
    currentDisplayState: 'open',
    
    toggleDisplay: function() {
      if (this.currentDisplayState === 'open') {
        this.el.style.maxWidth = '2.5rem';
        this.collapse.src = 'img/collapseRight.svg';
        for (var i=0; i<this.modules.length; i++) {
          views.page.hide(this.modules[i]);
        }
        for (var i=0; i<this.sideNavButtons.length; i++) {
          views.page.display(this.sideNavButtons[i], 'desktop');
        }
        this.currentDisplayState = 'closed';
        app.preferences.displayState.overviewPane = 'closed';
      } else {
        this.el.style.maxWidth = '100%';
        this.collapse.src = 'img/collapseLeft.svg';
        for (var i=0; i<this.sideNavButtons.length; i++) {
          views.page.hide(this.sideNavButtons[i]);
        }
        views.page.display(document.querySelector('#sideNav li:first-child'), 'desktop');
        views.workviews.setWorkview(app.preferences.currentWorkview);
        this.currentDisplayState = 'open';
        app.preferences.displayState.overviewPane = 'open';
      }
    }
  },
  
  detailsPane: {
    el: document.querySelector('#detailsPane')
  },
  
  toolbar: {
    el: document.querySelector('#toolbar'),
    collapse: document.querySelector('#collapseRight'),
    resultsArea: document.querySelector('#results'),
    searchBox: document.querySelector('#searchBox'),
    searchForm: document.querySelector('#searchForm'),
    tierOptions: document.getElementsByName('selectTier'),
    toolbarContent: document.querySelector('#toolbarContent'),
    toolsNav: document.querySelector('#toolbarNav li:last-child'),
    
    currentDisplayState: 'open',
    
    displayResults: function() {
      views.page.panes.toolbar.resultsArea.innerHTML = '';
      idb.results.forEach(function(result) {
        result.display(views.page.panes.toolbar.resultsArea);
      });
    },
    
    toggleDisplay: function() {
      if (this.currentDisplayState === 'open') {
        this.el.style.maxWidth = '2.5rem';
        this.collapse.src = 'img/collapseLeft.svg';
        views.page.hide(this.toolbarContent);
        views.page.display(this.toolsNav, 'desktop');
        this.currentDisplayState = 'closed';
        app.preferences.displayState.toolbar = 'closed';
      } else {
        this.el.style.maxWidth = '100%';
        this.collapse.src = 'img/collapseRight.svg';
        views.page.hide(this.toolsNav);
        views.page.display(this.toolbarContent);
        this.currentDisplayState = 'open';
        app.preferences.displayState.toolbar = 'open';
      }
    }
  }
};

Object.defineProperty(views.page.panes.toolbar, 'selectedTier', {
  get: function() {
    var value;
    for (var i=0; i<this.tierOptions.length; i++) {
      if (this.tierOptions[i].checked === true) {
        value = this.tierOptions[i].value;
      }
    }
    return value;
  },
  
  set: function(newValue) {
    for (var i=0; i<this.tierOptions.length; i++) {
      if (this.tierOptions[i].value === newValue) {
        this.tierOptions[i].checked = true;
      }
    }
  },
  
  enumerable: true
});


// Popup views
views.popups = {
  el: document.querySelector('#popups')
};

// A blank popup that can be automatically populated with the .render() function
views.popups.blank = {
  el: document.querySelector('#blankPopup'),
  displayArea: document.querySelector('#blankPopup .displayArea'),
  
  close: function() {
    views.page.hide(this.el);
  },
  
  render: function(render) {
    this.displayArea.innerHTML = '';
    
    if (typeof render === 'function') {
      render(this.displayArea);
    }
    
    views.page.display(this.el);
  }
};

// The file upload popup for users to select files
// Generally try to use this rather than embedding a file upload in the HTML
// The function .promptFile() renders the fileUpload popup,
//   and takes a callback function that runs when the 'Go' button is clicked
//   - The callback function is added as an event listener to the 'Go' button,
//       the the event listener is removed after the function runs
views.popups.fileUpload = {
  el: document.querySelector('#fileUploadPopup'),
  goButton: document.querySelector('#fileUploadButton'),
  input: document.querySelector('#fileUpload'),
  
  close: function() {
    views.page.hide(this.el);
  },
  
  promptFile: function(goButtonCallback) {
    views.page.display(this.el);

    var goButton = function() {
      if (typeof goButtonCallback === 'function') {
        if (!views.popups.fileUpload.file) {
          alert('Please select a file.');
        } else {
          goButtonCallback(views.popups.fileUpload.file);
          views.popups.fileUpload.goButton.removeEventListener('click', goButton);
          views.popups.fileUpload.close();
        }
      }
      
    };
    
    views.popups.fileUpload.goButton.addEventListener('click', goButton);
  }
};

Object.defineProperty(views.popups.fileUpload, 'file', {
  get: function() {
    return views.popups.fileUpload.input.files[0];
  },
  
  enumerable: true
});

views.popups.manageCorpora = {
  el: document.querySelector('#manageCorporaPopup'),
  input: document.querySelector('#manageCorporaPopup input'),
  
  close: function() {
    views.page.hide(this.el);
  },
  
  render: function() {
    views.page.display(this.el);
  }
};

views.popups.settings = {
  el: document.querySelector('#settingsPopup'),
  
  close: function() {
    views.page.hide(this.el);
  },
  
  toggleDisplay: function() {
    views.page.toggleDisplay(views.popups.settings.el);
  }
};


// Workviews
views.workviews = {
  // The documents workview
  documents: {
    render: function() {
      console.log('documents rendering!');
    }
  },
  
  // The lexicon workview
  lexicon: {
    render: function() {
      console.log('lexicon rendering!');
    }
  },
  
  // The media workview
  media: {
    audioPlayer: document.querySelector('#detailsPane .audioPlayer'),
    detailsPane: document.querySelector('#detailsPane .mediaModule'),
    mediaList: document.querySelector('#mediaList'),
    overviewPane: document.querySelector('#overviewPane .mediaModule'),
    
    render: function() {
      var list = function(results) {
        views.workviews.media.mediaList.innerHTML = '';
        
        results.forEach(function(result) {
          var li = views.page.createElement('li', {
            textContent: result.value.name
          });
          li.dataset.id = result.key;
          views.workviews.media.mediaList.appendChild(li);
        });
      };
      
      idb.getAll('media', list);
    }
  },
  
  // The orthographies workview
  orthographies: {
    render: function() {
      console.log('orthographies rendering!');
    }
  },
  
  // Sets the current workview / workspace / interface / region
  // Acceptable values for the 'workview' argument: 'documents', 'lexicon', 'media', 'orthographies', 'tags', 'texts'
  setWorkview: function(workview) {
  
    // Underlines the associated nav button using CSS
    var navButtons = document.querySelectorAll('#appNav a');
    for (var i=0; i<navButtons.length; i++) {
      navButtons[i].classList.remove('underline');
      if (navButtons[i].textContent.toLowerCase() === workview) {
        navButtons[i].classList.add('underline');
      }
    }
    
    // Displays any element that has the class associated with the specified workview
    var modules = document.querySelectorAll('#overviewPane .module');
    for (var i=0; i<modules.length; i++) {
      if (modules[i].classList.contains(workview + 'Module')) {
        views.page.display(modules[i]);
      } else {
        views.page.hide(modules[i]);
      }
    }
    
    var details = document.querySelectorAll('#detailsPane .module');
    for (var i=0; i<details.length; i++) {
      views.page.hide(details[i]);
    }

    views.workviews[workview].render();
    
    app.preferences.currentWorkview = workview;
  },
  
  tags: {
    render: function() {
      console.log('tags rendering!');
    }
  },
  
  texts: {
    mediaArea: document.querySelector('#detailsPane .textsModule .media'),
    detailsPane: document.querySelector('#detailsPane .textsModule'),
    overviewPane: document.querySelector('#overviewPane .textsModule'),
    phraseWrapper: document.querySelector('#detailsPane .phrases'),
    textsList: document.querySelector('#textsList'),
    titleWrapper: document.querySelector('#detailsPane .titles'),
    
    displayText: function(text) {
      views.workviews.texts.phraseWrapper.innerHTML = '';
      views.workviews.texts.titleWrapper.innerHTML = '';
      views.workviews.texts.mediaArea.innerHTML = '';
      
      text.titles.forEach(function(title, i) {
        var input = views.page.createElement('input', { value: title.text });
        input.dataset.id = i;
        input.classList.add('title');
        views.workviews.texts.titleWrapper.appendChild(input);
        input.addEventListener('blur', app.textsEvent);
      });
      
      text.media.forEach(function(id) {
        var render = function(file) {
          var audio = views.page.createElement('audio', { controls: true });
          var url = URL.createObjectURL(file);
          audio.src = url;
          views.workviews.texts.mediaArea.appendChild(audio);
          audio.addEventListener('timeupdate', app.textsEvent);
        };
        
        idb.get(id, 'media', render);
      });
      
      text.phrases.forEach(function(phrase, i) {
        phrase.display(views.workviews.texts.phraseWrapper);
      });
      
      views.page.display(views.workviews.texts.detailsPane);
    },
    
    promptMedia: function(displayArea) {
      var h1 = views.page.createElement('h1', { textContent: 'Select a media file to add' });
      displayArea.appendChild(h1);
      
      var select = views.page.createElement('select', { id: 'selectMedia' });
      displayArea.appendChild(select);
      
      var list = function(results) {
        results.forEach(function(result) {
          var option = views.page.createElement('option', { textContent: result.value.name, value: result.key });
          option.dataset.id = result.key;
          select.appendChild(option);
        });
      };
      
      var button = views.page.createElement('button', { id: 'addMediaToTextButton', textContent: 'Add selected media' });
      displayArea.appendChild(button);
      
      button.addEventListener('click', app.textsEvent);
      
      idb.getAll('media', list);
    },
    
    render: function() {
      var list = function(results) {
        views.workviews.texts.textsList.innerHTML = '';
        results.forEach(function(result) {
          var li = views.page.createElement('li', { textContent: result.value.titles[0].text });
          li.dataset.id = result.value.id;
          views.workviews.texts.textsList.appendChild(li);
        });
      };
      idb.getAll('texts', list);
    }
  }
};