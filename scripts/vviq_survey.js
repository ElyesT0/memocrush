"use strict";

var lan_selected = sessionStorage.getItem("language-selected") || "en";
var experiment_name = sessionStorage.getItem("experiment_name");
let right_dimension_questions = {};
const submit_btn = document.querySelector(".submit-btn");
const vviqResults = {};
/* 
==========================================
+++++++++++++++ Survey Code ++++++++++++++
==========================================
*/

// ------ options
const options_vviq_eng = [
  'No image at all (only "knowing" that you are thinking of the object)',
  "Vague, and dim",
  "Moderately clear and vivid",
  "Clear and reasonably vivid",
  "Perfectly clear and as vivid as normal vision",
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
  "Le contour exact de son visage, de sa tête, de ses épaules et de son corps",
  "La manière dont cet.te ami.e tient sa tête, les postures de son corps, etc.",
  "Sa démarche précise, la longueur de ses pas, etc.",
  "Les différentes couleurs de certains de ses vêtements habituels",
  "Le soleil se lève à l'horizon dans un ciel brumeux",
  "Le ciel s'éclaircit et entoure le soleil de bleu",
  "Nuages. Une tempête éclate avec des éclairs",
  "Un arc-en-ciel apparaît",
  "La devanture du magasin qui se trouve de l'autre côté de la rue",
  "Une vitrine avec les couleurs, la forme et les détails des articles en vente",
  "Vous êtes proche de l'entrée. La couleur, la forme et les détails de la porte",
  "Vous entrez dans le magasin et vous allez vers la caisse. Le commerçant vous sert, vous lui donnez l'argent qu'il prend.",
  "Les contours du paysage",
  "La couleur et la forme des arbres",
  "La couleur et la forme du lac",
  "Un vent fort s'abat sur les arbres et sur le lac en produisant des vagues",
];

const questions_eng = [
  "The exact contour of face, head, shoulders, and body.",
  "Characteristic poses of head, attitudes of body, etc.",
  "The precise carriage, length of step, etc., in walking.",
  "The different colors worn in some familiar clothes.",
  "The sun is rising above the horizon into a hazy sky.",
  "The sky clears and surrounds the sun with blueness.",
  "Clouds. A storm blows up, with flashes of lightning.",
  "A rainbow appears",
  "The overall appearance of the shop from the opposite side of the road.",
  "A window display including colors, shapes, and details of individual items for sale",
  "You are near the entrance. The color, shape, and details of the door.",
  "You enter the shop and go to the counter. The counter assistant serves you. Money changes hands.",
  "The contours of the landscape",
  "The color and shape of the trees.",
  "The color and shape of the lake.",
  "A strong wind blows on the trees and on the lake, causing waves.",
];

// ------ Instructions

const instructions_eng = [
  "We'll perform a visual imagery test. Think of some relative or friend who you frequently see (but who is not with you at present), and consider carefully the picture that comes before your mind's eye. Then rate the following items:",
  "Visualize a rising sun. Consider carefully the picture that comes before your mind's eye. Then rate the following items:",
  "Think of the front of a shop to which you often go. Consider carefully the picture that comes before your mind's eye. Then rate the following items:",
  "Finally, think of a country scene which involves trees, mountains and a lake. Consider carefully the picture that comes before your mind's eye. Then rate the following items:",
];

const instructions_fr = [
  "Nous allons faire un test d'imagination visuelle. Imaginez attentivement l'image d'un.e ami.e que vous voyez fréquemment et qui n'est pas présent.e en ce moment. Puis évaluez les caractéristiques suivantes.",
  "Imaginez le lever du soleil. Analysez attentivement l'image qui apparaît.",
  "Imaginez un magasin dans lequel vous allez souvent. Analysez en détail l'image qui vous vient à l'esprit.",
  "Imaginez une scène de campagne avec des arbres, des montagnes, un lac. Analysez, en détail, les images que vous viennent à l'esprit.",
];
// ------ Language selection

if (lan_selected == "fr") {
  var questions_survey = questions_fr;
  var instructions = instructions_fr;
  var options_vviq = options_vviq_fr;
} else {
  var questions_survey = questions_eng;
  var instructions = instructions_eng;
  var options_vviq = options_vviq_eng;
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

//--------------------
function loadQuestions() {
  const surveyForm = document.getElementById("surveyForm");

  vviq_questions.forEach((q, index) => {
    // Insert instruction above every four questions
    if (index % 4 === 0 && instructions[Math.floor(index / 4)]) {
      const instructionText = document.createElement("p");
      instructionText.className = "instruction";
      instructionText.textContent = instructions[Math.floor(index / 4)];
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

/*
  Save answers to the questionnaire in the session storage.
*/
function save_vviq() {
  for (let i = 0; i < vviq_questions.length; i++) {
    const answer = document.querySelector(`input[name="q${i}"]:checked`);

    if (!answer) {
      alert("Please answer all questions.");
      return;
    }

    vviqResults[`VVIQ${i + 1}`] = Number(answer.value);
  }
  // ✅ if loop completes, all questions are answered
  console.log("Saving data");
  sessionStorage.setItem("vviqResults", JSON.stringify(vviqResults));
  window.location.href = "main.html";
}

submit_btn.addEventListener("touchend", () => save_vviq());

window.onload = loadQuestions;
