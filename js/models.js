// MODELS
// - Corpus
// - Language
// - Text
// - Phrase
// - Word
// - Lexeme
// - Construction
// - Tag

var Corpus = function() {
};

// Abbr: lang
var Language = function() {
};

// Abbr: t
var Text = function(data) {
  Model.call(this, data);
  
  this.phrases = this.phrases.map(function(phraseData) {
    return new Phrase(phraseData);
  });
};

// Abbr: p
var Phrase = function(data) {
  Model.call(this, data);
  
  this.words = this.words.map(function(wordData) {
    return new Word(wordData);
  });
};

// Abbr: w
var Word = function(data) {
  Model.call(this, data);
  
  // Do we need a hydrate function for morphemes (actually lexemes)?
};

// Abbr: lex
var Lexeme = function() {
};

// Abbr: cxn
var Construction = function() {
};

var Tag = function() {
};