// Contains the API for IndexedDB (abbreviated idb)

var idb = {
  // Adds an array of objects to the specified object store (table). Example usage:
  // idb.add( [ text1, text2 ], 'texts'); <-- This adds the objects 'text1' and 'text2' to the 'texts' table
  // Takes an optional callback function which fires after the data has been added to the database and has the array of indexes of the added items as its object
  // Returns an array of indexes of the added objects
  add: function(array, table, successCallback) {
    var transaction = idb.database.transaction(table, 'readwrite');
    var objectStore = transaction.objectStore(table);
    var indexes = [];
    
    var add = function(item) {
      var request = objectStore.add(item);
      request.onsuccess = function(ev) {
        indexes.push(request.result);
        if (typeof successCallback === 'function') {
          successCallback(indexes);
        }
      }      
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
    
    return indexes;
  },
  
  // Creates a new Wugbot database and its objectStores (tables)
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
  
  currentDatabase: 'WugbotDev',

  // Deletes the entire database
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
      
      delete localStorage.wugbotPreferences; // TODO
      delete app.preferences;                // TODO
    }
  },
  
  // Takes a single ID for an object and returns that object from the database
  // Accepts a callback function which takes the returned object as its argument
  // Sets the idb.result argument equal to the result of database request
  get: function(id, table, successCallback) {
    var request = idb.database.transaction(table).objectStore(table).get(id);
    request.onsuccess = function(ev) {
      if (table !== 'media') {
        idb.result = idb.reconstruct(request.result);
        if (typeof successCallback === 'function') {
          successCallback(idb.reconstruct(request.result));
        }
      } else {
        idb.result = request.result;
        if (typeof successCallback === 'function') {
          successCallback(request.result);
        }
      }
    };
  },
  
  // Returns an array of every object in the specified object store (table)
  // Mozilla actually has a .getAll() function, but Chrome does not
  // Also takes an optional callback function which takes two arguments: the array of retrieved objects, and their keys in the database
  // Sets the idb.result argument equal to the result of database request
  getAll: function(table, successCallback) {
    var records = [];
    var keys = [];
    var objectStore = idb.database.transaction(table).objectStore(table);
    objectStore.openCursor().onsuccess = function(ev) {
      var cursor = ev.target.result;
      if (cursor) {
        if (table !== 'media') {
          records.push(idb.reconstruct(cursor.value));
          keys.push(cursor.key);
        } else {
          records.push(cursor.value);
          keys.push(cursor.key);
        }
        cursor.continue();
      } else {
        idb.result = records;
        if (typeof successCallback === 'function') {
          successCallback(records, keys);
        }
      }
    };
    return records;
  },
  
  // Opens the Wugbot database (and creates it if it doesn't yet exist)
  // Also takes an optional callback function which will fire once the database is opened
  open: function(dbname, successCallback) {
    var request = window.indexedDB.open(dbname, 1);

    request.onsuccess = function() {
      idb.database = this.result;
      idb.database.onversionchange = function(ev) {
        ev.target.close();
      };
      if (typeof successCallback === 'function') {
        successCallback(idb.database);
      }
    };
        
    request.onupgradeneeded = function() {
      idb.database = this.result;
      idb.createDatabase();
    };
  },
  
  // Pushes an object onto the specified property of the specified record
  // Takes an optional callback function, which has the ID of the updated record as its argument
  pushUpdate: function(id, property, objectToPush, table, successCallback) {
    var objectStore = idb.database.transaction(table, 'readwrite').objectStore(table);
    var request = objectStore.get(id);
    
    request.onsuccess = function(ev) {
      var data = request.result;
      data[property].push(objectToPush);
      
      var requestUpdate = objectStore.put(data);
      
      requestUpdate.onsuccess = function(ev) {
        if (typeof successCallback === 'function') {
          successCallback(ev.target.result);
        }
      };
    };
  },
  
  // Re-adds the methods that were removed from the object when it was added to the database
  // The 'model' argument is the name of the constructor which builds the object (e.g. 'Text', with initial Caps)
  reconstruct: function(object) {
    var newObject = new app.constructors[object.model]();
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
  
  // Deletes the specified array of objects from the specified object store
  // Takes an optional callback function that fires once the object is deleted
  remove: function(objects, table, successCallback) {
    var transaction = idb.database.transaction(table, 'readwrite');
    var objectStore = transaction.objectStore(table);
    objects.forEach(function(object) {
      var request = objectStore.delete(object.id);
      request.onsuccess = function(ev) {
        if (typeof successCallback === 'function') {
          successCallback(ev.target.result);
        }
      };
    });
  },
  
  result: null,
  
  // Updates a single property within a single record (object)
  // Takes an optional callback function, which has the ID of the updated record as its argument
  update: function(id, property, newValue, table, successCallback) {
    var objectStore = idb.database.transaction(table, 'readwrite').objectStore(table);
    var request = objectStore.get(id);
    
    request.onsuccess = function(ev) {
      var data = request.result;
      data[property] = newValue;
      
      var requestUpdate = objectStore.put(data);
      
      requestUpdate.onsuccess = function(ev) {
        if (typeof successCallback === 'function') {
          successCallback(ev.target.result);
        }
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