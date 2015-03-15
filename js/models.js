models = {};

// ITEM MODELS (SINGULAR)
models.Document = function(data) {
  Model.call(this, data);
  // Maybe some methods to read the file to an array buffer, etc.
};

models.MediaFile = function MediaFile(data) {
  Model.call(this, data);
  
  this.observers.add('addToCorpus', app.preferences.currentCorpus);

  Object.defineProperties(this, {
    'addToCorpus': {
      value: function() {
        this.notify('addToCorpus', this);
      }.bind(this)
    },
    
    'removeFromCorpus': {
      value: function() {
        this.notify('removeFromCorpus', this).bind(this);
      }.bind(this)
    }
  });
};

models.Corpus = function Corpus(data) {
  Model.call(this, data);
  
  if (!this.documents) { this.documents = []; }
  if (!this.languages) { this.languages = []; }
  if (!this.lexicons) { this.lexicons = []; }
  if (!this.media) { this.media = []; }
  if (!this.texts) { this.texts = []; }
  if (!this.tags) { this.tags = []; }
  
  this.tags = new models.Tags(this.tags);
  
  Object.defineProperties(this, {
    // Retrieves all the specified type of object in this corpus from IndexedDB
    'get': {
      value: function(type, callback) {
        idb.get(this[type], type, callback);
      }.bind(this)
    },
    
    'searchByTag': {
      value: function(tag, callback) {
        
        if (tag.type == 'corpus') {
          this.hasTag(tag.category, tag.value);
          if (typeof callback == 'function') { callback(app.searchResults, tag.type); }
        
        } else {
          var search = function(texts) {
            texts.forEach(function(text) {
              text.searchByTag(tag);
            });
            
            if (typeof callback == 'function') { callback(app.searchResults, tag.type); }
          };
          
          this.get('texts', search);
        }
        
      }.bind(this)
    },
    
    'searchText': {
      value: function(attribute, searchExpr, callback) {
        var search = function(texts) {
          texts.forEach(function(text) {
            text.searchText(attribute, searchExpr);
          });
          
          if (typeof callback == 'function') { callback(app.searchResults); }
        };
        
        this.get('texts', search);
      }.bind(this)
    },
    
    'setAsCurrent': {
      value: function() {
        app.preferences.currentCorpus = this;
      }.bind(this)
    },
    
    'update': {
      value: function(action, data) {
        if (action == 'addToCorpus') {
          if (data.model == 'Text') {
            this.texts.push(data.id);
          } else if (data.model == 'MediaFile') {
            this.media.push(data.id);
          }
          
          data.observers.add('removeFromCorpus', this);
          this.store();
        
        } else if (action == 'removeFromCorpus') {
          data.observers.remove('removeFromCorpus', this);
          
          if (data.model == 'Text') {
            this.texts.forEach(function(textID, i) {
              if (textID == data.id) { this.texts.splice(i, 1); }
            });
          } else if (data.model == 'MediaFile') {
            this.media.forEach(function(mediaID, i) {
              if (mediaID == data.id) { this.media.splice(i, 1); }
            });
          }
        }
      }.bind(this)
    }
  });
};

// Abbr: lang
models.Language = function Language(data) {
  Model.call(this, data);
};

// Abbr: t
models.Text = function Text(data) {
  Model.call(this, data);
  
  if (!this.phrases) { this.phrases = [];}
  
  this.phrases = new models.Phrases(this.phrases);
  
  this.observers.add('addToCorpus', app.preferences.currentCorpus);
  
  this.abbreviation = this.abbreviation || '';
  this.type = this.type || '';
  this.genre = this.genre || '';
  this.analyses = this.analyses || [];
  this.media = this.media || [];
  this.persons = this.persons || [];
  this.tags = this.tags || [];
  this.titles = this.titles || { Eng: '' };
  this.custom = this.custom || {};
  
  Object.defineProperties(this, {
    'addToCorpus': {
      value: function() {
        this.notify('addToCorpus', this);
      }.bind(this)
    },

    // Retrieves all the specified type of object in this text from IndexedDB
    // - (only works on attributes that are arrays of IDs, e.g. Persons or Media)
    'get': {
      value: function(type, callback) {
        idb.get(this[type], type, callback);
      }.bind(this)
    },
    
    // Pass this a function that has the text as its argument - this keeps app-specific rendering methods in the app
    'render': {
      value: function(renderFunction) {
        renderFunction(this);
      }.bind(this)
    },
    
    'removeFromCorpus': {
      value: function() {
        this.notify('removeFromCorpus', this);
      }.bind(this)
    },
    
    'searchByTag': {
      value: function(tag) {
        if (tag.type == 'text') {
          this.hasTag(tag.category, tag.value);
        } else {
          this.phrases.forEach(function(phrase) {
            phrase.searchByTag(tag);
          }, this);
        }
      }.bind(this)
    },
    
    'searchText': {
      value: function(attribute, searchExpr) {
        this.phrases.forEach(function(phrase) {
          phrase.searchText(attribute, searchExpr);
        });
      }.bind(this)
    },
    
    'setAsCurrent': {
      value: function() {
        app.preferences.currentText = this;
      }.bind(this)
    }
  });
};

// Abbr: p
models.Phrase = function Phrase(data) {
  Model.call(this, data);

  if (!this.words) { this.words = [];}
  if (!this.tags) {this.tags = []; }
  
  this.words = new models.Words(this.words);

  Object.defineProperties(this, {
    'play': {
      value: function() {
        var text;
        
        if (app.preferences.currentText.id == this.breadcrumb[0]) {
          text = app.preferences.currentText;
        } else {
          var setText = function(t) {
            text = t[0];
          }.bind(this);
          idb.getBreadcrumb(this.breadcrumb[0], setText);
        }
        
        var playMedia = function(media) {
          if (media.length == 0) { alert('No media files are associated with this text.'); }
          
          var url = URL.createObjectURL(media[0].file);
          var a = new Audio(url + '#t=' + this.startTime + ',' + this.endTime);
          a.play();
        }.bind(this);
        
        text.get('media', playMedia);
      }.bind(this)
    },
    
    'searchByTag': {
      value: function(tag) {
        if (tag.type == 'phrase') {
          this.hasTag(tag.category, tag.value);
        } else {
          this.words.forEach(function(word) {
            word.searchByTag(tag);
          }, this);
        }
      }.bind(this)
    },
    
    'searchText': {
      value: function(attribute, searchExpr) {
        var checkHash = function(hash, searchExpr) {
          var some = Object.keys(hash).some(function(ortho) {
            return hash[ortho].search(searchExpr) == 0;
          }, this);
          
          return some;
        };
        
        if (attribute == 'all') {
          var attributes = ['transcripts', 'transcriptions', 'translations', 'notes'];
          
          var some = attributes.some(function(attribute) {
            return checkHash(this[attribute], searchExpr);
          }, this);
          
          
          if (some) { app.searchResults.push(this); }
        } else {
          if (checkHash(this[attribute], searchExpr)) {
            app.searchResults.push(this);
          }
        }
      }.bind(this)
    }
  });
};

// Abbr: w
models.Word = function Word(data) {
  Model.call(this, data);
  
  if (!this.morphemes) { this.morphemes = []; }
  
  this.morphemes = new models.Morphemes(this.morphemes);
  
  Object.defineProperties(this, {
    'search': {
      value: function(tag) {
        if (tag.type == 'word') {
          this.hasTag(tag.category, tag.value);
        } else {
          this.morphemes.forEach(function(morpheme) {
            morpheme.hasTag(tag.category, tag.value);
          }, this);
        }
      }.bind(this)
    }
  });
};

// Abbr: map
models.Morpheme = function(data) {
  Model.call(this, data);
};

// Abbr: lex
models.Lexeme = function Lexeme(data) {
  Model.call(this, data);
};

// Abbr: cxn
models.Construction = function Construction(data) {};

models.Tag = function Tag(data) {
  if (data) { augment(this, data); }
  
  this.type = this.type || '';
  this.category = this.category || '';
  this.value = this.value || '';
  
  Object.defineProperties(this, {
    'model': {
      enumerable: true,
      value: 'Tag'
    }
  });
};

Object.defineProperty(models.Tag.constructor.prototype, 'parse', {
  value: function(tagString) {
    var tagParts = tagString.split(':');
    var tag = new models.Tag({
      type: tagParts[0],
      category: tagParts[1],
      value: tagParts[2] || null
    });
    return tag;
  }
});


// COLLECTIONS MODELS (PLURAL)
models.Documents = function Documents(data) {
  var coll = data.map(function(documentData) {
    return new models.Document(documentData);
  });
  
  var documents = new Collection(coll);
  
  return documents;
};

models.MediaFiles = function MediaFiles(data) {
  var coll = data.map(function(mediaData) {
    return new models.MediaFile(mediaData);
  });
  
  var media = new Collection(coll);
  
  media.list = function(wrapper, populateListItem) {
    createList(wrapper, this, populateListItem);
  };
  
  return media;
};

// Doesn't seem like we need a Corpora collection model

models.Languages = function Languages(data) {
  var coll = data.map(function(languageData) {
    return new models.Language(languageData);
  });
  
  var languages = new Collection(coll);
  
  return languages;
};

models.Texts = function Texts(data) {
  var coll = data.map(function(textData) {
    return new models.Text(textData);
  });
  
  var texts = new Collection(coll);
  
  // Displays a list of all the texts in this collection; each text gets a <li id=[breadcrumb]>
  // populateListItem is a function that has a text and an empty <li> as its arguments; use this to populate the <li> with content from the text  
  texts.list = function(wrapper, populateListItem) {
    createList(wrapper, this, populateListItem);
  };
  
  return texts;
};

models.Phrases = function Phrases(data) {
  var coll = data.map(function(phraseData) {
    return new models.Phrase(phraseData);
  });

  var phrases = new Collection(coll);
  
  // populatePhrase is a function that takes a phrase a content wrapper for that phrase as its argument
  Object.defineProperty(phrases, 'render', {
    value: function(wrapper) {
      phrases.forEach(function(phrase) {
        var pv = new PhraseView(phrase);
        pv.render(wrapper);
      });
    }.bind(this)
  });
  
  return phrases;
};

models.Words = function Words(data) {
  var coll = data.map(function(wordData) {
    return new models.Word(wordData);
  });
  
  var words = new Collection(coll);
  
  return words;
};

// Morphemes don't have a model - a collection of morphemes is actually a collection of lexemes
models.Morphemes = function Morphemes(data) {
  var coll = data.map(function(lexemeData) {
    return new models.Lexeme(lexemeData);
  });
  
  var morphemes = new Collection(coll);
  
  return morphemes;
};

models.Lexicon = function Lexicon(data) {
  var coll = data.map(function(lexemeData) {
    return new models.Lexeme(lexemeData);
  });
  
  var lexicon = new Collection(coll);
  
  return lexicon;
};

models.Tags = function(data) {
  var coll = data.map(function(tagData) {
    return new models.Tag(tagData);
  });
  
  var tags = new Collection(coll);
  
  return tags;
};