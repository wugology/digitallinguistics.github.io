// Singular 
var Model = function(attributes, options){
  Object
    .keys(attributes)
    .forEach(function(key){
      this[key] = attributes[key]
    }, this)
}

var ModelView = function(model, options){
  this.el = options.el || document.createElement('div');
  this.model = model;
  this.render = options.render;
}

// plural

var Collection = function(models, options){
  this.models = models || [];

  this.forEach = function(fn){
    this.models.forEach(fn);
  }
}

var CollectionView = function(collection, options){
  this.el = options.el || document.createElement('div');
  this.collection = collection;

  this.render = function(){
    var fragment = document.createDocumentFragment();
    this.collection.forEach(function(model){
      var modelView = new ModelView(model, {});
      fragment.appendChild(modelView);
    }) 
    return fragment;
  }.bind(this);
}

// linguistics

var Word = function(){
  Model.apply(this, arguments);
  Object.defineProperty(this, 'phonemes', { 
    enumerable: false,
    get: function(){ return this.token.split('') }
  })
}
Word.prototype = Object.create(Model.prototype);

var WordView = function(){
  ModelView.apply(this, arguments);
}
WordView.prototype = Object.create(ModelView.prototype);

var Phrase = function(){
  Model.apply(this, arguments);
  Object
    .defineProperty(this, 'tokens',{
      get : function(){ return this.transcription.split(" ") }
    })
}
Phrase.prototype = Object.create(Model.prototype);

