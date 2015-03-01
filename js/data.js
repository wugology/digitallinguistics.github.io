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
var Corpus = function(data, callback) {
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

  var setID = function(id) {
    Object.defineProperty(this, 'id', {
      enumerable: true,
      value: id
    });
    
    if (typeof callback === 'function') {
      callback();
    }
  };
  
  idb.add([this], 'texts', setID);
  
  return this;
};

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
  
  return this;
};

var Text = function(data, callback) {
  for (key in data) {
    this[key] = data[key];
  }
  
  Object.defineProperty(this, 'model', {
    enumerable: true,
    value: 'Text'
  });

  var setID = function(id) {
    Object.defineProperty(corpus, 'id', {
      enumerable: true,
      value: id
    });
    
    if (typeof callback === 'function') {
      callback();
    }
  };
  
  idb.add([this], 'texts', setID);
  
  return this;
};

var Word = function() {};