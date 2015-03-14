// VIEWS

// HELPERS
function renderTextContent(textHash, wrapper) {
  Object.keys(textHash).forEach(function(ortho) {
    var p = createElement('p', { textContent: textHash[ortho] });
    p.classList.add('unicode');
    wrapper.appendChild(p);
  });
};


// APP VIEW
var appView = new View(null, {
  setWorkview: function(workview) {
    if (!workview) { workview = 'texts'; }
    
    this.appNav.setButton(workview);
    
    this.notify('setWorkview', workview);
    
    switch (workview) {
      case 'documents':
        app.preferences.currentCorpus.get('documents', function(docs) {
          var docs = new models.Documents(docs);
          modules.documentsOverview = new modules.DocumentsOverview(docs);
          modules.documentsOverview.render()
        });
        break;
      case 'lexicon':
        modules.lexiconOverview = new modules.LexiconOverview(null);
        modules.lexiconOverview.render();
        break;
      case 'media':
        modules.mediaOverview = new modules.MediaOverview(null);
        modules.mediaOverview.render()
        break;
      case 'orthographies':
        modules.orthographiesOverivew = new modules.OrthographiesOverview(null);
        modules.orthographiesOverivew.render()
        break;
      case 'tags':
        modules.tagsOverview = new modules.TagsOverview(null)
        modules.tagsOverview.render();
        break;
      case 'texts':
        app.preferences.currentCorpus.get('texts', function(texts) {
          var texts = new models.Texts(texts);
          modules.textsOverview = new modules.TextsOverview(texts);
          modules.textsOverview.render();
        });
        break;
      default:
    }
    
    app.preferences.currentWorkview = workview;
  },
  
  update: function(action, data) {
    if (action == 'appNavClick') { this.setWorkview(data); }
  }
});


// APP COMPONENT VIEWS
var Nav = function() {
  View.call(this, null);  
  delete this.model;
};

var Module = function(model) {
  View.call(this, model);
  
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
var TextView = function(text) {
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