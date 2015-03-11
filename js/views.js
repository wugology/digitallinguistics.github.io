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
    
    // Populate phrase data here
    
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