// app

var app = {};

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

page.nodes.boxIcon = document.querySelector('#boxIcon');

app.wv.render();
app.pv.render();

page.nodes.boxIcon.addEventListener('click', function() {
  if (page.nodes.appNav.style.display !== 'flex' && page.nodes.appNav.style.display !== 'none') {
    page.hide(page.nodes.appNav);
  } else if (page.nodes.appNav.style.display !== 'flex') {
    page.display(page.nodes.appNav);
    page.hide(page.nodes.mainNav);
  } else {
    page.hide(page.nodes.appNav);
  }
});
