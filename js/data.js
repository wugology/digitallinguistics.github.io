// The models for the app, mainly types of linguistic objects
// These are in the global namespace

//Dependencies: database.js


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
// - breadcrumb (format: 'text0_phrase0_word0_morpheme0')
//   - Each number following the word is the index for that item (e.g. phrase12 is the 13th phrase in the phrases array for that text)
//   - The number following the text, however, is the index in IndexedDB
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
    value: function(wrapper) {
      var template = document.querySelector('#phraseTemplate');
      var li = template.content.querySelector('.phrase');
      li.dataset.breadcrumb = this.breadcrumb;
            
      var contentWrapper = template.content.querySelector('.wrapper');
      contentWrapper.innerHTML = '';
      
      var renderCollection = function(collection, itemName) { // (plural, singular)
        this[collection].forEach(function(item) {
          var line = views.page.createElement('p', { textContent: item.text });
          line.classList.add(itemName);
          line.classList.add('unicode');
          contentWrapper.appendChild(line);
        }.bind(this));
      }.bind(this);
      
      renderCollection('transcripts', 'transcript');
      renderCollection('transcriptions', 'transcription');
      renderCollection('translations', 'translation');

      var notes = views.page.createElement('p', { textContent: this.notes });
      notes.classList.add('notes');
      notes.classList.add('unicode');
      contentWrapper.appendChild(notes);
      
      var phrase = template.content.cloneNode(true);
      wrapper.appendChild(phrase);
    }
  });
  
  Object.defineProperty(this, 'play', {
    value: function() {
      var textID = Number(this.breadcrumb.match(/text[0-9]+/)[0].replace('text', ''));
      
      var getMedia = function(text) {
        idb.get(text.media[0], 'media', getSrc);
      };
      
      var getSrc = function(file) {
        var url = URL.createObjectURL(file);
        var a = new Audio(url + '#t=' + this.startTime + ',' + this.endTime);
        a.play();
      }.bind(this);
      
      idb.get(textID, 'texts', getMedia);
      
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
        
        this.phrases.forEach(function(phrase, i) {
          phrase.breadcrumb = 'text' + this.id + '_phrase' + i;
        }.bind(this));
        
        idb.update(id, 'phrases', this.phrases, 'texts', function() {
          if (typeof callback === 'function') {
            callback(this);
          }
        }.bind(this));
        
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