"use strict";

var lan_selected = sessionStorage.getItem("language-selected") || "en";
var experiment_name = sessionStorage.getItem("experiment_name");
let right_dimension_questions = {};

// -- Retrieve Participant Data
let participant_data = sessionStorage.getItem("participant_object");
if (participant_data) {
  // Parse the JSON string back into an object
  participant_data = JSON.parse(participant_data);
} else {
  console.log("No data found in sessionStorage.");
}

// -- Modify the participant's ID to modify the name of the JSON file (avoid erasing data if there's an issue when reloading the page)
let participantID = "";

/* 
==========================================
+++++++++++++++ Survey Code ++++++++++++++
==========================================
*/

// ------ Questions experiment
const questions_exp_fr = [
  "Je visualisais les formes géométriques tracées par les points",
  "Je me souvenais de la structure abstraites de la séquence (groupe de points, répétitions, miroirs, etc.)",
  "Je transformais les points en note de musique",
  "J'utilisais mes doigts ou mon corps comme aide de mémoire",
  "J'ai converti les positions en nombre de 1 à 6 (ex: 123123123123).",
];

const questions_exp_eng = [
  "I visualized the geometric shapes drawn by the points",
  "I remembered the abstract structure of the sequence (group of points, repetitions, mirrors, etc.)",
  "I transformed the points into musical notes",
  "I used my fingers or body as a memory support",
  "I transformed the positions into numérical values from 1 to 6 (ex: 123123123123).",
];

// ----- Questions expérience auditive interne
const questions_auditory_fr = [
  "J'ai souvent du mal à reconnaître ou à me souvenir des mélodies.",
  "Je peux facilement distinguer différents instruments de musique ou voix.",
  "J'ai déjà eu l'impression de 'voir' la musique dans mon esprit, même lorsqu'aucune musique extérieure ne joue.",
  "Il m'arrive de ressentir que je n'ai pas de voix intérieure qui parle dans ma tête.",
];

const questions_auditory_eng = [
  "I often struggle to recognize or remember melodies.",
  "I can easily distinguish between different musical instruments or voices.",
  "I have often felt like I am 'hearing' music in my mind, even when no external music is playing.",
  "I sometimes feel like I don't have an inner voice that speaks in my mind.",
];

const option_exp_fr = [
  "Pas du tout d'accord",
  "Pas d'accord",
  "Ne sais pas",
  "D'accord",
  "Entièrement d'accord",
];

const option_exp_eng = [
  "Strongly disagree",
  "Disagree",
  "I don't know",
  "Agree",
  "Strongly Agree",
];
// ------ Instructions

const instructions_eng = [
  "First, a few questions about your strategies during the experiment you just did.",
  "To end the questionnaire, please rate these items about your internal auditory experience.",
];

const instructions_fr = [
  "Tout d'abord, quelques questions sur les stratégies utilisées pendant l'expérience que vous venez de faire",
  "Pour clôturer ce questionnaire, veuillez juger les items suivant sur votre expérience auditive interne.",
];
// ------ Language selection

if (lan_selected == "fr") {
  var instructions = instructions_fr;
  var questions_strategy = questions_exp_fr;
  var options_exp = option_exp_fr;
  var questions_auditory = questions_auditory_fr;
} else {
  var instructions = instructions_eng;
  var questions_strategy = questions_exp_eng;
  var options_exp = option_exp_eng;
  var questions_auditory = questions_auditory_eng;
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

// Add questions about the experiment itself
const exp_questions = questions_strategy.map((question) => ({
  question,
  options: options_exp,
}));

// Add questions about internal auditory processes
const auditory_questions = questions_auditory.map((question) => ({
  question,
  options: options_exp,
}));

const questions = exp_questions.concat(auditory_questions);

//--------------------
function loadQuestions() {
  const surveyForm = document.getElementById("surveyForm");

  questions.forEach((q, index) => {
    // Insert instruction above every four questions
    if (index % 5 === 0 && instructions[Math.floor(index / 5)]) {
      const instructionText = document.createElement("p");
      instructionText.className = "instruction";
      instructionText.textContent = instructions[Math.floor(index / 5)];
      surveyForm.appendChild(instructionText);
    }

    const formGroup = document.createElement("div");
    formGroup.className = "form-group";

    const questionText = document.createElement("div");
    questionText.className = "question";
    questionText.textContent = `${index + 1}. ${q.question}`;
    formGroup.appendChild(questionText);

    // Assigning numeric values to each option
    q.options.forEach((option, optionIndex) => {
      const label = document.createElement("label");
      label.className = "option";

      const input = document.createElement("input");
      input.type = "radio";
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
      alert("Please answer all questions.");
      return;
    }
    responses[`question${index + 1}`] = parseInt(answer.value, 10); // Store numeric value
  }

  console.log(responses);

  document.getElementById("thankYouMessage").textContent =
    lan_selected === "fr"
      ? "Réponses enregistrées. Merci pour votre participation!"
      : "Your responses have been recorded. Thank you for completing the survey!";

  document.getElementById("thankYouModal").style.display = "flex"; // Show modal
  document.getElementById("surveyForm").style.display = "none";
  document.querySelector(".submit-btn").style.display = "none";

  // Put the Responses to the right dimensions
  let my_key = "participant_id";
  let given_dim_participantData = participant_data[my_key].length;
  for (let [key, val] of Object.entries(responses)) {
    right_dimension_questions[key] = Array(given_dim_participantData).fill(val);
  }

  // Merge Objects
  Object.assign(participant_data, right_dimension_questions);

  // Changes the ID to ID_withSurvey
  let current_id = participant_data["participant_id"][0];
  let new_id = current_id + "_surveyComplete";

  // Send data
  saveParticipantData(experiment_name, new_id, participant_data);
}

window.onload = loadQuestions;
