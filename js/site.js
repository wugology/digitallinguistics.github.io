// General site-wide Javascript, and some polyfills

//POLYFILLS
// Polyfill for the String.prototype.startsWith() function
// MDN says it's supported in Chrome and Firefox, but it doesn't seem to be working in Chrome
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