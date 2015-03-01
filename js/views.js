// The views in the app
// The views namespace object is initialized in script.js, and contains several site-wide functions
// There are several types of objects under views:
// - items: Representations of single linguistic objects (e.g. a single phrase)
//          Items are handed a data object by the controller (the app object)
//          Items do not call model methods themselves
// - collections: Representations of collections of linguistic objects (e.g. displaying all the phrases in a text)
//                Collections are handed an array of data objects by the controller (the app object)
//                Collections do not call model methods themselves
// - workviews: Regions, interfaces, workspaces, etc. A task-based view consisting of a number of other views and page components
//              There is only 1 instance of any given workview, so they do not need to be instantiated
//              Very simplistic routing happens whereby a workview renders if the user clicks the nav link for that section
// - popups: Popup views and their functionality
//           There is only 1 instance of any given popup (except popups.blank; see below), so they do not need to be instantiated
//           There is also a popups.blank that can be used to populate a popup from scratch - use this whenever plausible
// - page: General page-level rendering functions, such as page.display(element) or page.render() (for when the page initializes)
//         The views.page namespace is initialized in script.js, and contains a handful of useful site-wide functions

// Dependencies: views.js


// Collection views
views.collections = {};


// Item views
views.items = {};


// Page views
// DOM elements witin the page view
views.page.boxIcon = document.querySelector('#boxIcon');
views.page.settingsIcon = document.querySelector('#settingsIcon');
views.page.desktopCSS = document.querySelector('#desktopCSS');
views.page.mobileCSS = document.querySelector('#mobileCSS');

// A generic function for creating elements to insert in the DOM
// attributes is an object whose keys are valid element attributes, and whose values are valid values for those attributes
views.page.createElement = function(tagName, attributes) {
  var el = document.createElement(tagName);
  for (var attribute in attributes) {
    el[attribute] = attributes[attribute];
  }
  return el;
};

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
  if (app.preferences.currentCorpus === null) {
    var countCorpora = function(corpora) {
      if (corpora.length === 0) {
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
        if (views.popups.fileUpload.file === undefined) {
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
    if (views.popups.fileUpload.input.files.length === 1) {
      return views.popups.fileUpload.input.files[0];
    }
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
        var input = views.page.createElement('input', { value: title.titleText });
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
        };
        
        idb.get(id, 'media', render);
      });
      
      text.phrases.forEach(function(phrase, i) {
        phrase.display(i, views.workviews.texts.phraseWrapper);
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
          var li = views.page.createElement('li', { textContent: result.value.titles[0].titleText });
          li.dataset.id = result.value.id;
          views.workviews.texts.textsList.appendChild(li);
        });
      };
      idb.getAll('texts', list);
    }
  }
};