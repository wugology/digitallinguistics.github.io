var idb = {
  pushUpdate: function(id, property, objectToPush, table, successCallback) {
    idb.results = [];
    
    var transaction = idb.database.transaction(table, 'readwrite');
    
    transaction.oncomplete = function() {
      if (typeof successCallback === 'function') {
        successCallback(idb.results);
      }
    };
    
    var objectStore = transaction.objectStore(table);
    
    objectStore.get(id).onsuccess = function(ev) {
      var data = ev.target.result;
      data[property].push(objectToPush);
            
      var requestUpdate = objectStore.put(data);
      
      requestUpdate.onsuccess = function(ev) {
        idb.results = ev.target.result;
      };
    };
  },

  // searchText should be a regular expression object
  search: function(searchText, tier, orthography, successCallback) {
    idb.results = [];
    var transaction = idb.database.transaction('texts');
    
    transaction.oncomplete = function() {
      if (typeof successCallback === 'function') {
        successCallback(idb.results);
      }
    };
    
    var objectStore = transaction.objectStore('texts');
    
    objectStore.openCursor().onsuccess = function(ev) {
      var cursor = ev.target.result;
      
      
      if (cursor) {
        var text;
        cursor.value.phrases.forEach(function(phrase) {
          var checkText = function(text) {
            if (text.search(searchText) !== -1) {
              idb.results.push(idb.reconstruct(phrase));
            }
          };

          if (phrase[tier]) {
            if (typeof phrase[tier] === 'string') {
              checkText(phrase[tier]);
            } else {
              orthographies = phrase[tier].filter(function(ortho) {
                if (ortho.orthography === orthography) {
                  return true;
                }
              });
              
              orthographies.forEach(function(ortho) {
                if (ortho.text) {
                  checkText(ortho.text);
                }
              });
            }
          }
        });

        cursor.continue();
      }
    };
  },
  
  // Updates a single property within a single record (object)
  // Takes an optional callback function, which has the ID of the updated record as its argument
  update: function(id, property, newValue, table, successCallback) {
    idb.results = [];
    
    var transaction = idb.database.transaction(table, 'readwrite');
    
    transaction.oncomplete = function() {
      if (typeof successCallback === 'function') {
        successCallback(idb.results);
      }
    };
    
    var objectStore = transaction.objectStore(table);
    
    objectStore.get(id).onsuccess = function(ev) {
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