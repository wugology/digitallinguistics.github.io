// MODELS

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
    // Use this rather than .push() when you don't want to accidentally duplicate IDs
    'add': {
      value: function(idsToAdd, type) {
        if (!idsToAdd.length) { idsToAdd = toArray(idsToAdd); }
        
        idsToAdd.forEach(function(id) {
          if (hasID(this[type], id)) { this[type].push(id); }
        }, this);
        
        this.store();
      }.bind(this)
    },
    
    // Removes any unused tags from the corpus' tags array
    // Then finds all tags in the corpus, and makes sure they're in the corpus tags array
    'cleanupTags': {
      value: function() {
        var addMissingTags = function() {
          this.pullTags().forEach(function(tag) {
            tag.tag(this);
          }, this);
          
          this.store();
        }.bind(this);
        
        var checkToRemove = function(results, tag) {
          if (results.length == 0) { tag.untag(this); }
        }.bind(this);
        
        var removeUnusedTags = function() {
          this.tags.forEach(function(tag, i, arr) {
            this.searchByTag(tag, checkToRemove);
            if (i == arr.length-1) { addMissingTags(); }
          }, this);
        }.bind(this);

        removeUnusedTags();
      }.bind(this)
    },

    'deleteTag': {
      value: function(tag) {
        tag.untag(this);
        
        this.store();
        
        var removeTags = function(texts) {
          texts.forEach(function(text) {
            tag.untag(text);
            
            text.phrases.forEach(function(phrase) {
              tag.untag(phrase);
              phrase.words.forEach(function(word) {
                tag.untag(word);
                word.morphemes.forEach(function(morpheme) {
                  tag.untag(morpheme);
                });
              });
            });
            
            text.store();
          });
        };
        
        this.get('texts', removeTags);
      }.bind(this)
    },

    // Retrieves all the specified type of object in this corpus from IndexedDB
    'get': {
      value: function(type, callback) {
        idb.get(this[type], type, callback);
      }.bind(this)
    },
    
    'getAbbrevs': {
      value: function(callback) {
        var extractAbbrevs = function(texts) {
          var abbrevs = [];
          
          texts.forEach(function(text) {
            abbrevs[text.id] = text.abbreviation;
          });
          
          if (typeof callback == 'function') { callback(abbrevs); }
        };
        
        this.get('texts', extractAbbrevs);
      }.bind(this)
    },

    'pullTags': {
      value: function() {
        var tagsHolder = { tags: [] };
        
        var transferTags = function(results) {
          results.forEach(function(result) {
            result.tags.forEach(function(tag) {
              tag.tag(tagsHolder);
            });
          });
        };
        
        this.tags.forEach(function(tag) {
          this.searchByTag(transferTags);
        }, this);
        
        return tagsHolder.tags;
      }.bind(this)
    },
    
    'remove': {
      value: function(idsToRemove, type, callback) {
        removeids(idsToRemove, this[type]);
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
    
    // Callback arguments: results, tag
    'searchByTag': {
      value: function(tag, callback) {
        results = [];
        
        if (tag.type == 'corpus') {
          if (this.hasTag(tag)) {
            results.push(this);
          }
          
          if (typeof callback == 'function') { callback(results, tag); }
        
        } else {
          var search = function(texts) {
            texts.forEach(function(text) {
              results.concat(text.searchByTag(tag));
            });
            
            if (typeof callback == 'function') { callback(results, tag); }
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
        var results = [];
        
        if (tag.type == 'text') {
          if (this.hasTag(tag)) { results.push(this); }
        } else {
          this.phrases.forEach(function(phrase) {
            results.concat(phrase.searchByTag(tag));
          }, this);
        }
        
        return results;
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
        var results = [];
        
        if (tag.type == 'phrase') {
          if (this.hasTag(tag)) { results.push(this); }
        } else {
          this.words.forEach(function(word) {
            results.concat(word.searchByTag(tag));
          }, this);
        }
        
        return results;
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
    'searchByTag': {
      value: function(tag) {
        var results = [];
        
        if (tag.type == 'word') {
          if (this.hasTag(tag)) { results.push(this); }
        } else {
          this.morphemes.forEach(function(morpheme) {
            if (morpheme.hasTag(tag)) { results.push(this); }
          }, this);
        }
        
        return results;
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
    
    'tag': {
      value: function(obj) {
        var matches = obj.tags.filter(function(t) {
          return (t.type == this.type && t.category == this.category && t.value == this.value);
        }.bind(this));
        
        if (matches.length == 0) {
          obj.tags.push(this);
        }
      }.bind(this)
    },
    
    'untag': {
      value: function(obj) {
        obj.tags = obj.tags.filter(function(t) {
          return !(t.type == this.type && t.category == this.category && t.value == this.value);
        }, this);
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
    value: function(wrapper, options) {
      phrases.forEach(function(phrase) {
        var pv = new PhraseView(phrase);
        pv.render(wrapper, options);
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