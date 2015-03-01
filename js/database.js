// The API for IndexedDB
// These functions will be used primarily (perhaps exclusively) by the Models

var idb = {
  // Adds an array of objects to the specified table (object store)
  // Takes an optional callback function that will be applied to the index of each newly-stored object
  add: function(array, table, successCallback) {
    var transaction = idb.database.transaction(table, 'readwrite');
    
    transaction.oncomplete = function() {
      if (typeof successCallback === 'function') {
        successCallback(idb.results);
      }
    };
    
    var objectStore = transaction.objectStore(table);
    
    var add = function(item) {
      var request = objectStore.add(item);
      request.onsuccess = function() {
        if (typeof successCallback === 'function') {
          idb.results = request.result;
        }
      };
    };
    
    if (table === 'media') {
      for (var i=0; i<array.length; i++) {
        add(array[i]);
      }
    } else {
      array.forEach(function(item) {
        if (item.toJSON) {
          item = item.toJSON();
        }
        add(item);
      });
    }
  },
  
  // Creates the database
  createDatabase: function() {
    var defaults = { keyPath: 'id', autoIncrement: true };
    var objectStores = [
      'corpora',
      'languages',
      'lexicons',
      'texts'
    ];
    
    objectStores.forEach(function(objectStore) {
      idb.database.createObjectStore(objectStore, defaults);
    });
    
    idb.database.createObjectStore('media', { autoIncrement: true });
  },
  
  // Change this value to work with different databases
  currentDatabase: 'WugbotDev',
  
  // Deletes the specified database
  deleteDatabase: function(dbname, successCallback) {
    if (arguments.length === 0 || (arguments.length === 1 && typeof arguments[0] === 'function')) {
      console.log('Please specify a database to delete.');
    }
    
    if ((arguments.length === 1 && typeof arguments[0] === 'string') || arguments.length === 2) {      
      var request = window.indexedDB.deleteDatabase(dbname);
      request.onsuccess = function() {
        console.log('Database deleted.');
        
        if (typeof successCallback === 'function') {
          successCallback();
        }
      };
      
      delete localStorage.wugbotPreferences;
      delete app.preferences;
    }
  },
  
  // Gets an object from the specified table in the database, using the index provided
  // Requires a callback function that has the returned object as its argument
  get: function(id, table, successCallback) {
    var transaction = idb.database.transaction(table);
    
    transaction.oncomplete = function() {
      if (typeof successCallback === 'function') {
        successCallback(idb.results);
      }
    };
    
    var request = transaction.objectStore(table).get(id);
    
    request.onsuccess = function() {
      if (typeof successCallback === 'function') {
        if (table !== 'media') {
          idb.results = idb.reconstruct(request.result);
        } else {
          idb.results = request.result;
        }
      }
    };
  },
  
  // Retrieves an array of each object in te specified object store
  // Mozilla actually has a .getAll() function, but Chrome does not
  getAll: function(table, successCallback) {
    idb.results = [];
    var transaction = idb.database.transaction(table);
    
    transaction.oncomplete = function() {
      if (typeof successCallback === 'function') {
        successCallback(idb.results);
      }
    };
    
    var objectStore = transaction.objectStore(table);

    objectStore.openCursor().onsuccess = function(ev) {
      var results = [];
      var cursor = ev.target.result;
      if (cursor) {
        if (table !== 'media') {
          var result = {};
          result.index = cursor.key;
          result.value = idb.reconstruct(cursor.value);
          idb.results.push(result);
        } else {
          var result = {};
          result.index = cursor.key;
          result.value = cursor.value;
          idb.results.push(result);
        }
        cursor.continue();
      }
    };
  },
  
  // Takes an optional callback function that has the database object as its argument
  open: function(dbname, successCallback) {
    var request = window.indexedDB.open(dbname, 1);
    
    request.onsuccess = function() {
      idb.database = request.result;
      idb.onversionchange = function(ev) {
        ev.target.close;
      };
      
      if (typeof successCallback === 'function') {
        successCallback(idb.database);
      }
    };
    
    request.onupgradeneeded = function() {
      idb.database = request.result;
      idb.createDatabase();
    };
  },
  
  pushUpdate: function(id, property, objectToPush, table, successCallback) {
    var transaction = idb.database.transaction(table, 'readwrite');
    
    transaction.oncomplete = function() {
      if (typeof successCallback === 'function') {
        successCallback(idb.results);
      }
    };
    
    transaction.objectStore(table).get(id).onsuccess = function(ev) {
      var data = ev.target.result;
      data[property].push(objectToPush);
      
      var requestUpdate = objectStore.put(data);
      
      requestUpdate.onsuccess = function(ev) {
        idb.results = ev.target.result;
      };
    };
  },
  
  // Re-adds the methods that were removed from the object when it was added to the database
  // The 'model' argument is the name of the constructor which builds the object (e.g. 'Text', with initial Caps)
  reconstruct: function(object) {
    var newObject = new window[object.model]();
    var keys = Object.keys(object);
    
    keys.forEach(function(key) {
      newObject[key] = object[key];
    });
    
    if (newObject.model === 'Text') {
      newObject.phrases.forEach(function(phrase, i) {
        newObject.phrases[i] = idb.reconstruct(phrase);
      });
    }
    
    return newObject;
  },

  // Deletes the specified array of indexes from the specified object store
  // Takes an optional callback function that fires once the object is deleted
  remove: function(array, table, successCallback) {
    idb.results = [];
    
    var transaction = idb.database.transaction(table, 'readwrite');
    
    transaction.oncomplete = function() {
      if (typeof successCallback === 'function') {
        successCallback();
      }
    };
    
    var objectStore = transaction.objectStore(table);
    
    array.forEach(function(index) {
      var request = objectStore.delete(index);
      request.onsuccess = function() {
        idb.results.push(request.result);
      };
    });
  },
  
  // Stores the results of each database transaction. Mostly used for development and debugging.
  results: null,
  
  // Updates a single property within a single record (object)
  // Takes an optional callback function, which has the ID of the updated record as its argument
  update: function(id, property, newValue, table, successCallback) {
    var transaction = idb.database.transaction(table, 'readwrite');
    
    transaction.oncomplete = function() {
      if (typeof successCallback === 'function') {
        successCallback(ev.target.result);
      }
    };
    
    var objectStore = transaction.objectStore(table).get(id).onsuccess = function(ev) {
      var data = ev.target.result;
      data[property] = newValue;
      
      var requestUpdate = objectStore.put(data);
      
      requestUpdate.onsuccess = function(ev) {
        idb.results = ev.target.result;
      };
    };
  },

  // Saves the data from the database, deletes it, and repopulates it
  upgradeDatabase: function() {
    var counter = 0;
    var database = {};
    
    var populateDatabase = function() {
      Object.keys(database).forEach(function(key, i) {
        idb.add(database[key], key);
      });
    };

    var saveRecords = function(records) {
      var objectStoreName = idb.database.objectStoreNames[counter];
      database[objectStoreName] = records;
      counter += 1;
      if (counter === idb.database.objectStoreNames.length) {
        var opendb = function() {
          idb.open(this.currentDatabase, populateDatabase);
        };
        idb.deleteDatabase(this.currentDatabase, opendb);
      }
    };
    
    var transaction = idb.database.transaction(idb.database.objectStoreNames);
    for (var i=0; i<idb.database.objectStoreNames.length; i++) {
      var objectStore = transaction.objectStore(idb.database.objectStoreNames[i]);
      idb.getAll(idb.database.objectStoreNames[i], saveRecords);
    }
  }
};

idb.database = {};

idb.database.onerror = function(ev) {
  alert('Database error: ' + ev.target.errorCode);
};