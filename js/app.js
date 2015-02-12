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
  }, 
  {}
)

app.wv = new WordView(app.w, {
  el: document.body,
  model : app.w,
  render: function(){
    var template = hydrate('#wordTemplate', this.model);
    this.el.appendChild(template);
    return this;
  }
});

app.wv.render();


