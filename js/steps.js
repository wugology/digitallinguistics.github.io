var demoSteps = [
      {
        element: '#header',
        intro: "Welcome to Digital Linguistics! Here's a little demo to show you what we're all about!<br><br>Use the arrow keys for navigation or hit ESC to exit the tour immediately.",
        position: 'bottom',
        tooltipClass: 'header'
      },
      {
        element: '#data',
        intro: 'We want to help linguistic researchers encode their collected data into a smart, digital form that computers can effectively use.',
        position: 'right'
      },
      {
        element: '#inputArea',
        intro: "Here's where you can input the data you get from a speaker of your target language.",
        position: 'right'
      },
      {
        element: '#transcriptionLabel',
        intro: "Put the transcription of the foreign phrase here.<br><br>When you have entered a phrase, more boxes will appear below for you to provide the individual glosses and Parts of Speech of each word. This data will be recorded along with the phrase as a whole, as you will see below.",
        position: 'right'
      },
      {
        element: '#translationLabel',
        intro: "Put the English translation of the entire phrase here.<br><br>We'll add an example in for you for now.",
        position: 'right'
      },
      {
        element: '#jsonArea',
        intro: "In this black space, we will show how the computer can store and manage the data you provided in JSON (Javascript Object Notation).<br><br>The entire box contains one 'object', which is denoted by the first and last curly braces { } in the file. This object represents the whole phrase in JSON.<br>It contains a field for the transcription, which represents the phrase you put in the first box; a translation, which contains the translation you provided in the second box; and a list of words.<br>This list of words also contains several 'objects', each of which represents one word of your transcription.<br>Each of these 'word' objects contains a 'token', which is the word itself taken from the phrase in the original language; a 'gloss', which is the English gloss of that individual word that you provided; and that word's part of speech.",
        position: 'right',
        tooltipClass: 'oversize'
      },
      {
        element: '#visualizations',
        intro: "On the right half of the screen, we show merely a few different ways that the computer can visualize and manipulate this well-organized data!",
        position: 'left'
      },
      {
        element: '#interlinearGloss',
        intro: "This visualization is called an interlinear gloss. The first line is the phrase in the original language. The second line displays each of the words of this phrase, with its individual gloss and POS directly below it in the third and fourth lines, respectively. The fifth and final line gives the English translation of the full phrase.",
        position: 'left'
      },
      {
        element: '#stats',
        intro: "This section displays some stats that the computer calculated from our data; namely, the amount of tokens of each phoneme that appears in the phrase.",
        position: 'left'
      },
      {
        element: '#dictionary',
        intro: "This section displays each word in the phrase in the rough fashion of a typical bilingual dictionary.",
        position: 'left'
      }
    ]

var homePageSteps = [
  {
    element: '#demoLink',
    intro: '<p>See how Digital Linguistics works!</p><a href=introdemo.html><button type=button>Go!</button></a>',
    position: 'top',
    tooltipClass: 'header'
  }
] 

var homePageRevisitSteps = [
  {
    element: '#demoLink',
    intro: '<p>Welcome back! Finish your walkthrough!</p><a href=introdemo.html><button type=button>Go!</button></a>',
    position: 'top',
    tooltipClass: 'header'
  }
]
