models = {};

// ITEM MODELS (SINGULAR)
models.Media = function Media(data) {
  Model.call(this, data);
  
  // Maybe some methods to read the file to an array buffer, etc.
};

models.Corpus = function Corpus(data) {
  Model.call(this, data);
  
  Object.defineProperties(this, {
    'setAsCurrent': {
      value: function() {
        app.preferences.currentCorpus = this;
      }
    }
  });
  
  this.store();
};

// Abbr: lang
models.Language = function Language(data) {
  Model.call(this, data);
  this.store();
};

// Abbr: t
models.Text = function Text(data) {
  Model.call(this, data);
  
  if (this.phrases) {
    this.phrases = this.phrases.map(function(phraseData) {
      return new models.Phrase(phraseData);
    });
  }

  this.store();
};

// Abbr: p
models.Phrase = function Phrase(data) {
  Model.call(this, data);
  
  if (this.transcripts) { this.transcripts = new models.Transcripts(this.transcripts); }
  
  if (this.transcriptions) { this.transcriptions = new models.Transcriptions(this.transcriptions); }
  
  if (this.words) { this.words = new models.Words(this.words); }
  
  if (this.translations) { this.translations = new models.Translations(this.translations); }
  
  if (this.notes) { this.notes = new models.Notes(this.notes); }
};

// Abbr: w
models.Word = function Word(data) {
  Model.call(this, data);
};

// Abbr: rep
models.Rep = models.Representation = function Representation(data) {
  Model.call(this, data);
};

// Abbr: lex
models.Lexeme = function Lexeme(data) {
  Model.call(this, data);
  this.store();
};

// Morphemes do not have a model - only lexemes

// Abbr: cxn
models.Construction = function Construction() {
  Model.call(this, data);
};

models.Tag = function Tag() {
  Model.call(this, data);
};


// COLLECTIONS MODELS (PLURAL)
models.MediaCollection = function MediaCollection(data) {
  Collection.call(this, data);
};

// Doesn't seem like we need a Corpora collection model

models.Languages = function Languages(data) {
  var coll = data.map(function(languageData) {
    return new models.Language(languageData);
  });
  
  var languages = Collection.call(coll, coll);
  
  return languages;
};

models.Texts = function Texts(data) {
  var coll = data.map(function(textData) {
    return new models.Text(textData);
  });
  
  var texts = Collection.call(coll, coll);
  
  return texts;
};

models.Phrases = function Phrases(data) {
  var coll = data.map(function(phraseData) {
    return new models.Phrase(phraseData);
  });
  
  var phrases = Collection.call(coll, coll);
  
  return phrases;
};

models.Transcripts = function Transcripts(data) {
  var coll = data.map(function(transcriptData) {
    return new models.Rep(transcriptData);
  });
  
  var transcripts = Collection.call(coll, coll);
  
  return transcripts;
};

models.Transcriptions = function Transcriptions(data) {
  var coll = data.map(function(transcriptionData) {
    return new models.Rep(transcriptionData);
  });
  
  var transcriptions = Collection.call(coll, coll);
  
  return transcriptions;
};

models.Translations = function Translations(data) {
  var coll = data.map(function(translationData) {
    return new models.Rep(translationData);
  });
  
  var translations = Collection.call(coll, coll);
  
  return translations;
};

models.Notes = function Notes(data) {
  var coll = data.map(function(noteData) {
    return new models.Rep(noteData);
  });
  
  var notes = Collection.call(coll, coll);
  
  return notes;
};

models.Words = function Words(data) {
  var coll = data.map(function(wordData) {
    return new models.Word(wordData);
  });
  
  var words = Collection.call(coll, coll);
  
  return words;
};

// Morphemes don't have a model - a collection of morphemes is actually a collection of lexemes
models.Morphemes = function Morphemes(data) {
  var coll = data.map(function(lexemeData) {
    return new models.Lexeme(lexemeData);
  });
  
  var morphemes = Collection.call(coll, coll);
  
  return morphemes;
};

models.Lexicon = function Lexicon(data) {
  var coll = data.map(function(lexemeData) {
    return new models.Lexeme(lexemeData);
  });
  
  var lexicon = Collection.call(coll, coll);
  
  return lexicon;
};