/* functions used throughout the app that aren't part of domain-specific objects */

/*
var template = function(selector, data){
  var 
    templateNode = document.querySelector(selector),
    node = document.importNode(templateNode.content, true);

  Object.keys(data)
    .forEach(function(key){
      var match = node.querySelector('.' + key);
      if(match){ match.textContent = data[key] }
    })

  return node; 
}
*/


var Template = function(selector){
  var templateNode = document.querySelector(selector);
  if(!templateNode){
    throw new Error('Template selector unknown: ' + selector);
  }
  var node = document.importNode(templateNode.content, true);

  this.template = function(data){
    Object.keys(data)
      .forEach(function(key){
        var match = node.querySelector('.' + key);
        if(match){ match.textContent = data[key] }
      })

    return node; 
  }
}

function template(selector, data){
  var 
    t = new Template(selector),
    rendered = t.template(data);

  return rendered;
}
