'use strict';

// -- Get language of participant
const starting_time = Date.now();
const lan_selected = sessionStorage.getItem('language-selected') || 'en';
const debbug = false; // FIXME This should ALWAYS BE FALSE before using the code. Change the id of participant to test-id
const experiment_name = 'memocrush_jianghao'; // this can have one of several values:
// complexity : online experiment of complexity judgement
// geom_temp : geometry/temporal LoT experiment
// deviant_music : LoT music with the deviant detection task.

// Store experiment_name in storage
sessionStorage.setItem('experiment_name', experiment_name);

// Generate a participant ID
const participant_id = makeId();

// -- Retrieve survey results
let surveyResults = sessionStorage.getItem('surveyChoices');
if (surveyResults) {
  // Parse the JSON string back into an object
  surveyResults = JSON.parse(surveyResults);
} else {
  console.log('No survey data found in sessionStorage.');
  surveyResults = default_survey_results;
}

/* 
============================================================
+++++++++++++++ Participant Device Parameters ++++++++++++++
============================================================
*/

const bodyElement = document.body;
const containerFigureElement = document.querySelector('.container-figure');
const keyEvent = 'touchend'; //'touchend' (smartphone) or 'click' (computer) depending on the device

/* 
============================================================
+++++++++++++++++++ Game dynamics Variables +++++++++++++++++
============================================================
*/
const instruction_elements = ['btn_ok', 'txt_container']; // Elements to be displayed to read the instructions.
const experimental_elements = ['circles', 'fixation']; // Elements to be displayed all throughout presentation and response phase.
const page_next_elements = ['txt_container', 'btn_next']; // Elements that needs to be displayed during the presentation phase.
const page_next_elements_training = ['txt_container', 'btn_next']; // Elements that needs to be displayed during the presentation phase.
const response_phase_elements_training = [
  'container_confidence',
  'progression_bar',
  'prompt',
]; // Elements that needs to be displayed during the response phase.
const response_phase_elements = [
  'container_confidence',
  'progression_bar',
  'txt_score',
]; // Elements that needs to be displayed during the response phase.
const minimum_input_required = 3; // number of intput required to submit answer
const correct_threshold = 6; // Defined DL-distance threshold to have a positive addition to the score
/* 
============================================================
+++++++++++++++++++ Experimental Variables +++++++++++++++++
============================================================
*/

const SOA = 400;
const blink = 300; //actual visual duration of the stimuli in ms
const nb_repetition = 2; // number of times the series of sequences are presented
const range_confidence = 4; // number of confidence buttons
const set_delay = 750; //Short delay after end of presentation

/* 
============================================================
+++++++++++++++++ Holders Participant Data +++++++++++++++++
============================================================
*/

// Hold the responses: during presentation phase (response_before) and during the reproduction phase (response_after)
let response_before = [];
let response_after = [];
let confidence_entry;

// Hold the timings
var click_timings = [];
var interclick_timings = [];

/* 
============================================================
++++++++++++++ Experiment dynamics variables +++++++++++++++
============================================================
*/
const initial_score = 5000;
var last_click = Date.now();
let interclick;
var counter_presentation = 0; // Tracks the number of sequence presented
var score = initial_score; // Starting score
let performance;
let dl_distance;
let tokenErr;
let state; // Possible values: {training, testing}
var presentation_time = false; // Tracks if a sequence is currently being presented
var txt_counter = 0;
let step; // Can take values {"presentation","response","next"}. Tracks the stage of the trial loop.

// --- Sound Feedback
let positive_streak = 0; // Counts how many positive answers the participant has in a row.
let soundPosHolder = ['pos1', 'pos2', 'pos3', 'pos6', 'pos7', 'pos4', 'pos5']; // Sound file names holder in growing order of enthusiasm
let playSound; // Holds the sounds that needs to be played
/* 
======================================================
++++++++++++++++ Data of the Sequences +++++++++++++++
======================================================
*/

// ---------------------------------------------------
// -- Sequence expressions
//
const dict_sequences = {
  'Rep-2': [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
  'CRep-2': [1, 2, 2, 2, 2, 1, 1, 2, 1, 1, 1, 2],
  'Rep-3': [1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3],
  'CRep-3': [1, 2, 3, 1, 3, 2, 2, 3, 1, 2, 1, 3],
  'Rep-4': [1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4],
  'CRep-4': [1, 2, 3, 4, 3, 2, 4, 1, 1, 4, 2, 3],
  'Rep-Nested': [1, 1, 2, 2, 3, 3, 1, 1, 2, 2, 3, 3],
  'CRep-Nested-Local': [1, 2, 3, 1, 3, 2, 1, 2, 3, 1, 3, 2],
  'CRep-Nested-Global': [1, 1, 2, 2, 3, 3, 1, 1, 3, 3, 2, 2],
  'Play-4': [1, 2, 1, 3, 1, 4, 1, 2, 1, 3, 1, 4],
  'CPlay-4': [1, 2, 1, 3, 2, 4, 1, 2, 1, 3, 2, 4],
  'Sub-1': [1, 2, 3, 4, 1, 2, 3, 2, 1, 2, 3, 1], // Sub-programs 1
  'CSub-1': [1, 2, 3, 4, 1, 3, 2, 3, 1, 2, 3, 1], // Contrôle sub-programs 1
  'Sub-2': [1, 2, 3, 4, 1, 2, 3, 5, 1, 2, 3, 6], // Sub-programs 2
  'CSub-2': [1, 2, 3, 4, 1, 3, 2, 5, 1, 2, 3, 6], // Contrôle sub-programs 2
  Index: [1, 2, 1, 1, 2, 2, 1, 1, 1, 2, 2, 2], // Indice i
  CIndex: [1, 1, 1, 2, 2, 2, 1, 2, 1, 1, 2, 2], // Contrôle indice i
  Play: [1, 1, 1, 2, 1, 1, 1, 3, 1, 1, 1, 4], // Play
  CPlay: [1, 1, 1, 2, 1, 1, 3, 1, 1, 1, 1, 4], // Contrôle play
  Insertion: [1, 2, 3, 1, 2, 3, 4, 1, 2, 3, 4, 5], // Insertion
  Suppression: [1, 2, 3, 4, 5, 1, 2, 3, 4, 1, 2, 3], // Suppression (contrôle insertion)
  'Mirror-1': [1, 2, 3, 4, 4, 3, 2, 1, 1, 2, 3, 4], // Miroir 1
  'CMirror-1': [1, 2, 3, 4, 4, 2, 3, 1, 1, 2, 3, 4], // Contrôle Miroir 1
  'Mirror-2': [1, 2, 3, 4, 3, 2, 1, 4, 1, 2, 3, 4], // Miroir 2
  'CMirror-2': [1, 2, 3, 4, 3, 1, 2, 4, 1, 2, 3, 4], // Contrôle Miroir 2
};

const sequences = [
  [1, 2, 1, 3, 1, 4, 1, 2, 1, 3, 1, 4], // Play 4 Tokens
  [1, 2, 1, 3, 2, 4, 1, 2, 1, 3, 2, 4], // Contrôle Play-4 Tokens
  [1, 2, 3, 4, 1, 2, 3, 2, 1, 2, 3, 1], // Sub-programs 1
  [1, 2, 3, 4, 1, 3, 2, 3, 1, 2, 3, 1], // Contrôle sub-programs 1
  [1, 2, 3, 4, 1, 2, 3, 5, 1, 2, 3, 6], // Sub-programs 2
  [1, 2, 3, 4, 1, 3, 2, 5, 1, 2, 3, 6], // Contrôle sub-programs 2
  [1, 2, 1, 1, 2, 2, 1, 1, 1, 2, 2, 2], // Indice i
  [1, 1, 1, 2, 2, 2, 1, 2, 1, 1, 2, 2], // Contrôle indice i
  [1, 1, 1, 2, 1, 1, 1, 3, 1, 1, 1, 4], // Play
  [1, 1, 1, 2, 1, 1, 3, 1, 1, 1, 1, 4], // Contrôle play
  [1, 2, 3, 1, 2, 3, 4, 1, 2, 3, 4, 5], // Insertion
  [1, 2, 3, 4, 5, 1, 2, 3, 4, 1, 2, 3], // Suppression (contrôle insertion)
  [1, 2, 3, 4, 4, 3, 2, 1, 1, 2, 3, 4], // Miroir 1
  [1, 2, 3, 4, 4, 2, 3, 1, 1, 2, 3, 4], // Contrôle Miroir 1
  [1, 2, 3, 4, 3, 2, 1, 4, 1, 2, 3, 4], // Miroir 2
  [1, 2, 3, 4, 3, 1, 2, 4, 1, 2, 3, 4], // Contrôle Miroir 2
  [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2], // token:2 ; repetition: 6
  [1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3], // token:3 ; repetition: 4
  [1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4], // token:4 ; repetition: 3
  [1, 1, 2, 2, 3, 3, 1, 1, 2, 2, 3, 3], // token:3 ; repetition: 2levels/nested
  [1, 2, 2, 2, 2, 1, 1, 2, 1, 1, 1, 2], // token:2 ; repetition: 6; control
  [1, 2, 3, 1, 3, 2, 2, 3, 1, 2, 1, 3], // token:3 ; repetition: 4; control; no structure
  [1, 2, 3, 4, 3, 2, 4, 1, 1, 4, 2, 3], // token:4 ; repetition: 3; control
  [1, 2, 3, 1, 3, 2, 1, 2, 3, 1, 3, 2], // token:3 ; repetition: 2levels/nested; control 1 global repetition but not local
  [1, 1, 2, 2, 3, 3, 1, 1, 3, 3, 2, 2], // token:3 ; repetition: 2levels/nested; control 2 local repetition but not global
];

// const sequences = Object.values(mappedPatterns).flatMap((innerDict) =>
//   Object.values(innerDict)
// );

const training_sequences = [
  // only used for the training phase: use to train and calibrate experiment
  [1, 2, 3, 4, 1, 2, 3, 4],
  [1, 2, 3, 4, 5, 5, 4, 3, 2, 1],
  [1, 4, 6, 2, 5, 4, 4, 3, 1, 6, 4, 1],
];

/* 
======================================================
++++++++++++++++++++ Text holders ++++++++++++++++++++
======================================================
*/
// --------------------------------------------------------------
// -- Instructions
//
const instruction_training_end_eng = [
  'This is a smartphone experiment. Please do not use a computer for this experiment.',
  'Sequences of dots will be presented to you.',
  'Wait for the fixation cross to become black, then reproduce the sequence.',
  'Please maintain your gaze on the fixation cross at the center of the screen',
  'Bet on your answers and earn points!',
  'Choose a bet between 100 and 400 to validate your trial',
];

const instruction_training_end_fr = [
  'Cette expérience a été conçue pour smartphone. Veuillez ne pas utiliser un ordinateur.',
  'Des séquences de points vont vous être présentées.',
  'Attendez que la croix de fixation devienne noire, puis reproduisez la séquence.',
  "Merci de garder votre regard sur la croix de fixation au centre de l'écran.",
  'Pariez sur vos réponses et gagnez des points!',
  'Choisissez une mise entre 100 et 400 pour valider votre essai',
];
// --------------------------------------------------------------
// -- Training Text
//

const training_prompt_txt_eng = [
  '(1) Reproduce the sequence you just saw. (2) Bet 200 points.',
  'This sequence was easy ! You can bet a large amount of points.',
  'This sequence was super complex ! Maybe you should aim for a smaller bet.',
];
const training_prompt_txt_fr = [
  '(1) Reproduisez la séquence que vous venez de voir. (2) Pariez 200 points.',
  'Cette séquence était facile ! Vous pouvez miser un beaucoup de point.',
  'Cette séquence était très complexe ! Vous devriez peut-être opter pour une mise plus faible.',
];

const training_feedback_eng = ["Let's continue the training."];
const training_feedback_fr = ["Continuons l'entraînement."];

const transition_instructions_eng =
  '<div>Good job! You completed the training <br><br>The experiment will now start.<br>Stay focused!';
const transition_instructions_fr =
  "<div>Bien joué ! L'entraînement est terminé <br><br>L'expérience va maintenant commencer.<br>Restez concentré.e !";

// --------------------------------------------------------------
// -- Ending Text
//
const end_txt_fr =
  "L'expérience est terminée. Merci d'avoir participé ! Veuillez remplir le questionnaire suivant.";
const end_txt_eng =
  'You successfully completed the experiment. Thank you for your efforts ! Please fill in the following survey.';

const next_txt_fr = 'Vous avez répondu';
const next_txt_eng = 'You responded';

// --------------------------------------------------------------
// -- Language selection
//

if (lan_selected === 'fr') {
  var instruction_training_end = instruction_training_end_fr;
  var end_txt = `<div style="font-size:25px; font-family:'sans-serif'">${end_txt_fr}</div>`;
  var next_txt = next_txt_fr;
  var training_prompt_txt = training_prompt_txt_fr;
  var training_feedback_txt = training_feedback_fr;
  var transition_instructions = transition_instructions_fr;
} else {
  var instruction_training_end = instruction_training_end_eng;
  var end_txt = `<div style="font-size:25px; font-family:'sans-serif'">${end_txt_eng}</div>`;
  var next_txt = next_txt_eng;
  var training_prompt_txt = training_prompt_txt_eng;
  var training_feedback_txt = training_feedback_eng;
  var transition_instructions = transition_instructions_eng;
}

/* 
============================================================
++++++++++++++ Building the stimuli collection +++++++++++++
============================================================
*/

// Sequences need to be presented in random order.
const shuffled_sequences = [];
for (let i = 0; i < nb_repetition; i++) {
  shuffled_sequences.push(...shuffle_seq(sequences));
}

// Keep temporal structure but randomize the starting points.

var randomized_sequences = randomize_points(shuffled_sequences);

// We put training sequences and testing sequences with preserved structure in a same object. Used to tag sequences and to keep the original structure.
const original_sequence_train_test = [
  ...training_sequences,
  ...Array(1)
    .fill([...shuffled_sequences])
    .flat(),
];

// We put training sequences and testing sequences (already randomized and shuffled) in a same object. Used to present stimuli to participants.
const sequence_train_test = [
  ...training_sequences,
  ...Array(1)
    .fill([...randomized_sequences])
    .flat(),
];

// ---------------------------------------------------
// TAG GEOMETRICAL AND TEMPORAL STRUCTURE OF SEQUENCES
//
// -- Temporal structure
const all_sequences_temp_tags = Array(training_sequences.length).fill(
  'training'
);

shuffled_sequences.forEach((sequence) => {
  for (const key in dict_sequences) {
    const values = dict_sequences[key];

    // Check if the current sequence matches values
    if (JSON.stringify(sequence) === JSON.stringify(values)) {
      all_sequences_temp_tags.push(key);
      break;
    }
  }
});

//TODO : shuffled_sequences

/* 
============================================================
+++++++++++++++++ Participant Data Variables +++++++++++++++
============================================================
*/

// ---------------------------------------------------------------------
// --- Fill the participantData object which will be sent to the server.
//
var participantData = new ParticipantCl();
