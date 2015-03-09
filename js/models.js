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

models = {};

models.Media = function Media(data) {
  Model.call(this, data);
  
  // Maybe some methods to read the file to an array buffer, etc.
};

models.Corpus = function Corpus(data) {
  Model.call(this, data);
};

// Abbr: lang
models.Language = function Language(data) {
  Model.call(this, data);
};

// Abbr: t
models.Text = function Text(data) {
  Model.call(this, data);
  
  if (this.phrases) {
    this.phrases = this.phrases.map(function(phraseData) {
      return new models.Phrase(phraseData);
    });
  }
};

// Abbr: p
models.Phrase = function Phrase(data) {
  Model.call(this, data);
  
  if (this.words) {
    this.words = this.words.map(function(wordData) {
      return new models.Word(wordData);
    });
  }
};

// Abbr: w
models.Word = function Word(data) {
  Model.call(this, data);
  
  // Do we need a hydrate function for morphemes (actually lexemes)?
};

// Abbr: lex
models.Lexeme = function Lexeme(data) {
  Model.call(this, data);
};

// Abbr: cxn
models.Construction = function Construction() {
  Model.call(this, data);
};

models.Tag = function Tag() {
  Model.call(this, data);
};