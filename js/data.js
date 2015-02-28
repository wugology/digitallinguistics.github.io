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
};

// For now, the Corpus.create() method takes just one function, the name of the new corpus
// Takes an optional callback that has the new corpus as its argument
Corpus.create = function(name) {
  var corpus = new Corpus({
    name: name,
    documents: [],
    languages: [],
    lexicons: [],
    media: [],
    texts: []
  });
  
  var setID = function(id) {
    Object.defineProperty(corpus, 'id', {
      enumerable: true,
      value: id
    });
  };
  
  idb.add([corpus], 'corpora', setID);
  
  return corpus;
};

var Media = {
  add: function(file) {
    idb.add([file], 'media', views.workviews.media.render);
  }
};


var Phrase = function() {};

var Text = function() {};

var Word = function() {};