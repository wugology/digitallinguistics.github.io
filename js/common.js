/* Functions used throughout the app that aren't part of domain-specific objects */
var Template = function(selector){
  var templateNode = document.querySelector(selector);
  if(!templateNode){
    throw new Error('Template selector unknown: ' + selector);
  }
  var newNode = templateNode.content.cloneNode(true);

  this.template = function(data){
    Object.keys(data)
      .forEach(function(key){
        var match = node.querySelector('.' + key);
        if(match){ match.textContent = data[key] }
      })

    return newNode; 
  }
}

function template(selector, data){
  var 
    t = new Template(selector),
    rendered = t.template(data);

  return rendered;
}



/* Polyfills */

// Polyfill for the .startsWith() string method ( String.prototype.startsWith() )
// See MDN for more details:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
if (!String.prototype.startsWith) {
  Object.defineProperty(String.prototype, 'startsWith', {
    enumerable: false,
    configurable: false,
    writable: false,
    value: function(searchString, position) {
      position = position || 0;
      return this.lastIndexOf(searchString, position) === position;
    }
  });
}
