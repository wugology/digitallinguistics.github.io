// CORE
// Core functionality on which the rest of the app functionality depends


// BASE FUNCTIONS
// DOM selector - returns a single node or an array of nodes (not a node list)
var $ = function(selector) {
  var
    nodeList = document.querySelectorAll(selector),
    nodes = Array.prototype.slice.call(nodeList);
    
  var selected = nodes.length == 1 ? nodes[0] : nodes;
  return selected;
}.bind(document);

// Adds all the enumerable keys of one object (the source) to another (the destination)
var augment = function(destination, source) {
  Object.keys(source).forEach(function(key) {
    destination[key] = source[key];
  });
  
  return destination;
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
        // Overwrite this function with model- or view-specific update functions
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
// General model methods:
// - search
// - event system mixin
// - json
// - breadcrumb

// Base View



var input = $('#toolbar input')[0];

ObserverList.call(input);

var Observer = function() {
  ObserverList.call(this);
};

var observer = new Observer();

input.observers.add(observer, 'typing');

input.observers.add(observer, 'keyup');

input.addEventListener('input', function(ev) {
  var value = ev.target.value;
  input.notify('typing', value);
});

observer.update = function(action, data) {
  if (action == 'typing') {
    console.log(data);
  }
};