// CORE
// - Base functions & objects
// - Event system
// - Base model
// - Base view & collection


// BASE FUNCTIONS & OBJECTS
// Adds all the enumerable keys of one object (the source) to another (the destination)
var augment = function(destination, source) {
  Object.keys(source).forEach(function(key) {
    destination[key] = source[key];
  });
  
  return destination;
};

// A global Breadcrumb object that handles functions relating to breadcrumbs
var Breadcrumb = {
  create: function(text, phrase, word, morpheme) {
    var breadcrumb = Array.prototype.slice
      .call(arguments)
      .join('_');
    return breadcrumb;
  },
  
  get: function(breadcrumb) {
    var indexes = this.parse(breadcrumb);
    
    var retrieval = function(text) {
      if (!indexes.phrase) {
        return text;
      } else if (!indexes.word) {
        return text.phrases[indexes.phrase];
      } else if (!indexes.morpheme) {
        return text.phrases[indexes.phrase].words[indexes.word];
      } else {
        return text.phrases[indexes.phrase].words[indexes.word].morphemes[indexes.morpheme];
      }
    };
    
    idb.get(indexes.text, 'texts', retrieval);
  },
  
  parse: function(breadcrumb) {
    var nums = breadcrumb.split('_');
    var convert = function(i) { return Number(nums[i]) || null; };
    var indexes = {
      text: convert(0),
      phrase: convert(1),
      word: convert(2),
      morpheme: convert(3)
    };
    return indexes;
  }
};


// EVENT SYSTEM
var ObserverList = function() {
  Object.defineProperties(this, {
    "observers": {
      value: [],
      writable: true
    },
    
    "notify": {
      value: function(action, data) {
        var subs = this.observers.filter(function(sub) {
          return sub.action == action;
        });

        this.observers.forEach(function(sub) {
          sub.observer.update(sub.action, data);
        });
      }.bind(this)
    },
    
    "update": {
      value: function(action, data) {
        console.log('No update function has been set for this object yet.');
        // Overwrite this function with an update function specific to the model, view, or collection
      },
      writable: true
    }
  });
  
  Object.defineProperties(this.observers, {
    "add": {
      value: function(observer, action) {
        var sub = {
          action: action,
          observer: observer
        };
        
        this.observers.push(sub);
      }.bind(this)
    },
    
    "remove": {
      value: function(observer, action) {
        this.observers.forEach(function(sub, i, arr) {
          if (sub.observer == observer && sub.action == action) {
            arr.splice(i, 1);
          }
        });
      }.bind(this)
    }
  });
};


// BASE MODEL
var Model = function(data) {
  ObserverList.call(this);
  
  augment(this, data);
  
  Object.defineProperties(this, {
    "json": {
      get: function() {
        return JSON.stringify(this);
      }
    },
    
    "search": {
      // This is a generic search function that can be overwritten on a model-specific basis
      value: function(searchTerm) {
        var results = [];
        
        Object.keys(this).forEach(function(key) {
          if (typeof this[key] == 'string' && this[key].includes(searchTerm)) {
            results.push(this[key]);
          }
        }, this);
        
        return results;
      }.bind(this),
      writable: true
    }
  });
};


// BASE VIEW
// This view is the prototype for both item and collection views
var View = function(model, options) {
  ObserverList.call(this);
  
  this.model = model;
  
  this.el = options.el;
  
  // Displays a DOM element that was previously hidden
  // The optional media argument specifies whether you would only like to display the element on desktop or mobile
  this.display = function(media) {
    if (media !== 'mobile') {
      this.el.classList.remove('hideonDesktop');
    }
    if (media !== 'desktop') {
      this.el.classList.remove('hideonMobile');
    }
  };
  
    // Hides a DOM element, and content reflows to fill that empty space
  // The optional media argument specifies whether you would only like to hide the element on desktop or mobile
  this.hide = function(media) {
    if (media !== 'mobile') {
      this.el.classList.add('hideonDesktop');
    }
    
    if (media !== 'desktop') {
      this.el.classList.add('hideonMobile');
    }
  };

  // Hides the element if it is currently displayed, and displays the element if it is currently hidden
  this.toggleDisplay = function() {
    this.el.classList.toggle('hideonMobile');
    this.el.classList.toggle('hideonDesktop');
  };
};