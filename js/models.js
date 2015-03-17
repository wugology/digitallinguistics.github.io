models = {};

// ITEM MODELS (SINGULAR)
models.Document = function(data) {
  Model.call(this, data);
  // Maybe some methods to read the file to an array buffer, etc.
};

models.MediaFile = function MediaFile(data) {
  Model.call(this, data);
  
  Object.defineProperties(this, {
    'addToCorpus': {
      value: function() {
        app.preferences.currentCorpus.add(this.id, 'media');
      }.bind(this)
    },
    
    'removeFromCorpus': {
      value: function() {
        app.preferences.currentCorpus.remove(this.id, 'media');
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
    'add': {
      value: function(idsToAdd, type) {
        if (!idsToAdd.length) { idsToAdd = toArray(idsToAdd); }
        
        idsToAdd.forEach(function(idToAdd) {
          var matches = this[type].filter(function(id) {
            return id == idToAdd;
          });
          
          if (matches.length == 0) {
            this[type].push(idToAdd);
          }
        }, this);
        
        this.store();
      }.bind(this)
    },
    
    'cleanupTags': {
      value: function() {
        var searchTag = function(tag, i, arr) {
          var checkToRemove = function(results) {
            if (results.length == 0) { this.remove(tag); }
            if (i == arr.length-1) { this.store(); }
          }.bind(this);
          
          this.searchByTag(tag, checkToRemove);
        }.bind(this);
        
        this.tags.forEach(searchTag);
      }.bind(this)
    },

    // Retrieves all the specified type of object in this corpus from IndexedDB
    'get': {
      value: function(type, callback) {
        idb.get(this[type], type, callback);
      }.bind(this)
    },
    
    'remove': {
      value: function(idsToRemove, type, callback) {
        if (!idsToRemove.length) { idsToRemove = toArray(idsToRemove); }
        
        idsToRemove.forEach(function(idToRemove) {
          this[type].forEach(function(id, i) {
            if (id == idToRemove) { this[type].splice(i, 1); }
          }, this);
        }, this);
        
        this.cleanupTags();
        this.store(callback);
      }.bind(this)
    },
    
    'removeAllTags': {
      value: function() {
        app.preferences.currentCorpus.tags = [];
        
        var remove = function(texts) {
          texts.forEach(function(text) {
            text.tags = [];
            
            text.phrases.forEach(function(phrase) {
              phrase.tags = [];
            });
            
            text.store();
          });
        };
        
        this.get('texts', remove);
      }.bind(this)
    },
    
    'removeTag': {
      value: function(tag) {
        var removeFromTagsList = function(tagsList) {
          tagsList = tagsList.filter(function(t) {
            return !(t.type == tag.type && t.category == tag.category && t.value == tag.value);
          });
        };
        
        removeFromTagsList(this.tags);
        
        var removeCrumbs = function(texts) {
          texts.forEach(function(text) {
            removeFromTagsList(text.tags);
            text.phrases.forEach(function(phrase) {
              removeFromTagsList(phrase.tags);
              phrase.words.forEach(function(word) {
                removeFromTagsList(word.tags);
                word.morphemes.forEach(function(morpheme) {
                  removeFromTagsList(morpheme.tags);
                });
              });
            });
          });
        }.bind(this);
        
        this.get('texts', removeCrumbs);
        
        this.store();
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
          
          if (typeof callback == 'function') { callback(app.searchResults, 'phrase'); }
        };
        
        this.get('texts', search);
      }.bind(this)
    },
    
    'setAsCurrent': {
      value: function() {
        app.preferences.currentCorpus = this;
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
        app.preferences.currentCorpus.add(this.id, 'texts');
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
        app.preferences.currentCorpus.remove(this.id, 'texts');
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

  if (!this.notes) { this.notes = {}; }
  if (!this.tags) {this.tags = []; }
  if (!this.transcriptions) { this.transcriptions = {}; }
  if (!this.transcripts) { this.transcripts = {}; }
  if (!this.translations) { this.translations = {}; }
  if (!this.words) { this.words = [];}
  
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
          if (media.length != 0) {
            var url = URL.createObjectURL(media[0].file);
            var a = new Audio(url + '#t=' + this.startTime + ',' + this.endTime);
            a.play();
          }
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
            return hash[ortho].search(searchExpr) != -1;
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
  
  if (!this.glosses) { this.glosses = {}; }
  if (!this.morphemes) { this.morphemes = []; }
  if (!this.transcriptions) { this.transcriptions = {}; }
  
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
    },
    
    'push': {
      value: function(array) {
        var matches = array.filter(function(t) {
          return (t.type == this.type && t.category == this.category && t.value == this.value);
        }.bind(this));
        
        if (matches.length == 0) {
          array.push(this);
        }
      }.bind(this)
    }
  });
};

Object.defineProperties(models.Tag.constructor.prototype, {
  'parse': {
    value: function(tagString) {
      var tagParts = tagString.split(':');
      var tag = new models.Tag({
        type: tagParts[0],
        category: tagParts[1],
        value: tagParts[2] || null
      });
      return tag;
    }
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