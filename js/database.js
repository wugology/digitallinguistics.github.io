// Contains the API for IndexedDB (abbreviated idb)

var idb = {
  // Adds an array of objects to the specified object store (table). Example usage:
  // idb.add( [ text1, text2 ], 'texts'); <-- This adds the objects 'text1' and 'text2' to the 'texts' table
  // Takes an optional callback function which fires after the data has been added to the database and has the array of indexes of the added items as its object
  // Returns an array of indexes of the added objects
  add: function(array, objectStore, successCallback) {
    var transaction = idb.database.transaction(objectStore, 'readwrite');
    var objectStore = transaction.objectStore(objectStore);
    var indexes = [];
    array.forEach(function(item) {
      var request = objectStore.add(item);
      request.onsuccess = function(ev) {
        indexes.push(request.result);
        if (typeof successCallback === 'function') {
          successCallback(indexes);
        }
      }
    });
    return indexes;
  },
  
  // Creates a new Wugbot database and its objectStores (tables)
  createDatabase: function() {
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
    var response = confirm('Are you sure about that?');
    if (response === true) {
      var request = window.indexedDB.deleteDatabase('Wugbot');
      request.onsuccess = function() {
        console.log('Database deleted.');
      };
      delete localStorage.wugbotPreferences;
      delete app.preferences;
    }
  },
  
  // Takes a single ID for an object and returns that object from the database
  // Accepts a callback function which takes the returned object as its argument
  // Sets the idb.result argument equal to the result of database request
  get: function(id, objectStore, successCallback) {
    var request = idb.database.transaction(objectStore).objectStore(objectStore).get(id);
    request.onsuccess = function(ev) {
      idb.result = idb.reconstruct(ev.target.result);
      if (typeof successCallback === 'function') {
        successCallback(idb.reconstruct(ev.target.result));
      }
    };
  },
  
  // Returns an array of every object in the specified object store (table)
  // Mozilla actually has a .getAll() function, but Chrome does not
  // Also takes an optional callback function which takes the array of retrieved objects as its argument, and will execute when the .getAll() operation is successful
  // Sets the idb.result argument equal to the result of database request
  getAll: function(objectStore, successCallback) {
    var records = [];
    var objectStore = idb.database.transaction(objectStore).objectStore(objectStore);
    objectStore.openCursor().onsuccess = function(ev) {
      var cursor = ev.target.result;
      if (cursor) {
        records.push(idb.reconstruct(cursor.value));
        cursor.continue();
      } else {
        idb.result = records;
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
    var response = confirm('Do you want to load the "Wugbot Dev" database?\n\n(Selecting "cancel" will load the regular "Wugbot" database instead.)');
    var dbname = response ? 'WugbotDev' : 'Wugbot';
    var request = window.indexedDB.open(dbname, 1);

    request.onsuccess = function() {
      idb.database = this.result;
      if (typeof successCallback === 'function') {
        successCallback();
      }
    };
        
    request.onupgradeneeded = function() {
      idb.database = this.result;
      idb.createDatabase();
    };
  },
  
  // Pushes an object onto the specified property of the specified record
  // Takes an optional callback function, which has the ID of the updated record as its argument
  pushUpdate: function(id, property, objectToPush, objectStore, successCallback) {
    var objectStore = idb.database.transaction(objectStore, 'readwrite').objectStore(objectStore);
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
    return newObject;
  },
  
  // Deletes the specified array of objects from the specified object store
  // Takes an optional callback function that fires once the object is deleted
  remove: function(objects, objectStore, successCallback) {
    var transaction = idb.database.transaction(objectStore, 'readwrite');
    var objectStore = transaction.objectStore(objectStore);
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
  update: function(id, property, newValue, objectStore, successCallback) {
    var objectStore = idb.database.transaction(objectStore, 'readwrite').objectStore(objectStore);
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
};

idb.database = {};

idb.database.onerror = function(ev) {
  alert('Database error: ' + ev.target.errorCode);
};