// Contains the script for things in the tools folder
tools = {};

// Gets the file from the file input, converts it from an ELAN tsv export format into a valid JSON format, and returns the JSON object
// In the future, it may be good to make this function sufficiently robust that it can handle all the various settings in the ELAN export popup
tools.convert = function(callback) {
  var file = views.popups.fileUpload.file;
  if (file === undefined) {
    page.notify('Please select a file below.');
  } else {
    var phrases = [];
    var fileReader = new FileReader();
    fileReader.onload = function(ev) {
      var text = ev.target.result;

      text = text.trim();
      var lines = text.split(/\n/g);
      var header = lines[0].trim();
      var columnNames = header.split(/\t/g);
      columnNames.forEach(function(columnName, i) {
        columnName = columnName.startsWith('Begin Time') ? 'startTime' : columnName;
        columnName = columnName.startsWith('End Time') ? 'endTime' : columnName;
        columnName = columnName.startsWith('Duration') ? 'duration' : columnName;
        columnName = columnName.startsWith('Transcript') ? 'transcript' : columnName;
        columnName = columnName.startsWith('Notes') ? 'notes' : columnName;
        columnName = columnName.startsWith('Translation') ? 'translation' : columnName;
        columnName = columnName.startsWith('Transcription') ? 'transcription' : columnName;
        columnName = columnName.startsWith('Phonemic') ? 'phonemic' : columnName;
        columnName = columnName.startsWith('Phonetic') ? 'phonetic' : columnName;
        columnName = columnName.replace(/[^\S]/g, '');
        columnNames[i] = columnName;
      });
      var labelLine = function(line) {
        var values = line.trim().split(/\t/g);
        var phrase = {};
        columnNames.forEach(function(columnName, i) {
          values[i] = values[i] === undefined ? null : values[i];
          phrase[columnName] = values[i];
        });
        phrases.push(phrase);
      };
      lines.slice(1).forEach(labelLine);
      
      phrases.forEach(function(phrase, i) {
        phrase.startTime = parseFloat(phrase.startTime);
        phrase.endTime = parseFloat(phrase.endTime);
        phrase.transcripts = [{ transcriptText: phrase.transcript, orthography: null }];
        phrase.translations = [{ type: 'free', translationText: phrase.translation, orthography: null }];
        phrase.transcriptions = [
          { type: 'phonemic', transcriptionText: phrase.phonemic, orthography: null },
          { type: 'phonetic', transcriptionText: phrase.phonetic, orthography: null }
        ];
        delete phrase.transcript;
        delete phrase.translation;
        delete phrase.phonemic;
        delete phrase.phonetic;
        delete phrase.duration;
        
        phrases[i] = new Phrase({
          speaker: null,
          startTime: phrase.startTime,
          endTime: phrase.endTime,
          transcriptions: phrase.transcriptions,
          transcripts: phrase.transcripts,
          translations: phrase.translations,
          tags: [],
          words: [],
          notes: phrase.notes
        });
      });
      
      var text = new Text({ phrases: phrases });
      
      if (typeof callback === 'function') {
        callback(text);
      }
    };
    fileReader.readAsText(file);
  }
};