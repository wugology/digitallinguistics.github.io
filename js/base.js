// Singular 
var Model = function(attributes, options){

  this.attributes = attributes;

  this.toJSON = function(){ 
    return this.attributes;
  }

}

// a view of a single model
var ModelView = function(options){
  this.el = options.el || document.createElement('div');
  this.model = options.model;
  this.templateSelector = options.templateSelector;

  this.render = function(){ 
    var node = template(this.templateSelector, this.model.attributes);
    this.el.appendChild(node) ;
    return this;
  }
}

// a collection of models
var Collection = function(options){
  this.models = options.models.map(function(m){
    return new Model(m)
  })

  this.pluck = function(attr){
    return this.models.map(function(m){
      return m.attributes[attr]
    })
  }
}

// a view which renders a collection
var CollectionView = function(options){
  this.el = options.el || document.createElement('div');
  this.el.classList.add('collectionView');
  this.collection = options.collection;
  this.events = options.events || {};

  this.templateSelector = options.templateSelector;
  this.modelView = options.modelView;
  this.items = {};

  this.render = function(){
    var fragment = document.createDocumentFragment();
    this.collection.models.forEach(function(model, collectionID){

      var item = new ModelView({
        model: model,
        el: document.createElement('p'),
        templateSelector: this.templateSelector
      });

      var collectionID = 'c' + collectionID;
      this.items[collectionID] = item;
      var el = item.render().el;
      el.collectionID = collectionID;

      Object
        .keys(this.events)
        .forEach(function(name){
           this.el.addEventListener(name, this.events[name])
        }, this)

      fragment.appendChild(el);

    }, this) 

    this.el.appendChild(fragment);
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

var PhraseView = function(){
  ModelView.apply(this, arguments);
}
PhraseView.prototype = Object.create(ModelView.prototype);

var Phrases = function(){
  Collection.apply(this, arguments);
}
Phrases.prototype = Object.create(Model.prototype);

var PhrasesView = function(){
  CollectionView.apply(this, arguments);
}
PhraseView.prototype = Object.create(CollectionView.prototype);
