// VIEWS

// ITEM VIEWS
// The model for an item view is a single item (rather than an array of items)
var TextView = function(model, options) {
  View.call(this, model, options);
};

var PhraseView = function(model, options) {
  View.call(this, model, options);
  
  this.render = function(wrapper, options) {
    this.template.content.querySelector('.phrase').dataset.breadcrumb = model.breadcrumb;
    var contentWrapper = this.template.content.querySelector('.wrapper');
    
    if (model.transcripts) { model.transcripts.render(contentWrapper); }
    
    if (model.transcriptions) { model.transcriptions.render(contentWrapper); }
    
    if (model.translations) { model.translations.render(contentWrapper); }
    
    if (model.notes) { model.notes.render(contentWrapper); }
    
    var phrase = this.template.content.cloneNode(true);
    wrapper.appendChild(phrase);
    
    this.el = phrase;
  };
};

var WordView = function(model, options) {
  View.call(this, model, options);
};

var MorphemeView = function(model, options) {
  View.call(this, model, options);
};

var RepView = RepresentationView = function(model, options) {
  View.call(this, model, options);
  
  this.render = function(wrapper, options) {
    var p = createElement('p', {
      textContent: model.text
    });
    p.classList.add('unicode');
    
    wrapper.appendChild(p);
    
    this.el = p;
  };
};


// COLLECTION VIEWS
// The model for a collection view is an array of items (rather than a single item)
var TextsView = function(collection, options) {
  View.call(this, collection, options);
};

var PhrasesView = function(collection, options) {
  View.call(this, collection, options);
};

var TranscriptsView = function(collection, options) {
  View.call(this, collection, options);
  
  this.render = function(wrapper, options) {
    collection.forEach(function(transcript) {
      var r = new RepView(transcript);
      r.render(wrapper);
    }, this);
  };
};

var TranscriptionsView = function(collection, options) {
  View.call(this, collection, options);
  
  this.render = function(wrapper, options) {
    collection.forEach(function(transcription) {
      var r = new RepView(transcription);
      r.render(wrapper);
    }, this);
  };
};

var TranslationsView = function(collection, options) {
  View.call(this, collection, options);
  
  this.render = function(wrapper, options) {
    collection.forEach(function(translation) {
      var r = new RepView(translation);
      r.render(wrapper);
    }, this);
  };
};

var NotesView = function(collection, options) {
  View.call(this, collection, options);
  
  this.render = function(wrapper, options) {
    collection.forEach(function(note) {
      var r = new RepView(note);
      r.render(wrapper);
    }, this);  
  };
};

var WordsView = function(collection, options) {
  View.call(this, collection, options);
};

var MorphemesView = function(collection, options) {
  View.call(this, collection, options);
};