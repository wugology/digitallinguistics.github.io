// VIEWS

// HELPERS
function renderTextContent(textHash, wrapper) {
  Object.keys(textHash).forEach(function(ortho) {
    var p = createElement('p', { textContent: textHash[ortho] });
    p.classList.add('unicode');
    wrapper.appendChild(p);
  });
};


// APP COMPONENT VIEWS
var Nav = function() {
  View.call(this, null);  
  delete this.model;
};

var Module = function(collection) {
  CollectionView.call(this, collection);
  
  if (!this.render) {
    this.render = function() { this.display(); };
  }
  
  if (!this.update) {
    this.update = function(action, data) {
      if (data != this.workview) { this.hide(); }
    };
  }
  
  appView.observers.add('setWorkview', this);
};

var Popup = function() {
  View.call(this, null);
  delete this.model;
};


// ITEM VIEWS
var TextView = function(model) {
  View.call(this, model, $('#textTemplate'));
  
  workview = 'texts';
  
  this.render = function() {
    $('#detailsPane').innerHTML = '';
    
    var tv = this.template.content.querySelector('.text').cloneNode(true);
    
    // Render titles
    Object.keys(this.model.titles).forEach(function(key) {
      var li = createElement('li', { id: key });
      var label = createElement('label', { htmlFor: key });
      var p = createElement('p', { textContent: key });
      var input = createElement('input', { value: this.model.titles[key] || '', id: key });
      
      label.appendChild(p);
      label.appendChild(input);
      li.appendChild(label);
      tv.querySelector('.titles').appendChild(li);
      
      input.addEventListener('blur', this.model.store);
      
    }, this);
    
    $('#detailsPane').appendChild(tv);
    
    this.el = tv;
    
    // Render phrases
    phraseWrapper = this.el.querySelector('.phrases');
    
    this.model.phrases.render(phraseWrapper);
    
    // Load media
    var setMedia = function(media) {
      media.forEach(function(mediaObj) {
        var li = createElement('li');
        
        var audio = createElement('audio', {
          controls: true,
          src: URL.createObjectURL(mediaObj.file)
        });
        
        li.appendChild(audio);
        
        var img = createElement('img', { src: 'img/delete.svg', alt: 'delete this media from this text', id: mediaObj.id });
        img.classList.add('icon');
        
        li.appendChild(img);
        
        this.el.querySelector('.media').appendChild(li);
        
        img.addEventListener('click', function(ev) {
          this.model.media.forEach(function(mediaID, i) {
            if (mediaID = ev.target.id) { this.model.media.splice(i, 1); }
            this.model.store(function() { this.render(); }.bind(this));
          }, this);
        }.bind(this));
      }, this);
    }.bind(this);
    
    this.model.get('media', setMedia);
    
    // Add event listeners
    this.el.querySelector('#addMediaToTextButton').addEventListener('click', function() {
      var goButtonCallback = function(file) {
        var data = {
          file: file,
          textStart: null,
          textEnd: null
        };
        
        var media = new models.MediaFile(data);
        
        var addToText = function(mediaIDs) {
          this.model.media.push(mediaIDs[0]);
          this.model.store();
          this.render();
        }.bind(this);
        
        media.store(addToText);
      }.bind(this);
      
      popups.fileUpload.render(goButtonCallback);
    }.bind(this));
    
    this.el.querySelector('#deleteTextButton').addEventListener('click', function(ev) {
      this.hide();
      this.model.removeFromCorpus();
      this.model.delete(function() { appView.setWorkview('texts'); });
      this.notify('deleteText');
    });

    this.el.querySelector('.titles').addEventListener('input', function(ev) {
      this.model.titles[ev.target.id] = ev.target.value;
    }.bind(this));
    
    this.el.querySelector('.titles').addEventListener('keyup', function(ev) {
      if (ev.keyCode == 13 || ev.keyCode == 27) {
        ev.target.blur();
        this.notify('titleChange');
        this.model.store();
      }
    }.bind(this));
    
    this.el.querySelector('.phrases').addEventListener('click', function(ev) {
      if (ev.target.classList.contains('play')) {
        console.log('Playing: ' + ev.target.parentNode.dataset.breadcrumb);
      }
    });
    
    this.display();
  };
  
  this.update = function(action, data) {
    if (data != this.workview) { this.hide(); }
  };
  
  appView.observers.add('setWorkview', this);
};

var PhraseView = function(model) {
  View.call(this, model);
  
  this.template = $('#phraseTemplate');
  
  this.render = function(wrapper, options) {
    var pv = this.template.content.querySelector('.phrase').cloneNode(true);
    pv.dataset.breadcrumb = model.breadcrumb;
    var contentWrapper = pv.querySelector('.wrapper');
    
    renderTextContent(this.model.transcripts, contentWrapper);
    renderTextContent(this.model.transcriptions, contentWrapper);
    renderTextContent(this.model.translations, contentWrapper);
    renderTextContent(this.model.notes, contentWrapper);
    
    wrapper.appendChild(pv);
    
    this.el = pv;
  }.bind(this);
};