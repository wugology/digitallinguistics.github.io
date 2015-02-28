// app.js
var app = {};

app.createOption = function(id, text, value, selector) {
  var option = document.createElement('option');
  option.dataset.id = id;
  option.value = value;
  option.textContent = text;
  document.querySelector(selector).add(option);
}

// Constructors for linguistic/database objects
app.constructors = {
  Corpus: function(name, documents, languages, lexicons, media, texts) {
    // Populates corpus properties
    this.name = name;
    this.documents = documents;
    this.languages = languages;
    this.lexicons = lexicons;
    this.media = media;
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
      value: function(successCallback) {
        var setID = function(indexes) {
          Object.defineProperty(this, 'id', {
            enumerable: true,
            value: indexes[0]
          });
          if (typeof successCallback === 'function') {
            successCallback();
          }
        }.bind(this);
        idb.add([ this.toJSON() ], 'corpora', setID);
      }
    });

    // Makes this corpus the current corpus
    Object.defineProperty(this, 'setAsCurrent', {
      value: function(callback) {
        app.preferences.currentCorpus = this;
        if (typeof callback === 'function') {
          callback();
        }
      }
    });
  },
  
  Phrase: function(
    speaker,
    startTime,
    endTime,
    transcriptions,
    transcripts,
    translations,
    tags,
    notes,
    words
  ) {
    this.speaker = speaker;
    this.startTime = startTime;
    this.endTime = endTime;
    this.transcriptions = transcriptions;
    this.transcripts = transcripts;
    this.translations = translations;
    this.tags = tags;
    this.notes = notes;
    this.words = words;
    
    Object.defineProperty(this, 'model', {
      enumerable: true,
      value: 'Phrase'
    });
    
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
    
    Object.defineProperty(this, 'display', {
      // The index argument will always be one of two things: the index of the phrase in the text's phrases array, or
      // the index of the phrase in the search results / list of phrases being rendered
      value: function(wrapper, index) {
        var template = document.querySelector('#phraseTemplate');
        template.content.querySelector('.phrase').id = 'phrase_' + index;
        template.content.querySelector('.phrase').dataset.index = index;
        template.content.querySelector('.play').dataset.startTime = this.startTime;
        template.content.querySelector('.play').dataset.endTime = this.endTime;
        template.content.querySelector('.transcript').textContent = this.transcripts[0].transcriptText;
        template.content.querySelector('.phonemicTranscription').textContent = this.transcriptions[0].transcriptionText;
        template.content.querySelector('.phoneticTranscription').textContent = this.transcriptions[1].transcriptionText;
        template.content.querySelector('.translation').textContent = this.translations[0].translationText;
        template.content.querySelector('.notes').textContent = this.notes;
        var phrase = template.content.cloneNode(true);
        wrapper.appendChild(phrase);
      }
    });
    
    Object.defineProperty(this, 'play', {
      value: function() {
        app.audio.playSegment(this.startTime, this.endTime);
      }
    });
  },

  Text: function(media, phrases, persons, tags, titles) {
    // Populates text properties
    this.media = media;
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
      value: function(corpusID, callback) {
        idb.pushUpdate(corpusID, 'texts', this.id, 'corpora', callback);
      }
    });

    // Adds a JSON-only version of this text to the database and sets the ID for this text based on its database index
    // This function is NOT run automatically - remember to run it when you create a new text
    Object.defineProperty(this, 'addToTexts', {
      value: function(callback) {
        var setID = function(indexes) {
          Object.defineProperty(this, 'id', {
            enumerable: true,
            value: indexes[0]
          });

          if (typeof callback === 'function') {
            callback();
          }
        }.bind(this);
        
        var textID = idb.add([ this.toJSON() ], 'texts', setID);
        
      }
    });

    Object.defineProperty(this, 'display', {
      value: function() {
        page.nodes.textTitles = document.querySelector('#detailsPane .titles');
        page.nodes.phrases = document.querySelector('#detailsPane .phrases');
        page.nodes.phrases.innerHTML = '';
        
        var addBlurListener = function(node) {
          node.addEventListener('blur', function(ev) {
            idb.update(app.preferences.currentText.id, 'titles', app.preferences.currentText.titles, 'texts', page.views.texts.displayTextsList);
          });
        };

        var makePlaceholder = function() {
          var node = document.createElement('input');
          node.dataset.titleIndex = 0;
          node.classList.add('unicode');
          node.classList.add('textTitle');
          node.value = 'Click here to enter a title for this text';
          page.nodes.textTitles.appendChild(node);
          addBlurListener(node);
        };
        
        page.nodes.textTitles.innerHTML = '';

        if (this.titles.length === 0) {
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
            addBlurListener(node);
          }
        });
        
        this.media.forEach(function(id) {
          var displayAudio = function(file) {
            var player = document.createElement('audio');
            player.controls = true;
            player.dataset.id = id;
            player.src = URL.createObjectURL(file);
            var audioArea = document.querySelector('#textAudio')
            audioArea.innerHTML = '';
            audioArea.appendChild(player);
            player.addEventListener('timeupdate', function() {
              var player = document.querySelector('#textAudio audio');
              if (player.currentTime >= app.audio.endTime) {
                player.pause();
                app.audio.endTime = null;
              }
            });
          };
          
          idb.get(id, 'media', displayAudio);
        });
        
        this.phrases.forEach(function(phrase, i) {
          phrase.display(document.querySelector('.phrases'), i);
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

app.initialize = function() {
  if (localStorage.wugbotPreferences === 'undefined' || localStorage.wugbotPreferences === undefined) {
    app.preferences = {
      currentCorpus: null,
      currentPhrase: null,
      currentText: null,
      currentWorkview: 'texts'
    };
  } else {
    app.preferences = JSON.parse(localStorage.wugbotPreferences);
  }
  
  if (app.preferences.currentCorpus !== null) {
    app.preferences.currentCorpus = idb.reconstruct(app.preferences.currentCorpus);
    app.preferences.currentCorpus.setAsCurrent();
  }
  
  app.preferences.currentText = null;
  app.preferences.currentPhrase = null;
  
  if (app.preferences.currentWorkview !== null) {
    page.render(app.preferences.currentWorkview);
    
    if (app.preferences.currentCorpus === null) {
      page.popups.manageCorpora.render();
    }
  } else {
    page.render();
  }

  window.addEventListener('keydown', function(ev) {    
    if (app.preferences.currentWorkview === 'texts' && app.preferences.currentPhrase !== null) {
      if (ev.keyCode === 13) {
        ev.preventDefault();
        page.views.texts.nextPhrase();
      }
      
      if (ev.keyCode === 9) {
        ev.preventDefault();
        app.preferences.currentText.phrases[app.preferences.currentPhrase].play();
      }
    }
  });
};

app.audio = {
  startTime: 0,
  endTime: null,
  
  playSegment: function(startTime, endTime) {
    this.startTime = startTime;
    this.endTime = endTime;
    // This only plays segments from the first audio file in the collection for now
    var player = document.querySelector('#textAudio audio');
    player.currentTime = startTime;
    player.play();
  }
};

app.savePreferences = function() {
  localStorage.wugbotPreferences = JSON.stringify(app.preferences, null, 2);
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
