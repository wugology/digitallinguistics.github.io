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
  
  this.update = function(action, data) {
    if (data != this.workview) { this.hide(); }
  };
  
  this.render = function() {
    var tv = this.template.content.cloneNode(true);
    
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
    
    var phraseWrapper = this.el.querySelector('.phrases').innerHTML = '';
    
    this.model.phrases.render(phraseWrapper);
    
    this.display();
  };
  
  appView.observers.add('setWorkview', this);
  
  // Event listeners
  /*this.el.querySelector('#deleteTextButton').addEventListener('click', function(ev) {
    this.hide();
    this.model.removeFromCorpus();
    this.model.delete(function() { appView.setWorkview('texts'); });
    this.notify('deleteText');
  });

  this.el.querySelector('.titles').addEventListener('input', function(ev) {
    this.model.titles[ev.target.id] = ev.target.value;
  });
  
  this.el.querySelector('.titles').addEventListener('keyup', function(ev) {
    if (ev.keyCode == 13 || ev.keyCode == 27) {
      ev.target.blur();
      this.notify('titleChange');
      this.model.store();
    }
  });
  
  this.el.querySelector('.phrases').addEventListener('click', function(ev) {
    if (ev.target.classList.contains('play')) {
      console.log('Playing: ' + ev.target.parentNode.dataset.breadcrumb);
    }
  });*/
};

var PhraseView = function(model) {
  View.call(this, model);
  
  this.template = $('#phraseTemplate');
  
  this.render = function(wrapper, options) {
    var pv = this.template.content.cloneNode(true);
    pv.querySelector('.phrase').dataset.breadcrumb = model.breadcrumb;
    var contentWrapper = pv.querySelector('.wrapper');
    
    renderTextContent(this.model.transcripts, contentWrapper);
    renderTextContent(this.model.transcriptions, contentWrapper);
    renderTextContent(this.model.translations, contentWrapper);
    renderTextContent(this.model.notes, contentWrapper);
    
    wrapper.appendChild(pv);
    
    this.el = pv;
  }.bind(this);
};