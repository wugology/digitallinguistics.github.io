// app

var app = {};

// Functionality tied to linguistic objects
app.Corpus = {
  create: function(name, documents, languages, lexicons, mediaFiles, texts) {
    newCorpus = new app.constructors.Corpus(name, documents, languages, lexicons, mediaFiles, texts);
    var setCorpus = function(indexes) {
      newCorpus.id = indexes[0];
      app.preferences.currentCorpus = newCorpus;
    };
    var indexes = idb.add([ newCorpus ], 'corpora', setCorpus);
  },
  
  // The function returns an array of items
  // The callback operates on each item individually
  set: function(corpusID, callback) {
    var successCallback = function(corpus) {
      app.preferences.currentCorpus = corpus;
      if (typeof callback === 'function') {
        callback();
      }
    }
    idb.get(corpusID, 'corpora', successCallback);
  }
};

app.Text = {
  create: function(mediaFiles, phrases, persons, tags, titles) {
    var newText = new app.constructors.Text(mediaFiles, phrases, persons, tags, titles);
    var texts = app.preferences.currentCorpus.texts;
    var updateCorpus = function(textIDs) {
      texts.push(textIDs[0]);
      idb.update(app.preferences.currentCorpus.id, 'texts', texts, 'corpora');
    };
    var textIDs = idb.add([ newText ], 'texts', updateCorpus);
    updateCorpus(textIDs);
  },
  
  import: function(format) {
  }
};

// Constructors for linguistic objects
app.constructors = {
  // This constructor takes arrays of IDs (i.e. the indexes of those objects in IndexedDB)
  Corpus: function(name, documents, languages, lexicons, mediaFiles, texts) {
    this.name = name;
    this.documents = documents;
    this.languages = languages;
    this.lexicons = lexicons;
    this.mediaFiles = mediaFiles;
    this.texts = texts;
  },
  
  Text: function(mediaFiles, phrases, persons, tags, titles) {
    this.mediaFiles = mediaFiles;
    this.phrases = phrases;
    this.persons = persons;
    this.tags = tags;
    this.titles = titles;
  }
};

// Some of these were breaking while I was working on other things, so I commented them out for now [DWH]
/*
app.p = new Phrase({
  transcription: 'me llamo wugbot', 
  translation: 'call me wugbot'
});

app.pv = new PhraseView({
  el: document.querySelector('#phrases'),

  model : app.p,

  render: function(){
    var template = hydrate('#phraseTemplate', this.model);
    this.el.appendChild(template);
    return this;
  }
});

app.pp = new Phrases({
  models: [
    {
      transcription: 'me llamo wugbot', 
      translation: 'Call me Wugbot.'
    },
    {
      transcription: 'estoy aqui para cortar árboles', 
      translation: 'I’m here to cut down trees.'
    }
  ]
})

app.w = new Word(
  {
    token: 'casa', 
    gloss: 'house'
  }
);

app.wv = new WordView({
  el: document.querySelector('#entries'),

  model : app.w,

  render: function(){
    var template = hydrate('#wordTemplate', this.model);
    this.el.appendChild(template);
    return this;
  }
});

app.pv = new PhraseView({
  el: document.querySelector('#phrases'),

  model : app.p,

  render: function(){
    var template = hydrate('#phraseTemplate', this.model);
    this.el.appendChild(template);
    return this;
  }
});

app.ppv = new PhrasesView({
  el: document.querySelector('#phrases'),

  collection : app.pp,
  modelView : PhraseView,

  markup : template('#phraseTemplate', this.model),

  render: function(){
    this.el.appendChild(this.markup);
    return this;
  }
});

app.wv.render();
app.pv.render();
app.ppv.render();
*/

page.nodes.boxIcon = document.querySelector('#boxIcon');
page.nodes.corpusSelector = document.querySelector('#corpusSelector');
page.nodes.corpusTextsSelector = document.querySelector('#corpusTextsSelector');
page.nodes.createCorpusButton = document.querySelector('#createCorpusButton');
page.nodes.desktopCSS = document.querySelector('#desktopCSS');
page.nodes.newCorpusPopup = document.querySelector('#newCorpusPopup');
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
  // callback = some renderings take a while to load; use this callback function to call a new function when the rendering is complete
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
          
          var newCorpusOption = document.createElement('option');
          newCorpusOption.textContent = 'Manage corpora';
          corpusSelector.add(newCorpusOption);
          
          if (typeof callback === 'function') {
            callback();
          }
        }
        
        var corpora = idb.getAll('corpora', displayCorpora);
        break;
      case 'newCorpusPopup':
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
        
        page.nodes.addNewTextButton.addEventListener('click', function() {
          app.Text.create();
        });
        page.nodes.importTextButton.addEventListener('click', function() {});
        break;
      case 'workspace':
        var promptNewCorpus = function() {
          page.render('newCorpusPopup', true);
          page.display(page.nodes.newCorpusPopup);
        };
        
        if (localStorage.wugbotPreferences === 'undefined') {
          app.preferences = {
            currentCorpus: { id: null },
            currentWorkview: 'texts'
          };
        } else {
          app.preferences = JSON.parse(localStorage.wugbotPreferences);
        }
        
        if (app.preferences.currentCorpus.id === null) {
          promptNewCorpus();
        } else {
          page.render('corpusSelector', true);
          app.Corpus.set(app.preferences.currentCorpus.id);
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
  newCorpusPopup: true,
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

page.nodes.createCorpusButton.addEventListener('click', function(ev) {
  ev.preventDefault();
  var name = document.querySelector('#corpusNameBox').value;
  var nodes = document.getElementsByName('corpusTextsList');
  var textIDs = [];
  for (var i=0; i<nodes.length; i++) {
    if (nodes[i].checked === true) {
      var textID = nodes[i].id.replace('text_', '');
      textIDs.push(textID);
    }
  }
  
  app.Corpus.create(name, [], [], [], [], textIDs);
  page.toggleDisplay(page.nodes.newCorpusPopup);
  var render = function() {
    var setValue = function() {
      page.nodes.corpusSelector.value = name;
    };
    page.render('corpusSelector', setValue);
  };
  window.setTimeout(render, 1000);
});

page.nodes.corpusSelector.addEventListener('change', function(ev) {
  if (ev.target.value === 'Manage corpora') {
    page.render('newCorpusPopup', true);
    page.display(page.nodes.newCorpusPopup);
    ev.target.selectedIndex = 0;
  } else {
    var selectedIndex = page.nodes.corpusSelector.selectedIndex;
    var option = page.nodes.corpusSelector.options[selectedIndex];
    var corpusID = Number(option.id.replace('corpus_', ''));
    app.Corpus.set(corpusID);
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