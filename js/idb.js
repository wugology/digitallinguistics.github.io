// INDEXEDDB
// IndexedDB functionality, used as a mix-in on the models

var idb = {
  // Adds an item or items to the specified object store (table)
  //   (the function detects whether you've given it an array or a single item)
  // Takes an optional callback that has the array of indexes of the added items as its argument
  //   (or just the single index if only one item was added)
  add: function(items, table, callback) {
    var
      results = [],
      transaction = idb.database.transaction(table, 'readwrite');
    
    transaction.oncomplete = function() {
      if (typeof callback == 'function') { callback(results); }
    };
    
    var objectStore = transaction.objectStore(table);
    
    if (items.length == 1) {
      var request = objectStore.add(item);
      request.onsuccess = function() { results = request.result; };
      
    } else {
      items.forEach(function(item) {
        var request = objectStore.add(item);
        request.onsuccess = function() { results.push(request.results); };
      });
    }
  },
  
  // Creates the object stores (tables) for the database (the database itself is created on .open())
  createStores: function() {
    var
      defaults = { keyPath: 'id', autoIncrement: true },
      objectStores = [
        'corpora',
        'languages',
        'lexicons',
        'media',
        'texts'
      ];
    
    objectStores.forEach(function(objectStore) { idb.database.createObjectStore(objectStore, defaults); });
  },
  
  // Change this value to work with different databases
  currentDatabase: 'WugbotDev',
  
  // Deletes the database as well as saved preferences; takes an optional callback
  deleteDatabase: function(dbname, callback) {
    if (!typeof dbname == 'string') { console.log('Please specify a database to delete.'); }
    
    delete localStorage.wugbotPreferences;
    delete app.preferences;
    
    var request = indexedDB.deleteDatabase(dbname);
    
    request.onsuccess = function() {
      console.log('Database deleted.');
      if (typeof callback == 'function') { callback(); }
    };
    
    request.onblocked = function() { idb.database.close(); };
  },
  
  // Gets either a single record, an array of records, or all the records from a given table
  // Acceptable values for 'id':
  // - null: returns all the records in the table
  // - single ID: returns just the record with that index
  // - array of IDs: returns all the records with those indexes
  // Takes a required callback function that has the returned results as its argument
  get: function(ids, table, callback) {
    var
      results,
      transaction = idb.database.transaction(table);
      
    transaction.oncomplete = function() {
      if (typeof callback == 'function') { callback(results); }
    };
    
    var objectStore = transaction.objectStore(table);
    
    if (ids == null) { // Get all records in the table; Mozilla actually has a getAll() function, but Chrome does not
      objectStore.openCursor().onsuccess = function(ev) {
        var cursor = ev.target.result;
        
        if (cursor) {
          var result = {
            key: cursor.key,
            value: cursor.value
          };
          
          results.push(result);
          
          cursor.continue();
        }
      };
      
    } else if (typeof ids == 'number') { // Get a single record
      var request = objectStore.get(id);
      request.onsuccess = function(ev) { results = idb.reconstruct(request.result); };
      
    } else { // Get only the provided IDs
      ids.forEach(function(id) {
        var request = objectStore.get(id);
        request.onsuccess = function(ev) { results.push(request.result); };
      });
    }
  },
  
  // Opens the db, and creates a new one if the db name doesn't exist
  // Takes an optional callback that has the database object as its argument
  open: function(dbname, callback) {
    var request = indexedDB.open(dbname, 1);
    
    request.onsuccess = function() {
      idb.database = request.result;
      
      idb.database.onerror = function(ev) { console.log('Database error: ' + ev.target.errorCode); };
      
      idb.onversionchange = function(ev) { ev.target.close(); };
      
      if (typeof callback == 'function') { callback(idb.database); }
    };
    
    request.onupgradeneeded = function() {
      idb.database = request.result;
      idb.createStores();
    };
  },
  
  reconstruct: function(obj) {
    var newObj = new window[obj.model]();
    
    augment(newObj, obj);
  },
  
  // Deletes records from the database
  // The ids argument may be one of:
  // - null: deletes the entire table (and returns the empty table)
  // - a single index: deletes the record with that index (and returns nothing)
  // - an array of indexes: deletes the records with the provided indexes (and returns nothing)
  remove: function(ids, table, callback) {
    var
      results,
      transaction = idb.database.transaction(table);
      
    transaction.oncomplete = function() {
      if (typeof callback == 'function') { callback(results); }
    };
    
    var objectStore = transaction.objectStore(table);
    
    if (ids == null) { // Delete all records in the table
      var request = objectStore.clear();
      request.onsuccess = function(ev) { results.push(request.result); };
      
    } else if (typeof ids == 'number') { // Delete a single record
      var request = objectStore.delete(id);
      
    } else { // Get only the provided IDs
      ids.forEach(function(id) {
        var request = objectStore.delete(id);
      });
    }
  },
};