// app

var app = {};

app.Corpus = {
  create: function(name, documents, languages, lexicons, mediaFiles, texts) {
    var newCorpus = new app.prototypes.Corpus(name, documents, languages, lexicons, mediaFiles, texts);
    page.render.corpusSelector();
    app.preferences.currentCorpus = newCorpus.name;
    corpusSelector.value = app.preferences.currentCorpus;
  },
  
  set: function(corpus) {
    corpusSelector.value = corpus;
    // Will also need to rerender whichever workview is current
    app.preferences.currentCorpus = corpus;
  }
};

app.prototypes = {
  Corpus: function(name, documents, languages, lexicons, mediaFiles, texts) {
    this.name = name;
    this.documents = documents;
    this.languages = languages;
    this.lexicons = lexicons;
    this.mediaFiles = mediaFiles;
    this.texts = texts;
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
page.nodes.popups = document.querySelector('#popups');
page.nodes.settingsButton = document.querySelector('#settingsButton');
page.nodes.settingsPopup = document.querySelector('#settingsPopup');
page.nodes.switchLayoutButton = document.querySelector('#switchLayoutButton');
page.nodes.desktopCSS = document.querySelector('#desktopCSS');
page.nodes.mobileCSS = document.querySelector('#mobileCSS');

// At any given time, only some of the elements on the page are being displayed
// The dynamic content in these elements should not be loaded until the element is displayed
// These functions load the dynamic content for different views - call them when you display that view
page.render = {
  corpusSelector: function() {
    var displayCorpora = function(corpora) {
      corpora.forEach(function(corpus) {
        var option = document.createElement('option');
        option.textContent = corpus.name;
        corpusSelector.insertBefore(option, corpusSelector.lastChild);
      });
    }
    
    var corpora = idb.getAll('corpora', displayCorpora);
    // Add a line that clears the corpus selector before rendering (maybe making the placeholders obsolete - just add the 'add corpus' option manually, after the corpora are done being added
    // Add the 'new corpus' option here, after the other corpora have loaded
  }
};

// Sets up the workspace based on app.preferences (which will eventually be user.preferences)
page.loadWorkspace = function() {
  if (localStorage.wugbotPreferences === undefined) {
    app.preferences = {
      currentCorpus: 'Select a corpus',
      currentWorkview: 'texts'
    };
  } else {
    app.preferences = JSON.parse(localStorage.wugbotPreferences);
  }
  page.setWorkview(app.preferences.currentWorkview);
  page.render.corpusSelector();
  //page.nodes.corpusSelector.value = app.preferences.currentCorpus;
};

// Saves app.preferences to localStorage
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

page.nodes.corpusSelector.addEventListener('change', function(ev) {
  if (ev.target.value === 'Add a new corpus') {
    app.Corpus.create();
  } else {
    app.Corpus.set(ev.target.value);
  }
});

page.nodes.popups.addEventListener('click', function(ev) {
  if (ev.target.className === 'icon') {
    page.toggleDisplay(ev.target.parentNode);
  }
});

page.nodes.settingsButton.addEventListener('click', function(ev) {
  page.toggleDisplay(settingsPopup);
});

page.nodes.switchLayoutButton.addEventListener('click', function() {
  page.switchLayout();
  page.toggleDisplay(page.nodes.settingsPopup);
});

window.addEventListener('load', function() {
  idb.open(page.loadWorkspace);
});
window.addEventListener('unload', page.saveWorkspace);