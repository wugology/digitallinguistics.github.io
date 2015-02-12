app = {};

/* TODO 
   ulitimately we would like our views, models, and collections 
   to subclass general classes. for now, hardcoding them.
*/

app.Word = function(attributes, options){

}

app.Words = function(models, options){
  this.models = models; // this is the actual array of strings: words

  this.initialize = function(options){

  }

  this.sort = function(attr){
    this.models.sort(function(a,b){
      return function(a,b){
        return b[attr] - a[attr];
      }
    });
  }

  this.add = function(word){
    this.models.push(word);
    this.models.sort(comparator);
  }.bind(this); // tell our function not to reset `this`

  this.count = function(){
    return this.models.length;
  }.bind(this);
}

app.Phrase = function(attributes, options){
  this.transcription = options.transcription || '';
  this.translations = options.translations || '';
  this.words = options.words || new app.Words([], {}); 
}

app.Phrases = function(models, options){

}

app.Text = function(attributes, options){

}

app.Texts = function(models, options){

}

app.Corpus = function(attributes, options){

}


/* initialize */


