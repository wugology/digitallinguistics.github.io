// idb = IndexedDB - contains all the functions relevant to working with IndexedDB
var idb = {
  // Adds an array of objects to the specified object store (table). Example usage:
    // idb.add( [ text1, text2 ], 'texts'); <-- This adds the objects 'text1' and 'text2' to the 'texts' table
  add: function(array, objectStore) {
    var transaction = idb.database.transaction(objectStore, 'readwrite');
    var objectStore = transaction.objectStore(objectStore);
    array.forEach(function(item) {
      var request = objectStore.add(item);
    });
  },
  
  // Creates a new Wugbot database if none is detected, and populates the objectStores (tables)
  create: function() {
    var corporaObjectStore = idb.database.createObjectStore('corpora', { keyPath: 'id', autoIncrement: true });
    var languagesObjectStore = idb.database.createObjectStore('languages', { keyPath: 'id', autoIncrement: true });
    var lexiconsObjectStore = idb.database.createObjectStore('lexicons', { keyPath: 'id', autoIncrement: true });
    var mediaFilesObjectStore = idb.database.createObjectStore('mediaFiles', { keyPath: 'id', autoIncrement: true });
    var textsObjectStore = idb.database.createObjectStore('texts', { keyPath: 'id', autoIncrement: true });
  },
  
  // Opens the Wugbot database (and creates it if it doesn't yet exist)
  open: function() {
    var request = window.indexedDB.open('Wugbot', 1);

    request.onsuccess = function() {
      idb.database = request.result;
    };
    
    request.onupgradeneeded = function() {
      idb.database = request.result;
      idb.create();
    };
  },
  
  // Deletes the specified array of objects from the specified object store
  remove: function(objects, objectStore) {
    var transaction = idb.database.transaction(objectStore, 'readwrite');
    var objectStore = transaction.objectStore(objectStore);
    objects.forEach(function(object) {
      var request = objectStore.delete(object.id);
    });
  },
  
  // Deletes the entire Wugbot database
  deleteDatabase: function() {
    var request = window.indexedDB.deleteDatabase('Wugbot');
    request.onsuccess = function() {
      console.log('Database deleted.');
    };
  }
};

idb.database = {};

idb.database.onerror = function(ev) {
  alert('Database error: ' + ev.target.errorCode);
};

idb.open();