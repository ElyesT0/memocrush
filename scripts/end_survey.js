'use strict';

var lan_selected = sessionStorage.getItem('language-selected') || 'en';
var experiment_name = sessionStorage.getItem('experiment_name');
let right_dimension_questions = {};

// -- Retrieve Participant Data
let participant_data = sessionStorage.getItem('participant_object');
if (participant_data) {
  // Parse the JSON string back into an object
  participant_data = JSON.parse(participant_data);
} else {
  console.log('No data found in sessionStorage.');
}

// -- Modify the participant's ID to modify the name of the JSON file (avoid erasing data if there's an issue when reloading the page)
let participantID = '';

/* 
==========================================
+++++++++++++++ Survey Code ++++++++++++++
==========================================
*/

// ------ options
const options_vviq_eng = [
  'No image at all (only "knowing" that you are thinking of the object)',
  'Vague, and dim',
  'Moderately clear and vivid',
  'Clear and reasonably vivid',
  'Perfectly clear and as vivid as normal vision',
];

const options_vviq_fr = [
  "Aucune image n'est visible (seulement 'la connaissance' que vous pensez à l'objet)",
  "L'image est vague et imprécise",
  "L'image est moyennement nette et vivace",
  "L'image est relativement nette, presque aussi précise et vivace qu'une perception",
  "L'image est parfaitement nette, aussi précise et vivace qu'une véritable perception",
];

// ------ Questions VVIQ
const questions_fr = [
  'Le contour exact de son visage, de sa tête, de ses épaules et de son corps',
  'La manière dont cet.te ami.e tient sa tête, les postures de son corps, etc.',
  'Sa démarche précise, la longueur de ses pas, etc.',
  'Les différentes couleurs de certains de ses vêtements habituels',
  "Le soleil se lève à l'horizon dans un ciel brumeux",
  "Le ciel s'éclaircit et entoure le soleil de bleu",
  'Nuages. Une tempête éclate avec des éclairs',
  'Un arc-en-ciel apparaît',
  "La devanture du magasin qui se trouve de l'autre côté de la rue",
  'Une vitrine avec les couleurs, la forme et les détails des articles en vente',
  "Vous êtes proche de l'entrée. La couleur, la forme et les détails de la porte",
  "Vous entrez dans le magasin et vous allez vers la caisse. Le commerçant vous sert, vous lui donnez l'argent qu'il prend.",
  'Les contours du paysage',
  'La couleur et la forme des arbres',
  'La couleur et la forme du lac',
  "Un vent fort s'abat sur les arbres et sur le lac en produisant des vagues",
];

const questions_eng = [
  'The exact contour of face, head, shoulders, and body.',
  'Characteristic poses of head, attitudes of body, etc.',
  'The precise carriage, length of step, etc., in walking.',
  'The different colors worn in some familiar clothes.',
  'The sun is rising above the horizon into a hazy sky.',
  'The sky clears and surrounds the sun with blueness.',
  'Clouds. A storm blows up, with flashes of lightning.',
  'A rainbow appears',
  'The overall appearance of the shop from the opposite side of the road.',
  'A window display including colors, shapes, and details of individual items for sale',
  'You are near the entrance. The color, shape, and details of the door.',
  'You enter the shop and go to the counter. The counter assistant serves you. Money changes hands.',
  'The contours of the landscape',
  'The color and shape of the trees.',
  'The color and shape of the lake.',
  'A strong wind blows on the trees and on the lake, causing waves.',
];

// ------ Questions experiment
const questions_exp_fr = [
  'Je visualisais les formes géométriques tracées par les points',
  'Je me souvenais de la structure abstraites de la séquence (groupe de points, répétitions, miroirs, etc.)',
  'Je transformais les points en note de musique',
  "J'utilisais mes doigts ou mon corps comme aide de mémoire",
];

const questions_exp_eng = [
  'I visualized the geometric shapes drawn by the points',
  'I remembered the abstract structure of the sequence (group of points, repetitions, mirrors, etc.)',
  'I transformed the points into musical notes',
  'I used my fingers or body as a memory support',
];

const option_exp_fr = [
  "Pas du tout d'accord",
  "Pas d'accord",
  'Ne sais pas',
  "D'accord",
  "Entièrement d'accord",
];

const option_exp_eng = [
  'Strongly disagree',
  'Disagree',
  "I don't know",
  'Agree',
  'Strongly Agree',
];
// ------ Instructions

const instructions_eng = [
  'First, a few questions about your strategies during the experiment you just did.',
  "Now, we'll perform a visual imagery test. Think of some relative or friend who you frequently see (but who is not with you at present), and consider carefully the picture that comes before your mind's eye. Then rate the following items:",
  "Visualize a rising sun. Consider carefully the picture that comes before your mind's eye. Then rate the following items:",
  "Think of the front of a shop to which you often go. Consider carefully the picture that comes before your mind's eye. Then rate the following items:",
  "Finally, think of a country scene which involves trees, mountains and a lake. Consider carefully the picture that comes before your mind's eye. Then rate the following items:",
];

const instructions_fr = [
  "Tout d'abord, quelques questions sur les stratégies utilisées pendant l'expérience que vous venez de faire",
  "Maintenant, nous allons faire un test d'imagination visuelle. Imaginez attentivement l'image d'un.e ami.e que vous voyez fréquemment et qui n'est pas présent.e en ce moment. Puis évaluez les caractéristiques suivantes.",
  "Imaginez le lever du soleil. Analysez attentivement l'image qui apparaît.",
  "Imaginez un magasin dans lequel vous allez souvent. Analysez en détail l'image qui vous vient à l'esprit.",
  "Imaginez une scène de campagne avec des arbres, des montagnes, un lac. Analysez, en détail, les images que vous viennent à l'esprit.",
];
// ------ Language selection

if (lan_selected == 'fr') {
  var questions_survey = questions_fr;
  var instructions = instructions_fr;
  var options_vviq = options_vviq_fr;
  var questions_strategy = questions_exp_fr;
  var options_exp = option_exp_fr;
} else {
  var questions_survey = questions_eng;
  var instructions = instructions_eng;
  var options_vviq = options_vviq_eng;
  var questions_strategy = questions_exp_eng;
  var options_exp = option_exp_eng;
}

// ----- Combine Questions

// Map `questions_exp` to have a similar structure to `vviq_questions`
// const experiment_questions = questions_exp.map((question) => ({
//   question,
//   options: options_exp,
// }));

// // Use `Object.assign` to add `experiment_questions` at the beginning of `questions`
// const questions = Object.assign([], experiment_questions, questions_survey);

// ----- Questions

const vviq_questions = questions_survey.map((question) => ({
  question,
  options: options_vviq,
}));

// Add questions about the experiment itself
const exp_questions = questions_strategy.map((question) => ({
  question,
  options: options_exp,
}));

const questions = exp_questions.concat(vviq_questions);

//--------------------
function loadQuestions() {
  const surveyForm = document.getElementById('surveyForm');

  questions.forEach((q, index) => {
    // Insert instruction above every four questions
    if (index % 4 === 0 && instructions[Math.floor(index / 4)]) {
      const instructionText = document.createElement('p');
      instructionText.className = 'instruction';
      instructionText.textContent = instructions[Math.floor(index / 4)];
      surveyForm.appendChild(instructionText);
    }

    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';

    const questionText = document.createElement('div');
    questionText.className = 'question';
    questionText.textContent = `${index + 1}. ${q.question}`;
    formGroup.appendChild(questionText);

    // Assigning numeric values to each option
    q.options.forEach((option, optionIndex) => {
      const label = document.createElement('label');
      label.className = 'option';

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `q${index}`;
      input.value = optionIndex + 1; // Numeric value for each option
      input.required = true;

      label.appendChild(input);
      label.appendChild(document.createTextNode(option));
      formGroup.appendChild(label);
    });

    surveyForm.appendChild(formGroup);
  });
}

/* 
==========================================
++++++++++++++ Collect data ++++++++++++++
==========================================
*/
function submitSurvey() {
  const responses = {};

  for (let index = 0; index < questions.length; index++) {
    const answer = document.querySelector(`input[name="q${index}"]:checked`);
    if (!answer) {
      alert('Please answer all questions.');
      return;
    }
    responses[`question${index + 1}`] = parseInt(answer.value, 10); // Store numeric value
  }

  console.log(responses);

  document.getElementById('thankYouMessage').textContent =
    lan_selected === 'fr'
      ? 'Réponses enregistrées. Merci pour votre participation!'
      : 'Your responses have been recorded. Thank you for completing the survey!';

  document.getElementById('thankYouModal').style.display = 'flex'; // Show modal
  document.getElementById('surveyForm').style.display = 'none';
  document.querySelector('.submit-btn').style.display = 'none';

  // Put the Responses to the right dimensions
  let my_key = 'participant_id';
  let given_dim_participantData = participant_data[my_key].length;
  for (let [key, val] of Object.entries(responses)) {
    right_dimension_questions[key] = Array(given_dim_participantData).fill(val);
  }

  // Merge Objects
  Object.assign(participant_data, right_dimension_questions);

  // Changes the ID to ID_withSurvey
  let current_id = participant_data['participant_id'][0];
  let new_id = current_id + '_surveyComplete';

  // Send data
  saveParticipantData(experiment_name, new_id, participant_data);
}

window.onload = loadQuestions;
