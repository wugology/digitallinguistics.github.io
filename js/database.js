// idb = IndexedDB - contains all the functions relevant to working with IndexedDB
var idb = {
  // Adds an array of objects to the specified object store (table). Example usage:
  // idb.add( [ text1, text2 ], 'texts'); <-- This adds the objects 'text1' and 'text2' to the 'texts' table
  // Takes an optional callback function which fires after the data has been added to the database
  // Returns an array of indexes of the added objects
  add: function(array, objectStore, callback) {
    var transaction = idb.database.transaction(objectStore, 'readwrite');
    var objectStore = transaction.objectStore(objectStore);
    var indexes = [];
    array.forEach(function(item) {
      var request = objectStore.add(item);
      request.onsuccess = function(ev) {
        indexes.push(request.result);
        if (typeof callback === 'function') {
          callback(indexes);
        }
      }
    });
    return indexes;
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

  // Deletes the entire Wugbot database
  deleteDatabase: function() {
    var request = window.indexedDB.deleteDatabase('Wugbot');
    request.onsuccess = function() {
      console.log('Database deleted.');
    };
    delete localStorage.wugbotPreferences;
    delete app.preferences;
  },
  
  // Takes a single ID for an object and returns that object from the database
  // Accepts a callback function which takes the returned object as its argument
  get: function(id, objectStore, successCallback) {
    var objectStore = idb.database.transaction(objectStore).objectStore(objectStore);
    var request = objectStore.get(id);
    request.onsuccess = function(ev) {
      app.preferences.currentCorpus = ev.target.result;
      if (typeof successCallback === 'function') {
        successCallback(ev.target.result);
      }
    };    
  },
  
  // Returns an array of every object in the specified object store
  // Mozilla actually has a .getAll() function, but Chrome does not
  // Also takes an optional callback function which takes the array of retrieved objects as its argument, and will execute when the .getAll() operation is successful
  getAll: function(objectStore, successCallback) {
    var records = [];
    var objectStore = idb.database.transaction(objectStore).objectStore(objectStore);
    objectStore.openCursor().onsuccess = function(ev) {
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
  // Also takes an optional callback function which will fire once the database is opened
  open: function(successCallback) {
    var request = window.indexedDB.open('Wugbot', 1);

    request.onsuccess = function() {
      idb.database = this.result;
      if (typeof successCallback === 'function') {
        successCallback();
      }
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
  
  // Updates a single property within a single record
  update: function(id, property, newValue, objectStore) {
    var objectStore = idb.database.transaction(objectStore, 'readwrite').objectStore(objectStore);
    var request = objectStore.get(id);
    
    request.onsuccess = function(ev) {
      var data = request.result;
      data[property] = newValue;
      
      var requestUpdate = objectStore.put(data);
    };
  },
};

idb.database = {};

idb.database.onerror = function(ev) {
  alert('Database error: ' + ev.target.errorCode);
};