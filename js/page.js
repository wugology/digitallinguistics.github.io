// Contains the 'views' functions, which all focus on display, render, and event listeners
// The views object itself is created in script.js, since some of the page functions are site-wide

// There are several types of objects under the page hash, each given its own subclass
// - page.nodes: DOM nodes that get referenced in more than one function
// - page.views: These are given names following the pattern xView (e.g. 'textsView'), and can be thought of as interfaces, regions, workviews, or workspaces
// - page.popups: These are given names following the pattern xPopup (e.g. 'settingsPopup')
// - page.function(): general functions like page.display()

page.views = {};
page.popups = {};
// page.nodes is instantiated in the script.js file

page.nodes.addNewTextButton = document.querySelector('#addNewTextButton');
page.nodes.boxIcon = document.querySelector('#boxIcon');
page.nodes.createCorpusButton = document.querySelector('#createCorpusButton');
page.nodes.desktopCSS = document.querySelector('#desktopCSS');
page.nodes.importTextButton = document.querySelector('#importTextButton');
page.nodes.mobileCSS = document.querySelector('#mobileCSS');
page.nodes.newCorpusForm = document.querySelector('#newCorpusForm');
page.nodes.popups = document.querySelector('#popups');
page.nodes.settingsButton = document.querySelector('#settingsButton');
page.nodes.switchLayoutButton = document.querySelector('#switchLayoutButton');
page.nodes.textsList = document.querySelector('#textsList');
page.nodes.textTitles = document.querySelector('.textsModule .titles');

page.views.corpusSelector = {
  el: document.querySelector('#corpusSelector'),
  rerender: true,
  
  render: function(rerender, callback) {
    if (rerender === true) {
      this.rerender = true;
    }
    
    if (this.rerender === true) {
      this.el.innerHTML = '';
      var displayCorpora = function(corpora) {
        corpora.sort(function(a, b) { if (a.name > b.name) { return 1; } });
        
        var createOption = function(id, text, value) {
          var option = document.createElement('option');
          option.dataset.id = id;
          option.value = value;
          option.textContent = text;
          this.el.add(option);
        }.bind(this);
        
        createOption('placeholder', 'Select a corpus', 'placeholder');
        
        corpora.forEach(function(corpus) {
          createOption(corpus.id, corpus.name, corpus.id);
        });
        
        createOption('manage', 'Manage corpora', 'manage');

        if (app.preferences.currentCorpus !== null) {
          this.el.value = app.preferences.currentCorpus.id;
        }
        
        if (typeof callback === 'function') {
          callback();
        }
      }.bind(this);
      
      idb.getAll('corpora', displayCorpora);
    }
    
    this.rerender = false;
  }
};

page.popups.manageCorporaPopup = {
  el: document.querySelector('#manageCorporaPopup'),
  rerender: true,
  
  selectedTextIDs: function() {
    var textIDs = [];
    var nodes = document.getElementsByName('corpusTextsList');
    for (var i=0; i<nodes.length; i++) {
      if (nodes[i].checked === true) {
        var textID = Number(nodes[i].dataset.id);
        textIDs.push(textID);
      }
    }
    return textIDs;
  },
  
  toggleDisplay: function() {
    page.toggleDisplay(this.el);
  },
  
  render: function(rerender, callback) {
    if (rerender === true) {
      this.rerender = true;
    }
    
    if (this.rerender === true) {
      var displayTexts = function(texts) {
        var textsList = document.querySelector('#corpusTextsSelector');
        textsList.innerHTML = '';
        
        var legend = document.createElement('legend');
        legend.textContent = 'Texts';
        textsList.appendChild(legend);
        
        texts.forEach(function(text) {
          var label = document.createElement('label');
          label.htmlFor = 'text_' + text.id;
          
          var input = document.createElement('input');
          input.id = 'text_' + text.id;
          input.dataset.id = text.id;
          input.type = 'checkbox';
          input.name = 'corpusTextsList';
          input.value = text.id;
          
          var text = document.createElement('p');
          text.classList.add('unicode');
          text.textContent = text.titles[0].titleText;
          
          label.appendChild(input);
          label.appendChild(text);
          textsList.appendChild(label);
        });
      };
      
      idb.getAll('texts', displayTexts);
    }
    
    page.display(this.el);
    this.rerender = false;
  }
};

page.views.pageView = {
  rerender: true,
  
  render: function(rerender) {
    if (rerender === true) {
      this.rerender = true;
    }
    
    if (this.rerender === true) {
      if (app.preferences.currentCorpus === null) {
        page.popups.manageCorporaPopup.render(true);
      }
      
      page.views.corpusSelector.render(true);
      
      if (app.preferences.currentWorkview !== null) {
        page.views.render(app.preferences.currentWorkview, false);
      }
    }
    
    this.rerender = false;
  }
};

page.popups.settingsPopup = {
  el: document.querySelector('#settingsPopup'),
  rerender: true,
  
  render: function() {
    if (rerender === true) {
      this.rerender = true;
    }
    
    if (this.rerender === true) {
      page.display(this.el);
    }
    
    this.rerender = false;
  },
  
  toggleDisplay: function() {
    page.toggleDisplay(this.el);
  }
};

page.views.textsWorkview = {
  els:  document.querySelectorAll('.textsModule'),
  rerender: true,
  
  importText: function() {
    var notify = function(text) {
      text.addToTexts();
      page.notify('Text successfully imported.');
      idb.reconstruct(text).setAsCurrent();
    };
    app.convert(notify);
  },
  
  render: function(rerender) {
    if (rerender === true) {
      this.rerender = true;
    }
    
    if (this.rerender === true) {
      for (var i=0; i<this.els.length; i++) {
        page.display(this.els[i]);
      }
    }
    
    this.rerender = false;
  },
  
  toggleDisplay: function() {
    for (var i=0; i<els.length; i++) {
      page.toggleDisplay(els[i]);
    }
  }
};

page.switchLayout = function() {
  var small = '(min-width: 1000px)';
  var large = '(max-width: 1000px)';
  if (page.nodes.desktopCSS.media === small) {
    page.nodes.desktopCSS.media = large;
    page.nodes.mobileCSS.media = small;
  } else {
    page.nodes.desktopCSS.media = small;
    page.nodes.mobileCSS.media = large;
  }
};

// Displays all the modules associated with a given workview
// Ex. The 'lexicon' workview displays everything with class=lexiconModule on it
// Acceptable inputs for the 'workview' argument in .render(workview): 'documents', 'lexicon', 'media', 'orthographies', 'tags', 'texts'
page.views.render = function(view, rerender) {
  page.views[view].render(rerender);
  
  var navButtons = document.querySelector('#appNav a');
  for (var i=0; i<navButtons.length; i++) {
    navButtons[i].classList.remove('underline');
    if (navButtons[i].id === view + 'Nav') {
      navButtons[i].classList.add('underline');
    }
  }
  
  app.preferences.currentWorkview = view;
};

// EVENT LISTENERS
page.views.corpusSelector.el.addEventListener('change', function(ev){
  switch (ev.target.value) {
    case 'manage':
      page.popups.manageCorporaPopup.render(true);
      corpusSelector.selectedIndex = 0;
      break;
    case 'placeholder':
      break;
    default:
      var selectedIndex = page.views.corpusSelector.el.selectedIndex;
      var option = page.views.corpusSelector.el.options[selectedIndex];
      var corpusID = Number(option.dataset.id);
      var setCorpus = function(corpus) {
        corpus.setAsCurrent();
        app.savePreferences();
      };
      idb.get(corpusID, 'corpora', setCorpus);
      break;
  }
});

page.nodes.addNewTextButton.addEventListener('click', function() {
  var text = new app.constructors.Text([], [], [], [], [ { orthography: '', titleText: '' } ]);
  text.addToTexts();
  text.addToCorpus(app.preferences.currentCorpus.id);
  text.setAsCurrent();
  text.display();
});

page.nodes.appNav.addEventListener('click', function(ev) {  
  if (ev.target.tagName === 'A') {
    page.views.render(ev.target.id.replace('Nav', ''), false);
  }
  
  page.nodes.appNav.classList.add('hideonMobile');
});

page.nodes.boxIcon.addEventListener('click', function() {
  page.toggleDisplay(page.nodes.appNav);
  page.hide(page.nodes.mainNav);
});
page.nodes.importTextButton.addEventListener('click', page.views.textsWorkview.importText);

page.nodes.newCorpusForm.addEventListener('submit', function(ev) {
  ev.preventDefault();
  var corpus = new app.constructors.Corpus(document.querySelector('#corpusNameBox').value, [], [], [], [], page.popups.manageCorporaPopup.selectedTextIDs());
  var renderCorpusSelector = function() {
    page.views.corpusSelector.render(true);
  };
  corpus.setAsCurrent();
  corpus.addToCorpora(renderCorpusSelector);
  page.views.manageCorporaPopup.toggleDisplay();
});


page.nodes.popups.addEventListener('click', function(ev) {
  if (ev.target.className === 'icon') {
    page.toggleDisplay(ev.target.parentNode);
  }
});

page.nodes.settingsButton.addEventListener('click', function() {
  page.toggleDisplay(settingsPopup);
  page.popups.settingsPopup.render(false);
});

page.nodes.switchLayoutButton.addEventListener('click', function() {
  page.switchLayout();
  page.popups.settingsPopup.toggleDisplay();
});

page.nodes.textTitles.addEventListener('input', function(ev) {
  if (ev.target.classList.contains('textTitle')) {
    var title = app.preferences.currentText.titles[parseInt(ev.target.dataset.titleIndex)];
    title.titleText = ev.target.value;
  }
});

page.nodes.textTitles.addEventListener('blur', function(ev) {
  idb.update(app.preferences.currentText.id, 'titles', app.preferences.currentText.titles, 'texts');
});

page.nodes.textTitles.addEventListener('keyup', function(ev) {
  if (ev.keyCode === 13) {
    idb.update(app.preferences.currentText.id, 'titles', app.preferences.currentText.titles, 'texts');
  }
  if (ev.keyCode === 27) {
    ev.target.value = app.preferences.currentText.titles[parseInt(ev.target.dataset.titleIndex)].titleText;
  }
});

window.addEventListener('load', function() {
  idb.open('WugbotDev', app.initialize);
});

window.addEventListener('unload', app.savePreferences);