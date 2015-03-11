var Phrase = function(data) {
  Object.defineProperty(this, 'play', {
    value: function() {
      var textID = Number(this.breadcrumb.match(/text[0-9]+/)[0].replace('text', ''));
      
      var getMedia = function(text) {
        idb.get(text.media[0], 'media', getSrc);
      };
      
      var getSrc = function(file) {
        var url = URL.createObjectURL(file);
        var a = new Audio(url + '#t=' + this.startTime + ',' + this.endTime);
        a.play();
      }.bind(this);
      
      idb.get(textID, 'texts', getMedia);
      
    }
  });
  
  return this;
};

// A text should be initialized with the following properties, even if they are null or an empty array:
// - media files (array)
// - persons (array)
// - tags (array)
// - titles (array, with at least one title object)
// - phrases (array)
var Text = function(data, callback) {
  for (key in data) {
    this[key] = data[key];
  }
  
  Object.defineProperty(this, 'model', {
    enumerable: true,
    value: 'Text'
  });
  
  Object.defineProperty(this, 'addToDatabase', {
    value: function(callback) {
      var setID = function(id) {
        Object.defineProperty(this, 'id', {
          enumerable: true,
          value: id
        });
        
        this.phrases.forEach(function(phrase, i) {
          phrase.breadcrumb = 'text' + this.id + '_phrase' + i;
        }.bind(this));
        
        idb.update(id, 'phrases', this.phrases, 'texts', function() {
          if (typeof callback === 'function') {
            callback(this);
          }
        }.bind(this));
        
      }.bind(this);
      
      idb.add([this], 'texts', setID);
    }
  });
  
  Object.defineProperty(this, 'delete', {
    value: function(callback) {
      idb.remove(this, 'texts', callback);
    }
  });
  
  Object.defineProperty(this, 'display', {
    value: function() {
      views.workviews.texts.displayText(this);
    }
  });
  
  Object.defineProperty(this, 'setAsCurrent', {
    value: function() {
      app.preferences.currentText = this;
    }
  });
  
  return this;
}.bind(this);