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
    
    var store = function(item) {
      Object.defineProperty(item, 'model', {
        enumerable: true,
        value: item.constructor.name
      });
      
      var request = objectStore.add(item);
      
      request.onsuccess = function() { results.push(request.result); };
    };
    
    if (!items.length) {
      store(items);
    } else {
      items.forEach(function(item) {
        store(item);
      });
    }
  },
  
  // Checks to see whether the record(s) with the given ID(s) exists in the specified table
  // The ids argument may either be a single numeric ID, or an array of numeric IDs
  // Requires a callback function which has a boolean as its argument
  checkid: function(id, table, callback) {
    var result;
    
    var transaction = idb.database.transaction(table);
    
    transaction.oncomplete = function() { callback(result); };
    
    transaction.objectStore(table).openCursor(id).onsuccess = function(ev) {
      var cursor = ev.target.result;
      
      if (cursor) {
        result = true;
      } else {
        result = false;
      }
    };
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
  // Acceptable values for 'ids':
  // - null: returns all the records in the table
  // - single ID or breadcrumb: returns just the record with that ID, or the object with that breadcrumb
  // - array of IDs or breadcrumbs: returns all the records with those IDs, or all the objects with those breadcrumbs
  // Takes a required callback function that has an array of the returned results as its argument
  get: function(ids, table, callback) {
    var
      results = [],
      transaction = idb.database.transaction(table);
    
    if (typeof ids == 'number' || typeof ids == 'string') { ids = new Array(ids); }
      
    transaction.oncomplete = function() {
      if (typeof callback == 'function') { callback(results); }
    };
    
    var objectStore = transaction.objectStore(table);
    
    if (ids == null) { // Get all records in the table
      objectStore.openCursor().onsuccess = function(ev) {
        var cursor = ev.target.result;
        
        if (cursor) {
          var result = {
            key: cursor.key,
            value: idb.reconstruct(cursor.value)
          };
          
          results.push(result);
          
          cursor.continue();
        }
      };
      
    } else if (typeof ids[0] == 'number') { // Get records by ID
      ids.forEach(function(id) {
        var request = objectStore.get(id);
        request.onsuccess = function(ev) { results.push(idb.reconstruct(request.result)); };
      });
      
    } else if (typeof ids[0] == 'string') { // Get objects by breadcrumb
      ids.forEach(function(breadcrumb) {
        var indexes = Breadcrumb.parse(breadcrumb);

        var getData = function(text) {
          if (!indexes.phrase) {
            results.push(text);
          } else if (!indexes.word) {
            results.push(text.phrases[indexes.phrase]);
          } else if (!indexes.morpheme) {
            results.push(text.phrases[indexes.phrase].words[indexes.word]);
          } else {
            results.push(text.phrases[indexes.phrase].words[indexes.word].morphemes[indexes.morpheme]);
          }
        };
        
        idb.get(indexes.text, 'texts', getData);
      });
    }
  },
  
  // Returns the table that is associated with a given model
  getTable: function(model) {
    switch(model) {
      case 'Corpus':
        return 'corpora';
        break;
      case 'Language':
        return 'languages';
        break;
      case 'Lexicon':
        return 'lexicons';
        break;
      case 'Media':
        return 'media';
        break;
      case 'Text':
        return 'texts';
        break;
      default:
        return none;
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
    var newObj = new models[obj.model](obj);
    augment(newObj, obj);
    return newObj;
  },
  
  // Deletes records from the database
  // The ids argument may be one of:
  // - null: deletes the entire table (and returns the empty table)
  // - a single index: deletes the record with that index (and returns nothing)
  // - an array of indexes: deletes the records with the provided indexes (and returns nothing)
  remove: function(ids, table, callback) {
    var
      results,
      transaction = idb.database.transaction(table, 'readwrite');
    
    if (typeof ids == 'number' || typeof ids == 'string') { ids = new Array(ids); }
      
    transaction.oncomplete = function() {
      if (typeof callback == 'function') { callback(results); }
    };
    
    var objectStore = transaction.objectStore(table);
    
    if (ids == null) { // Delete all records in the table
      var request = objectStore.clear();
      request.onsuccess = function(ev) { results.push(request.result); };
      
    } else if (typeof ids[0] == 'number') { // Deletes based on ID
      ids.forEach(function(id) {
        objectStore.delete(id);
      });
    } else if (typeof ids[0] == 'string') { // Deletes based on breadcrumb
      ids.forEach(function(breadcrumb) {
        var indexes = Breadcrumb.parse(breadcrumb);
        
        if (indexes.phrase == null) {
          objectStore.delete(indexes.text);
        } else {
          
          var request = objectStore.get(indexes.text);
          
          request.onsuccess = function() {
            var text = request.result;

            if (!indexes.word) {
              text.phrases.splice(indexes.phrase, 1);
            } else if (!indexes.morpheme) {
              text.phrases[indexes.phrase].words.splice(indexes.word, 1);
            } else {
              text.phrases[indexes.phrase].words[indexes.word].morphemes.splice(indexes.morpheme, 1);
            }
            
            Breadcrumb.reset(text);
            
            var requestUpdate = objectStore.put(text);
            
            requestUpdate.onsuccess = function() { results.push(requestUpdate.result); };
          };
        }
      });
    }
  },
  
  results: [],
  
  // To be replaced with Pat's search function
  // Eventually, this function sould take 3 arguments:
    // 1. a hash of search criteria
    // 2. the search function to be applied to each text, using the search hash
    // 3. the callback function, which takes the search results as an argument
  // Currently requires searchText to be a regular expression object
  search: function(searchText, tier, orthography, callback) {
    var results = [];
    
    var transaction = idb.database.transaction('texts');
    
    transaction.oncomplete = function() {
      if (typeof callback == 'function') { callback(results); }
    };
    
    var objectStore = transaction.objectStore('texts');
    
    objectStore.openCursor().onsuccess = function(ev) {
      var cursor = ev.target.result;
      
      if (cursor) {
        var text;
        
        cursor.value.phrases.forEach(function(phrase) {
          var checkText = function(text) {
            if (text.search(searchText) == -1) { results.push(idb.reconstruct(phrase)); }
          };
          
          if (phrase[Tier]) {
            if (typeof phrase[tier] == 'string') {
              checkText(phrase[tier]);
            } else {
              var orthographies = phrase[tier].filter(function(ortho) {
                if (ortho.orthography == orthography) { return true; }
              });
              
              orthographies.forEach(function(ortho) {
                if (ortho.text) { checkText(ortho.text); }
              });
            }
          }
        });
        
        cursor.continue();
      }
    };
  },
  
  // Updates a single record (by replacing it entirely with the new object), or creates one if none exists
  // Accepts an optional callback which has the IDs of the updated records as its argument
  update: function(newValues, table, callback) {
    var results = [];
    
    if (newValues.length == undefined) { newValues = new Array(newValues); }
    
    var transaction = idb.database.transaction(table);
    
    transaction.oncomplete = function() {
      if (typeof callback == 'function') { callback(results); }
    };
    
    newValues.forEach(function(newValue) {
      if (newValue.id) {
        var request = transaction.objectStore(table).put(newValue);

        request.onsuccess = function() {
          results.push(request.result);
        };
      }
      
      if (newValue.breadcrumb) {
        var indexes = Breadcrumb.parse(newValue.breadcrumb);
        
        var objectStore = transaction.objectStore('texts');
        
        var request = objectStore.get(indexes.text);
        
        request.onsuccess = function() {
          var text = request.result;
          
            if (!indexes.word) {
              text.phrases[indexes.phrase] = newValue;
            } else if (!indexes.morpheme) {
              text.phrases[indexes.phrase].words[indexes.word] = newValue;
            } else {
              text.phrases[indexes.phrase].words[indexes.word].morphemes[indexes.morpheme] = newValue;
            }
          
          var requestUpdate = objectStore.put(text);
          
          requestUpdate.onsuccess = function() { results.push(requestUpdate.result); };
        };
      }
    });
  },
  
  // Updates a single property of the specified record(s) with the new value
  // The ids argument may be:
    // null: updates all records
    // a single numeric ID: updates only that record
    // an array of numeric IDs: updates the records with those IDs
  // The push argument specifies whether the new value should be pushed onto the array of the property (true),
    // or replace the value for that property entirely (false)
  // Accepts an optional callback which has the IDs of the updated records as its argument
  updateProperty: function(ids, property, newValue, push, table, callback) {
    var results = [];
    
    var updateData = function(data) {
      if (push) {
        data[property].push(newValue);
      } else {
        data[property] = newValue;
      }
      
      return data;
    };
    
    var transaction = idb.database.transaction(table, 'readwrite');
    
    transaction.oncomplete = function() {
      if (typeof callback == 'function') { callback(results); }
    };

    var objectStore = transaction.objectStore(table);

    if (ids == null) { // Updates all the records in the table
      objectStore.openCursor().onsuccess = function(ev) {
        var cursor = ev.target.result;
        
        if (cursor) {
          var newData = updateData(cursor.value);
          
          var requestUpdate = objectStore.put(newData);
          
          requestUpdate.onsuccess = function() {
            results.push(requestUpdate.result);
          };
          
          cursor.continue();
        }
      };
    } else if (typeof ids == 'number') { // Updates only the selected record
      var request = objectStore.get(ids);
      
      request.onsuccess = function() {
        var data = request.result;
        
        var newData = updateData(data);
        
        var requestUpdate = objectStore.put(newData);
        
        requestUpdate.onsuccess = function() { results = requestUpdate.result; };
      };
    } else { // Updates only the selected records
      ids.forEach(function(id) {
        objectStore.get(id).onsuccess = function() {
          var data = request.result;
          
          var newData = updateData(data);
          
          var requestUpdate = objectStore.put(newData);
          
          requestUpdate.onsuccess = function() { results.push(requestUpdate.result); };
        };
      });
    }
  },
  
  upgradeDatabase: function(dbname) {
    var
      counter = 0,
      database = {};
    
    var populateDatabase = function() {
      Object.keys(database).forEach(function(key, i) {
        idb.add(database[key], key);
      });
    };

    var saveRecords = function(records) {
      var objectStoreName = idb.database.objectStoreNames[counter];
      database[objectStoreName] = records;
      counter += 1;
      if (counter == idb.database.objectStoreNames.length) {
        var opendb = function() {
          idb.open(this.currentDatabase, populateDatabase);
        };
        idb.deleteDatabase(dbname, opendb);
      }
    };
    
    var transaction = idb.database.transaction(idb.database.objectStoreNames);
    for (var i=0; i<idb.database.objectStoreNames.length; i++) {
      var objectStore = transaction.objectStore(idb.database.objectStoreNames[i]);
      idb.getAll(idb.database.objectStoreNames[i], saveRecords);
    }
  }
};
