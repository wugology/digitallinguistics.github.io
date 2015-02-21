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
  
  // Creates a new Wugbot database and its objectStores (tables)
  create: function() {
    var defaults = { keyPath: 'id', autoIncrement: true };
    var objectStores = [
      'corpora',
      'languages',
      'lexicons',
      'mediaFiles',
      'texts'
    ];
    
    objectStores.forEach(function(objectStore) {
      idb.database.createObjectStore(objectStore, defaults);
    });
  },
  
  // Takes an array of object IDs and returns an array of the objects with those IDs from the specified object store database
  get: function(ids, objectStore, successCallback) {
    var records = [];
    ids.forEach(function(id) {
      idb.database.transaction(objectStore).objectStore(objectStore).get(id).onsuccess = function(ev) {
        records.push(ev.target.result);
        if (typeof successCallback === 'function') {
          successCallback(records);
        }
      };
    });
    return records;
  },
  
  // Returns an array of every object in the specified object store
  // Mozilla actually has a .getAll() function, but Chrome does not
  getAll: function(objectStore, successCallback) {
    var records = [];
    idb.database.transaction(objectStore).objectStore(objectStore).openCursor().onsuccess = function(ev) {
      var cursor = ev.target.result;
      if (cursor) {
        records.push(cursor.value);
        cursor.continue();
      } else {
        if (typeof successCallback === 'function') {
          successCallback(records);
        }
      }
    };
    return records;
  },
  
  // Opens the Wugbot database (and creates it if it doesn't yet exist)
  open: function(successCallback) {
    var request = window.indexedDB.open('Wugbot', 1);

    request.onsuccess = function() {
      idb.database = this.result;
      successCallback();
    };
        
    request.onupgradeneeded = function() {
      idb.database = this.result;
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