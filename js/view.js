// Contains the 'page' functions, which all focus on display, render, and event listeners
// The page object itself is created in script.js, since some of the page functions are site-wide

page.nodes.boxIcon = document.querySelector('#boxIcon');
page.nodes.corpusSelector = document.querySelector('#corpusSelector');
page.nodes.corpusTextsSelector = document.querySelector('#corpusTextsSelector');
page.nodes.desktopCSS = document.querySelector('#desktopCSS');
page.nodes.manageCorporaPopup = document.querySelector('#manageCorporaPopup');
page.nodes.mobileCSS = document.querySelector('#mobileCSS');
page.nodes.popups = document.querySelector('#popups');
page.nodes.settingsButton = document.querySelector('#settingsButton');
page.nodes.settingsPopup = document.querySelector('#settingsPopup');
page.nodes.textsList = document.querySelector('#textsList');

// At any given time, only some of the elements on the page are being displayed
// The dynamic content in these elements should not be loaded until the element is displayed
// Call the page.render() function whenever you display that view
// Arguments:
  // view - the view you want to render (e.g. corpusSelector, workspace, textsWorkview)
  // rerender - whether you want this view to rerender each time the function fires, or only the first instance
    // true = will rerender every time the function fires
    // false = will only render the first time the function fires
  // callback = use this callback function to call a new function when the rendering is complete
page.render = function(view, rerender, callback) {
  if (rerender === true) {
    page.rerender[view] = true;
  }
  
  if (page.rerender[view] === true) {
    switch (view) {
      case 'corpusSelector':
        page.nodes.corpusSelector.innerHTML = '';
        var displayCorpora = function(corpora) {
          corpora.sort(function(a, b) { if (a.name > b.name) { return 1; } });
          
          corpora.forEach(function(corpus) {
            var option = document.createElement('option');
            option.id = 'corpus_' + corpus.id;
            option.textContent = corpus.name;
            corpusSelector.add(option);
          });
          
          var manageCorporaOption = document.createElement('option');
          manageCorporaOption.textContent = 'Manage corpora';
          corpusSelector.add(manageCorporaOption);
          
          page.nodes.corpusSelector.value = app.preferences.currentCorpus.name;
          
          if (typeof callback === 'function') {
            callback();
          }
        }
        
        var corpora = idb.getAll('corpora', displayCorpora);
        break;
      case 'manageCorporaPopup':
        var renderTextsList = function(texts) {
          texts.forEach(function(text) {
            var newLabel = document.createElement('label');
            newLabel.htmlFor = 'text_' + text.id;
            var newInput = document.createElement('input');
            newInput.id = 'text_' + text.id;
            newInput.type = 'checkbox';
            newInput.name = 'corpusTextsList'
            newInput.value = text.id;
            var newText = document.createElement('p');
            newText.textContent = text.title;
            newLabel.appendChild(newInput);
            newLabel.appendChild(newText);
            page.nodes.corpusTextsSelector.appendChild(newLabel);
          });
        };
        var texts = idb.getAll('texts', renderTextsList);
        
        page.nodes.createCorpusButton = document.querySelector('#createCorpusButton');
        page.nodes.createCorpusButton.addEventListener('click', function(ev) {
          var name = document.querySelector('#corpusNameBox').value;
          var nodes = document.getElementsByName('corpusTextsList');
          var textIDs = [];
          for (var i=0; i<nodes.length; i++) {
            if (nodes[i].checked === true) {
              var textID = nodes[i].id.replace('text_', '');
              textIDs.push(textID);
            }
          }
          
          var newCorpus = new app.constructors.Corpus(name, [], [], [], [], textIDs);
          newCorpus.addToCorpora();
          newCorpus.setAsCurrent();
          page.toggleDisplay(page.nodes.manageCorporaPopup);
          var render = function() {
            var setValue = function() {
              page.nodes.corpusSelector.value = newCorpus.name;
            };
            page.render('corpusSelector', setValue);
          };
          window.setTimeout(render, 1000);
        });
        break;
      case 'settingsPopup':
        page.nodes.switchLayoutButton = document.querySelector('#switchLayoutButton');
        
        page.nodes.switchLayoutButton.addEventListener('click', function() {
          page.switchLayout();
          page.toggleDisplay(page.nodes.settingsPopup);
        });
        break;
      case 'textsWorkview':
        page.nodes.addNewTextButton = document.querySelector('#addNewTextButton');
        page.nodes.importTextButton = document.querySelector('#importTextButton');
        page.nodes.textTitles = document.querySelector('.textsModule .titles');
        
        page.nodes.addNewTextButton.addEventListener('click', function() {
          newText = new app.constructors.Text([], [], [], [], [ { orthography: '', titleText: '' } ]);
          newText.addToTexts();
          newText.addToCorpus(app.preferences.currentCorpus.id);
          newText.setAsCurrent();
          newText.display();
        });
        page.nodes.importTextButton.addEventListener('click', function() {
          app.convert();
        });
        page.nodes.textTitles.addEventListener('input', function(ev) {
          if (ev.target.classList.contains('textTitle')) {
            app.preferences.currentText.titles[ev.target.dataset.titleIndex].titleText = ev.target.value;
            console.log(app.preferences.currentText.titles[0]);
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
            ev.target.value = app.preferences.currentText.titles[ev.target.dataset.titleIndex].titleText;
          }
        });
        break;
      case 'workspace':
        var promptNewCorpus = function() {
          page.render('manageCorporaPopup', true);
          page.display(page.nodes.manageCorporaPopup);
        };
        
        if (localStorage.wugbotPreferences === 'undefined') {
          app.preferences = {
            currentCorpus: null, // Should be an entire corpus object, with attached methods
            currentText: null,   // Should be an entire text object, with attached methods
            currentWorkview: 'texts'
          };
        } else {
          app.preferences = JSON.parse(localStorage.wugbotPreferences);
          app.preferences.currentCorpus = idb.reconstruct(app.preferences.currentCorpus);
        }
        
        if (app.preferences.currentCorpus === null) {
          promptNewCorpus();
        } else {
          page.render('corpusSelector', true);
          app.preferences.currentCorpus.setAsCurrent();
          page.nodes.corpusSelector.value = app.preferences.currentCorpus.name;
        }
                
        page.setWorkview(app.preferences.currentWorkview);
        break;
      default:
    }
    page.rerender[view] = false;
  }
};

// Keeps track of what's been rendered already, and doesn't re-render if it already has
page.rerender = {
  corpusSelector: true,
  manageCorporaPopup: true,
  settingsPopup: true,
  textsWorkview: true,
  workspace: true
};

// Saves app.preferences to local storage
page.saveWorkspace = function() {
  localStorage.wugbotPreferences = JSON.stringify(app.preferences, null, 2);
};

// Displays all the modules associated with a given workview
// Ex. The 'lexicon' workview displays everything with class=lexiconModule on it
// Acceptable inputs for 'workview': 'documents', 'lexicon', 'media', 'orthographies', 'tags', 'texts'
page.setWorkview = function(workview) {
  var modules = document.querySelectorAll('.module');
  var navButtons = document.querySelectorAll('#appNav a');
  
  for (var i=0; i<navButtons.length; i++) {
    navButtons[i].classList.remove('underline');
    if (navButtons[i].textContent.toLowerCase() === workview) {
      navButtons[i].classList.add('underline');
    }
  }
  
  for (var i=0; i<modules.length; i++) {
    if (modules[i].classList[0] === workview + 'Module') {
      page.display(modules[i]);
    } else {
      page.hide(modules[i]);
    }
  }
  
  page.render(workview + 'Workview');
  
  app.preferences.currentWorkview = workview;
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

// EVENT LISTENERS
page.nodes.appNav.addEventListener('click', function(ev) {
  if (ev.target.tagName === 'A') {
    page.setWorkview(ev.target.textContent.toLowerCase());
  }
  page.nodes.appNav.classList.add('hideonMobile');
});

page.nodes.boxIcon.addEventListener('click', function(ev) {
  page.toggleDisplay(page.nodes.appNav);
  page.hide(page.nodes.mainNav);
});

page.nodes.corpusSelector.addEventListener('change', function(ev) {
  if (ev.target.value === 'Manage corpora') {
    page.render('manageCorporaPopup', true);
    page.display(page.nodes.manageCorporaPopup);
    ev.target.selectedIndex = 0;
  } else {
    var selectedIndex = page.nodes.corpusSelector.selectedIndex;
    var option = page.nodes.corpusSelector.options[selectedIndex];
    var corpusID = Number(option.id.replace('corpus_', ''));
    var setCorpusAsCurrent = function(corpus) {
      corpus.setAsCurrent();
      page.nodes.corpusSelector.value = corpus.name;
    };
    idb.get(corpusID, 'corpora', setCorpusAsCurrent);
  }
});

page.nodes.popups.addEventListener('click', function(ev) {
  if (ev.target.className === 'icon') {
    page.toggleDisplay(ev.target.parentNode);
  }
});

page.nodes.settingsButton.addEventListener('click', function(ev) {
  page.toggleDisplay(settingsPopup);
  page.render('settingsPopup', false);
});

window.addEventListener('load', function() {
  var renderPage = function() {
    page.render('workspace', true);
  };
  idb.open(renderPage);
});

window.addEventListener('unload', page.saveWorkspace);