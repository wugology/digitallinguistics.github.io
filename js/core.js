// CORE
// Core functionality on which the rest of the app functionality depends


// Base Functions
// DOM selector
var $ = function(selector) {
  var
    nodeList = document.querySelectorAll(selector),
    nodes = Array.prototype.slice.call(nodeList);
    
  var selected = nodes.length == 1 ? nodes[0] : nodes;
  return selected;
}.bind(document);

var augment = function(destination, source) {
  Object.keys(source).forEach(function(key) {
    destination[key] = source[key];
  });
  
  return destination;
};


// Event System
var ObserverList = function() {
  this.observers = [];
  
  this.observers.add = function(observer, action) {
    var sub = {
      action: action,
      observer: observer
    };
    
    this.observers.push(sub);
  };
  
  this.observers.remove = function(observer, action) {
    this.observers.forEach(function(sub, i, arr) {
      if (sub.observer == observer && sub.action == action) {
        arr.splice(i, 1);
      }
    });
  };
  
  this.notify = function(action, data) {
    var subs = this.observers.filter(function(sub) {
      return sub.action == action;
    });
    
    this.subs.forEach(funtion(sub) {
      sub.observer.update(sub.action, data);
    });
  };
};




// Base Model
// General model methods:
// - search
// - event system mixin
// - json
// - breadcrumb

// Base View