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
    
    Object.keys(this.model.transcripts).forEach(function(ortho) {
      var p = createElement('p', { textContent: this.model.transcripts[ortho] });
      contentWrapper.appendChild(p);
    });
    
    Object.keys(this.model.transcriptions).forEach(function(ortho) {
      var p = createElement('p', { textContent: this.model.transcriptions[ortho] });
      contentWrapper.appendChild(p);
    });
    
    Object.keys(this.model.notes).forEach(function(ortho) {
      var p = createElement('p', { textContent: this.model.notes[ortho] });
      contentWrapper.appendChild(p);
    });
    
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


// COLLECTION VIEWS
// The model for a collection view is an array of items (rather than a single item)
var TextsView = function(collection, options) {
  View.call(this, collection, options);
};

var PhrasesView = function(collection, options) {
  View.call(this, collection, options);
};

var WordsView = function(collection, options) {
  View.call(this, collection, options);
};

var MorphemesView = function(collection, options) {
  View.call(this, collection, options);
};