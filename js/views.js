// VIEWS

// ITEM VIEWS
// The model for an item view is a single item (rather than an array of items)
var TextView = function(model, options) {
  View.call(this, model, options);
};

var PhraseView = function(model, options) {
  View.call(this, model, options);
};

var WordView = function(model, options) {
  View.call(this, model, options);
};

var MorphemeView = function(model, options) {
  View.call(this, model, options);
};


// COLLECTION VIEWS
// The model for a collection view is an array of items (rather than a single item)
var TextsView = function(model, options) {
  View.call(this, model, options);
};

var PhrasesView = function(model, options) {
  View.call(this, model, options);
};

var WordsView = function(model, options) {
  View.call(this, model, options);
};

var MorphemesView = function(model, options) {
  View.call(this, model, options);
};