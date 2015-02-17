
// app

var app = {};

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

app.preferences = {
  currentCorpus: 'Mixtec',
  currentWorkview: 'texts'
};

page.nodes.boxIcon = document.querySelector('#boxIcon');
page.nodes.corpusIndicator = document.querySelector('#corpusIndicator');
page.nodes.popups = document.querySelector('#popups');
page.nodes.settingsButton = document.querySelector('#settingsButton');
page.nodes.settingsPopup = document.querySelector('#settingsPopup');

// Sets up the workspace based on app.preferences (which will eventually be user.preferences)
page.loadWorkspace = function() {
  page.nodes.corpusIndicator.textContent = app.preferences.currentCorpus;
  page.setWorkview(app.preferences.currentWorkview);
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
      page.toggleDisplay(modules[i]);
    } else {
      page.hide(modules[i]);
    }
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

page.nodes.popups.addEventListener('click', function(ev) {
  if (ev.target.className === 'icon') {
    page.toggleDisplay(ev.target.parentNode);
  }
});

page.nodes.settingsButton.addEventListener('click', function(ev) {
  page.toggleDisplay(settingsPopup);
});

window.addEventListener('load', page.loadWorkspace);