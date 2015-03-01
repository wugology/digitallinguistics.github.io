// The models for the app, mainly types of linguistic objects
// These are in the global namespace

//Dependencies: database.js

// Polyfill for the String.prototype.startsWith() function
if (!String.prototype.startsWith) {
  Object.defineProperty(String.prototype, 'startsWith', {
    enumerable: false,
    configurable: false,
    writable: false,
    value: function(searchString, position) {
      position = position || 0;
      return this.lastIndexOf(searchString, position) === position;
    }
  });
}


// The Corpus model
// A corpus should be initialized with all of the following properties, even if they consist of simply an empty array
// A corpus has the following properties:
// - Name (string)
// - Documents (array)
// - Languages (array)
// - Lexicons (array)
// - Media (array)
// - Texts (array)
var Corpus = function(data) {
  for (key in data) {
    this[key] = data[key];
  }
  
  Object.defineProperty(this, 'model', {
    enumerable: true,
    value: 'Corpus'
  });
  
  Object.defineProperty(this, 'setAsCurrent', {
    value: function() {
      app.preferences.currentCorpus = this;
      views.page.corpusSelector.set(this.name);
    }
  });
  
  Object.defineProperty(this, 'addToDatabase', {
    value: function(callback) {
      var setID = function(id) {
        Object.defineProperty(this, 'id', {
          enumerable: true,
          value: id
        });
        
        if (typeof callback === 'function') {
          callback(id);
        }
      }.bind(this);
      
      idb.add([this], 'corpora', setID);    
    }
  });

  return this;
}.bind(this);

var Media = {
  add: function(file) {
    idb.add([file], 'media', views.workviews.media.render);
  }
};

// A Phrase should be initialized with the following properties, even if they are null or empty arrays
// - speaker (string)
// - startTime (number in ss.ms)
// - endTime (number in ss.ms)
// - transcriptions (array)
// - transcripts (array)
// - translations (array)
// - tags (array)
// - words (array)
// - notes (string)
var Phrase = function(data) {
  for (key in data) {
    this[key] = data[key];
  }
  
  Object.defineProperty(this, 'model', {
    enumerable: true,
    value: 'Phrase'
  });
  
  Object.defineProperty(this, 'display', {
    value: function(index, wrapper) {
      var template = document.querySelector('#phraseTemplate');
      var li = template.content.querySelector('.phrase');
      li.innerHTML = '';
      li.id = 'phrase_' + index;
      li.dataset.startTime = this.startTime;
      li.dataset.endTime = this.endTime;
      
      var renderCollection = function(collection, itemName) { // (plural, singular)
        this[collection].forEach(function(item) {
          var line = views.page.createElement('p', { textContent: item[itemName + 'Text'] });
          line.classList.add(itemName);
          line.classList.add('unicode');
          li.appendChild(line);
        }.bind(this));
      }.bind(this);
      
      renderCollection('transcripts', 'transcript');
      renderCollection('transcriptions', 'transcription');
      renderCollection('translations', 'translation');

      var notes = views.page.createElement('p', { textContent: this.notes });
      notes.classList.add('notes');
      notes.classList.add('unicode');
      li.appendChild(notes);
      
      var phrase = template.content.cloneNode(true);
      wrapper.appendChild(phrase);
    }
  });
  
  return this;
};

// A text should be initialized with the following properties, even if they are null or an empty array:
// - media files (array)
// - persons (array)
// - tags (array)
// - titles (array, with at least one title object)
// - phrases (array)
var Text = function(data, callback) {
  for (key in data) {
    this[key] = data[key];
  }
  
  Object.defineProperty(this, 'model', {
    enumerable: true,
    value: 'Text'
  });
  
  Object.defineProperty(this, 'addToDatabase', {
    value: function(callback) {
      var setID = function(id) {
        Object.defineProperty(this, 'id', {
          enumerable: true,
          value: id
        });
        
        if (typeof callback === 'function') {
          callback(this);
        }
      }.bind(this);
      
      idb.add([this], 'texts', setID);
    }
  });
  
  Object.defineProperty(this, 'display', {
    value: function() {
      views.workviews.texts.displayText(this);
    }
  });
  
  Object.defineProperty(this, 'setAsCurrent', {
    value: function() {
      app.preferences.currentText = this;
    }
  });
  
  return this;
}.bind(this);

var Word = function() {};