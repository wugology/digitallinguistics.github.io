// INDEXEDDB
// IndexedDB functionality, used as a mix-in on the models

var idb = {
  // Creates the tables (object stores) for the database
  createTables: function() {
    var defaults = { keyPath: 'id', autoIncrement: true };
    idb.tableList.forEach(function(table) {
      idb.database.createObjectStore(table.name, defaults);
    });
  },

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

  // Exports the entire database and returns a database object in JSON format
  // Accepts an optional callback function
  export: function(callback) {
    idb.exported = {};
    var tableNames = Array.prototype.slice.call(idb.database.objectStoreNames);
    var transaction = idb.database.transaction(tableNames);
    transaction.oncomplete = function() {
      if (typeof callback == 'function') { callback(idb.exported); }
    };
    tableNames.forEach(function(tableName) {
      var results = idb.exported[tableName] = [];
      
      var getAll = function(table) {
        var request = table.openCursor;
        
        request.onsuccess = function() {
          var cursor = request.result;
          
          if (cursor) {
            results.push(cursor.value);
            cursor.continue();
          }
        };
      };
      
      idb.transact(tableName, null, null, getAll);
    });
  },

  // Gets items from the database by an ID (does not accept breadcrumbs)
  // The IDs argument may be a single ID, an array of IDs, or 'all'
  // Takes a required callback function that has the array of the returned results as its argument
  get: function(ids, tableName, callback) {
    var results = [];
    
    var getEach = function(table) {
      if (ids == 'all') {
        var request = table.openCursor();
        
        request.onsuccess = function() {
          var cursor = request.result;
          
          if (cursor) {
            results.push(cursor.value);
            cursor.continue();
          }
        };
        
      } else {
        if (!ids.length) {
          var ids = new Array(ids);
          ids.forEach(function(id) {
            var request = table.get(id);
            request.onsuccess = function() {
              results.push(request.result);
            };
          });
        }
      }
    };
    
    idb.transact(tableName, results, callback, getEach);
  },

  // Gets objects from the database by their breadcrumb
  // The 'breadcrumbs' argument may be either a single breadcrumb or an array of breadcrumbs (an array of arrays)
  // Breadcrumb format: [1, 2, 3, 4], or [1, 7], or [13, 4, 9], etc.
  // Takes a required callback function that has an array of retrieved objects as its argument
  getBreadcrumb: function(breadcrumbs, callback) {
    var results = [];
    if (typeof breadcrumbs[0] == 'number') { breadcrumbs = new Array(breadcrumbs); }
    
    var getByBreadcrumb = function(table) {
      breadcrumbs.forEach(function(breadcrumb) {
        var request = table.get(breadcrumb[0]);
        
        request.onsuccess = function() {
          var text = request.result;
          
          Breadcrumb.applyTo(breadcrumb, text, function(obj) {
            results.push(obj);
          });
        };
      });
    };
    
    idb.transact('texts', results, callback, getByBreadcrumb);
  },
  
  hydrate: function(obj) {
    var newObj = new models[obj.model](obj);
    return newObj;
  },
  
  // Opens the database, or creates a new one if it doesn't yet exist
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
      idb.createTables();
    };
  },
  
  // Helper function: Creates a put request and puts the object to the specified table
  // Note that 'table' is an actual reference to an object store, not just a table name
  put: function(item, table, results) {
    var request = table.put(item);
    request.onsuccess = function() { results.push(request.result); };
  },

  // Removes records with the specified IDs from the specified table
  // The 'ids' argument may be a single numeric ID, an array of IDs, or 'all'
  // Takes an optional callback
  remove: function(ids, tableName, callback) {
    var result;
    
    var removeByID = function(table) {
      if (typeof ids == 'number') {
        ids = new Array(ids);
        ids.forEach(function(id) { table.delete(id); });
      } else if (ids == 'all') {
        table.clear();
      }
    };
    
    idb.transact(tableName, result, callback, removeByID);
  },

  // Removes objects with the specified breadcrumb from the database
  // The 'breadcrumbs' argument may be either a single breadcrumb or an array of breadcrumbs (an array of arrays)
  // Breadcrumb format: [1, 2, 3, 4], or [1, 7], or [13, 4, 9], etc.
  // Takes an optional callback function
  removeBreadcrumb: function(breadcrumbs, callback) {
    if (breadcrumbs[0] == 'number') { breadcrumbs = new Array(breadcrumbs); }
    
    var removeByBreadcrumb = function(table) {
      breadcrumbs.forEach(function(breadcrumb) {
        if (breadcrumb.length == 1) {
          table.delete(breadcrumb[0])
        } else {
          var request = table.get(breadcrumb[0]);
          
          request.onsuccess = function() {
            var text = request.result;
            
            var removeObj = function(obj, index, arr) {
              arr.splice(index, 1);
            };
            
            Breadcrumb.applyTo(breadcrumb, text, removeObj);
            
            Breadcrumb.reset(text);
            
            table.put(text);
          };
        }
      });
    };
    
    idb.transact('texts', null, callback, removeByBreadcrumb);
  },

  // lingType = the type of linguistic object being searched for (e.g. Phrase, Morpheme)
     // - argument is PascalCase, so that it can be generated automatically using the .model or .constructor.name properties of an object if desired
  // property = a property of the linguistic object to be checked for matches
  // criteria = an expression that will return true whenever property == criteria
  search: function(lingType, criteria) {
    var results = [];
    
    var check = function(table) {
      var request = table.openCursor();
      
      request.onsuccess = function() {
        var cursor = request.result;
        
        if (cursor) {
          var text = cursor.value;
          
          if (lingType != 'Text') {
            text.phrases.forEach(function(phrase) {
              if (lingType != 'Phrase') {
                phrase.words.forEach(function(word) {
                  if (lingType != 'Word') {
                    word.morphemes.forEach(function(morpheme) {
                      if (checkAgainst(criteria, morpheme)) {
                        results.push(morpheme);
                      }
                    });
                  } else {
                    if (checkAgainst(criteria, word)) {
                      results.push(word);
                    }
                  }
                });
              } else {
                if (checkAgainst(criteria, phrase)) {
                  results.push(phrase);
                }
              }
            });
          } else {
            if (checkAgainst(criteria, text)) {
              results.push(text);
            }
          }
          
          cursor.continue();
        }
      };
    };
    
    idb.transact('texts', results, callback, check);
  },
  
  
  
  
  

        
        
        
        
        
        
  
  // Adds or updates database items
  // Items may either be a single object or an array of objects (objects must have the same model)
  // Accepts an optional callback that has an array of indexes of the added items as its argument
  store: function(items, callback) {
    if (!items.length) { items = new Array(items); }
    
    var results = [];
    var model = items[0].model;
    
    if (items[0].id) {
      var tableName = idb.tableList.filter(function(table) {
        return table.model == items[0].model;
      })[0];
      
      var storeByID = function(table) {
        items.forEach(function(item) {
          idb.put(item, table, results);
        });
      };
      
      idb.transact(tableName, results, callback, storeByID);
      
    } else {
      var tableName = 'texts';
      
      var storeByBreadcrumb = function(table) {
        items.forEach(function(item) {
          var request = table.get(item.breadcrumb[0]);
          
          request.onsuccess = function() {
            var text = request.result;
            
            Breadcrumb.applyTo(item.breadcrumb, text, function(obj) {
              obj = item;
            });
            
            idb.put(text, table, results);
          }; 
        });
      };
      
      idb.transact(tableName, results, callback, storeByBreadcrumb);
    }
  },

  // The list of tables in the database, and their corresponding models
  tableList: [
    {
      name: 'corpora',
      model: 'Corpus'
    },
    {
      name: 'languages',
      model: 'Language'
    },
    {
      name: 'lexicons',
      model: 'Lexicon'
    },
    {
      name: 'media',
      model: 'Media'
    },
    {
      name: 'texts',
      model: 'Text'
    }
  ],
  
  // Helper function: Creates a transaction, gets the table, and applies an action to it
  // The 'action' argument is a function which has the idb table as its argument
  transact: function(tableName, results, callback, action) {
    var transaction = idb.database.transaction(tableName);
    
    transaction.oncomplete = function() {
      if (typeof callback == 'function') { callback(results); }
    };
    
    var table = transaction.objectStore(tableName);
    
    action(table);
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
