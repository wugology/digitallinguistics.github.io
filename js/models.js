// MODELS
// - Corpus
// - Language
// - Text
// - Phrase
// - Word
// - Lexeme
// - Construction
// - Tag

// Each model inherits the following methods
// From idbObj:
// - delete: deletes the model and reindexes its array as needed
// - save: updates the object in IndexedDB, or adds it if the object doesn't yet exist, then assigns itself a breadcrumb
// From Model:
// - json
// - search
// From View:
// - hide
// - display
// - toggleDisplay
// From ObserverList
// - observers (array)
// - observers.add
// - observers.remove
// - notify
// - update

var Media = function(data) {
  Model.call(this, data);
  
  Object.defineProperty(this, 'model', {
    enumerable: true,
    value: 'Media'
  });
  
  // Maybe some methods to read the file to an array buffer, etc.
};

var Corpus = function(data) {
  Model.call(this, data);
  
  Object.defineProperty(this, 'model', {
    enumerable: true,
    value: 'Corpus'
  });
};

// Abbr: lang
var Language = function() {
  Model.call(this, data);

  Object.defineProperty(this, 'model', {
    enumerable: true,
    value: 'Language'
  });
};

// Abbr: t
var Text = function(data) {
  Model.call(this, data);

  Object.defineProperty(this, 'model', {
    enumerable: true,
    value: 'Text'
  });
  
  this.phrases = this.phrases.map(function(phraseData) {
    return new Phrase(phraseData);
  });
};

// Abbr: p
var Phrase = function(data) {
  Model.call(this, data);
  
  Object.defineProperty(this, 'model', {
    enumerable: true,
    value: 'Phrase'
  });

  this.words = this.words.map(function(wordData) {
    return new Word(wordData);
  });
};

// Abbr: w
var Word = function(data) {
  Model.call(this, data);

  Object.defineProperty(this, 'model', {
    enumerable: true,
    value: 'Word'
  });
  
  // Do we need a hydrate function for morphemes (actually lexemes)?
};

// Abbr: lex
var Lexeme = function(data) {
  Model.call(this, data);
  
  Object.defineProperty(this, 'model', {
    enumerable: true,
    value: 'Lexeme'
  });
};

// Abbr: cxn
var Construction = function() {
  Model.call(this, data);
  
  Object.defineProperty(this, 'model', {
    enumerable: true,
    value: 'Construction'
  });  
};

var Tag = function() {
  // Tags don't seem like models, so I'm not calling the Model function here (yet)
};