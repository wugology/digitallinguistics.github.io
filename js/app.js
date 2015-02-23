// app.js
var app = {};

// Polyfill for the .startsWith() string method ( String.prototype.startsWith() )
// See MDN for more details:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith?redirectlocale=en-US&redirectslug=JavaScript%2FReference%2FGlobal_Objects%2FString%2FstartsWith
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

// Constructors for linguistic/database objects
app.constructors = {
  Corpus: function(name, documents, languages, lexicons, mediaFiles, texts) {
    // Populates corpus properties
    this.name = name;
    this.documents = documents;
    this.languages = languages;
    this.lexicons = lexicons;
    this.mediaFiles = mediaFiles;
    this.texts = texts;
    Object.defineProperty(this, 'model', {
      enumerable: true,
      value: 'Corpus'
    });

    // Creates a JSON-only object for storage in IndexedDB (methods will need to be added upon retrieval)
    Object.defineProperty(this, 'toJSON', {
      value: function() {
        var jsonObj = {};
        var keys = Object.keys(this);
        keys.forEach(function(key) {
          jsonObj[key] = this[key];
        }.bind(this));
        return jsonObj;
      }
    });

    // Adds a JSON-only version of this corpus to the database and sets the ID for this corpus based on its database index
    // This function is NOT called automatically - remember to run it when you create a new Corpus
    Object.defineProperty(this, 'addToCorpora', {
      value: function() {
        var setID = function(indexes) {
          Object.defineProperty(this, 'id', {
            enumerable: true,
            value: indexes[0]
          });
        }.bind(this);
        idb.add([ this.toJSON() ], 'corpora', setID);
      }
    });

    // Makes this corpus the current corpus
    Object.defineProperty(this, 'setAsCurrent', {
      value: function() {
        app.preferences.currentCorpus = this;
      }
    });
  },

  Text: function(mediaFiles, phrases, persons, tags, titles) {
    // Populates text properties
    this.mediaFiles = mediaFiles;
    this.phrases = phrases;
    this.persons = persons;
    this.tags = tags;
    this.titles = titles;
    Object.defineProperty(this, 'model', {
      enumerable: true,
      value: 'Text'
    });

    // Creates a JSON-only object for storage in IndexedDB (methods will need to be added upon retrieval)
    Object.defineProperty(this, 'toJSON', {
      value: function() {
        var jsonObj = {};
        var keys = Object.keys(this);
        keys.forEach(function(key) {
          jsonObj[key] = this[key];
        }.bind(this));
        return jsonObj;
      }
    });

    // Adds this text to the specified corpus in the database and returns the ID of that corpus
    Object.defineProperty(this, 'addToCorpus', {
      value: function(corpusID) {
        idb.pushUpdate(corpusID, 'texts', this.id, 'corpora');
      }
    });

    // Adds a JSON-only version of this text to the database and sets the ID for this text based on its database index
    // This function is NOT run automatically - remember to run it when you create a new text
    Object.defineProperty(this, 'addToTexts', {
      value: function() {
        var setID = function(indexes) {
          Object.defineProperty(this, 'id', {
            enumerable: true,
            value: indexes[0]
          });
        }.bind(this);
        var textID = idb.add([ this.toJSON() ], 'texts', setID);
      }
    });

    Object.defineProperty(this, 'display', {
      value: function() {
        page.nodes.textTitles = document.querySelector('#detailsPane .titles');
        page.nodes.phrases = document.querySelector('#detailsPane .phrases');

        var makePlaceholder = function(i) {
          var node = document.createElement('input');
          node.dataset.titleIndex = i;
          node.classList.add('unicode');
          node.classList.add('textTitle');
          node.value = 'Click here to enter a title for this text';
          page.nodes.textTitles.appendChild(node);
        };

        if (titles.length === 0) {
          makePlaceholder();
        }

        this.titles.forEach(function(title, i) {
          if (title.titleText === '') {
            makePlaceholder(i);
          } else {
            var node = document.createElement('input');
            node.dataset.titleIndex = i;
            node.classList.add('unicode');
            node.classList.add('textTitle');
            node.value = title.titleText;
            page.nodes.textTitles.appendChild(node);
          }
        });
      }
    });

    // Sets this text as the current text - does NOT display it; the .display() method must be called separately
    Object.defineProperty(this, 'setAsCurrent', {
      value: function() {
        app.preferences.currentText = this;
      }
    });
  }
};

// Gets the file from the file input, converts it from an ELAN tsv export format into a valid JSON format, and returns the JSON object
// In the future, it may be good to make this function sufficiently robust that it can handle all the various settings in the ELAN export popup
app.convert = function() {
  var file = document.querySelector('#fileUpload').files[0];
  if (file === undefined) {
    page.notify('Please select a file below.');
  } else {
    var phrases = [];
    var fileReader = new FileReader();
    fileReader.onload = function(ev) {
      var text = ev.target.result;

      text = text.trim();
      var lines = text.split(/\n/g);
      var header = lines[0].trim();
      var columnNames = header.split(/\t/g);
      columnNames.forEach(function(columnName, i) {
        columnName = columnName.startsWith('Begin Time') ? 'startTime' : columnName;
        columnName = columnName.startsWith('End Time') ? 'endTime' : columnName;
        columnName = columnName.startsWith('Duration') ? 'duration' : columnName;
        columnName = columnName.startsWith('Transcript') ? 'transcript' : columnName;
        columnName = columnName.startsWith('Notes') ? 'notes' : columnName;
        columnName = columnName.startsWith('Translation') ? 'translation' : columnName;
        columnName = columnName.startsWith('Transcription') ? 'transcription' : columnName;
        columnName = columnName.startsWith('Phonemic') ? 'phonemic' : columnName;
        columnName = columnName.startsWith('Phonetic') ? 'phonetic' : columnName;
        columnName = columnName.replace(/[^\S]/g, '');
        columnNames[i] = columnName;
      });
      var labelLine = function(line) {
        var values = line.trim().split(/\t/g);
        var phrase = {};
        columnNames.forEach(function(columnName, i) {
          values[i] = values[i] === undefined ? null : values[i];
          phrase[columnName] = values[i];
        });
        phrases.push(phrase);
      };
      lines.slice(1, lines.length).forEach(labelLine);
      
      phrases.forEach(function(phrase) {
        phrase.startTime = parseFloat(phrase.startTime);
        phrase.endTime = parseFloat(phrase.endTime);
        phrase.transcripts = [{ transcript: phrase.transcript }];
        phrase.translations = [{ type: 'free', translationText: phrase.translation, orthography: null }];
        phrase.transcriptions = [
          { type: 'phonemic', transcriptionText: phrase.phonemic, orthography: null },
          { type: 'phonetic', transcriptionText: phrase.phonetic, orthography: null }
        ];
        delete phrase.transcript;
        delete phrase.translation;
        delete phrase.phonemic;
        delete phrase.phonetic;
      });
      
      var text = new app.constructors.Text([], phrases, [], [], []);
      text.addToTexts();
    };
    fileReader.readAsText(file);
  }
};

// Some of these were breaking while I was working on other things, so I commented them out for now [DWH]
/*
app.p = new Phrase({
  transcription: 'me llamo wugbot',
  translation: 'call me wugbot'
});

app.pv = new PhraseView({
  el: document.querySelector('#phrases'),

  model : app.p,

  render: function(){
    var template = hydrate('#phraseTemplate', this.model);
    this.el.appendChild(template);
    return this;
  }
});

app.pp = new Phrases({
  models: [
    {
      transcription: 'me llamo wugbot',
      translation: 'Call me Wugbot.'
    },
    {
      transcription: 'estoy aqui para cortar árboles',
      translation: 'I’m here to cut down trees.'
    }
  ]
})

app.w = new Word(
  {
    token: 'casa',
    gloss: 'house'
  }
);

app.wv = new WordView({
  el: document.querySelector('#entries'),

  model : app.w,

  render: function(){
    var template = hydrate('#wordTemplate', this.model);
    this.el.appendChild(template);
    return this;
  }
});

app.pv = new PhraseView({
  el: document.querySelector('#phrases'),

  model : app.p,

  render: function(){
    var template = hydrate('#phraseTemplate', this.model);
    this.el.appendChild(template);
    return this;
  }
});

app.ppv = new PhrasesView({
  el: document.querySelector('#phrases'),

  collection : app.pp,
  modelView : PhraseView,

  markup : template('#phraseTemplate', this.model),

  render: function(){
    this.el.appendChild(this.markup);
    return this;
  }
});

app.wv.render();
app.pv.render();
app.ppv.render();
*/