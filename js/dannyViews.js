// VIEWS

// VIEWS HELPERS
function renderTextContent(textHash, wrapper) {
  Object.keys(textHash).forEach(function(ortho) {
    var p = createElement('p', { textContent: textHash[ortho] });
    p.classList.add('unicode');
    wrapper.appendChild(p);
  });
};

// ITEM VIEWS
// The model for an item view is a single item (rather than an array of items)
var TextView = function(model, options) {
  View.call(this, model, options);
};

var PhraseView = function(model, options) {
  View.call(this, model, options);
  
  this.template = $('#phraseTemplate');
  
  this.render = function(wrapper, options) {
    var pv = this.template.content.cloneNode(true);
    pv.querySelector('.phrase').dataset.breadcrumb = model.breadcrumb;
    var contentWrapper = pv.querySelector('.wrapper');
    
    renderTextContent(this.model.transcripts, contentWrapper);
    renderTextContent(this.model.transcriptions, contentWrapper);
    renderTextContent(this.model.translations, contentWrapper);
    renderTextContent(this.model.notes, contentWrapper);
    
    wrapper.appendChild(pv);
    
    this.el = pv;
  }.bind(this);
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