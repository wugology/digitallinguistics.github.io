/* functions used throughout the app that aren't part of domain-specific objects */

var hydrate = function(selector, data){
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


