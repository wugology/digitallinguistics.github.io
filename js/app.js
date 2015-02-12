// app

var app = {};

app.p = new Phrase({
  transcription: 'me llamo wugbot', 
  translation: 'call me wugbot'
})

app.w = new Word(
  {
    token: 'casa', 
    gloss: 'house'
  }
)

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



app.wv.render();
app.pv.render();
