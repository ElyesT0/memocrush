'use strict';

const init = function (element_selectors) {
  fill_participant_obj(0);

  // [OK BUTTON] -- Make the OK button skip through instructions
  element_selectors['btn_ok'].addEventListener(keyEvent, () => {
    if (txt_counter < instruction_training_end.length) {
      element_selectors.txt_container.innerHTML =
        instruction_training_end[txt_counter];
      txt_counter += 1;
    } else {
      hideElements(instruction_elements, element_selectors);
      runTrial();
    }
  });

  // [CIRCLES] -- Make circles register answers
  for (let i = 0; i < element_selectors['circles'].length; i++) {
    element_selectors['circles'][i].addEventListener(keyEvent, () =>
      response(i + 1)
    );
  }

  // [CONFIDENCE] -- Make the confidence buttons record answers
  for (let i = 1; i < range_confidence + 1; i++) {
    document
      .getElementById(`confidence-${i}`)
      .addEventListener(keyEvent, () => {
        submit_response(i);
      });
  }

  // [NEXT] -- Make the NEXT button lead to next trial
  element_selectors.btn_next.addEventListener(keyEvent, () => {
    runTrial();
  });
};

/* 
======================================================
++++++++++ Experimental Timeline Functions +++++++++++
======================================================
*/

// -------------------------------------------------------------------------------------------

const runTrial = function () {
  var sequence = sequence_train_test[counter_presentation];
  // 0 - Clean the screen
  clearScreen();

  // -- Update progression bar
  let percentage_progression =
    100 * (counter_presentation / sequence_train_test.length);
  update_progression(percentage_progression);

  // -- Check if the experiment continues
  if (counter_presentation < sequence_train_test.length) {
    // 1. Show the Sequence
    presentation(sequence, element_selectors);

    // 2. CASE: Training State
    if (counter_presentation < training_sequences.length) {
      handle_training(counter_presentation, sequence);
    }

    // 2. CASE: Testing State
    else {
      handle_testing(counter_presentation, sequence);
    }

    // 3. CASE: Experiment Continues. Send partial data.
    saveParticipantData(
      experiment_name,
      participantData.participant_id[0],
      participantData
    );
  } else {
    // 3. CASE: Last trial ended. Shows end screen. Sends data.
    element_selectors.txt_container.innerHTML = end_txt;
    element_selectors.txt_container.classList.remove('feedback-txt');
    element_selectors.txt_container.classList.add('final-txt');
    revealElements(['txt_container'], element_selectors);
    saveParticipantData(
      experiment_name,
      participantData.participant_id[0],
      participantData
    );
    save_participant_data_browser(participantData);
  }
};

// -------------------------------------------------------------------------------------------
function presentation(sequence, element_selectors) {
  presentation_time = true;
  step = 'presentation';

  // Fixation Cross is back to being white
  fixation_blue(false);
  revealElements(experimental_elements, element_selectors);

  for (let i = 0; i < sequence.length; i++) {
    setTimeout(
      () => activate_point(element_selectors.circles[sequence[i] - 1]),
      SOA * (i + 1)
    );
  }
  setTimeout(() => {
    reproduction_state(response_phase_elements, element_selectors);
  }, SOA * sequence.length + set_delay);
}

// -------------------------------------------------------------------------------------------
function reproduction_state(response_phase_elements, element_selectors) {
  if (state == 'training') {
    revealElements(response_phase_elements_training, element_selectors);
  } else {
    // RevealElements for the response
    revealElements(response_phase_elements, element_selectors);
  }
  // Add visual responsiveness of the buttons
  responsive_circles(true);
  // Set the presentation tracker to FALSE
  presentation_time = false;
  step = 'response';
  // Fixation cross Becomes Blue
  fixation_blue(true);
}

// -------------------------------------------------------------------------------------------
function response(input) {
  // EventListener that will be attached to each CIRCLES
  //
  interclick = compute_interclick();
  if (interclick < 150) {
    return;
  }

  last_click = Date.now();
  // Two Cases
  // CASE: Presentation State
  if (presentation_time) {
    // Add Answers to response_before
    response_before.push(input);
  }
  // CASE: Reproduction State
  else {
    // -- FILL HOLDERS
    // Add Answers to response_after
    response_after.push(input);

    // Add timing to click_timings
    click_timings.push(last_click);

    // Add interclick to interclick_timings

    if (response_after.length > 1) {
      interclick_timings.push(interclick);
    }
  }
}
// -------------------------------------------------------------------------------------------

function submit_response(confidence) {
  // EventListener that will be attached to each CONFIDENCE button
  //
  // Apply under one condition: more than 3 positions have been entered.
  if (response_after.length < minimum_input_required) return;

  let answer = response_after;
  let original = sequence_train_test[counter_presentation];
  let score_update;

  confidence_entry = confidence;
  performance =
    JSON.stringify(answer) === JSON.stringify(original) ? 'success' : 'fail';

  // Compute and update new score -- function.
  ({ score, dl_distance, tokenErr } = update_score(
    answer,
    original,
    score,
    confidence
  ));

  // Score is updated visually
  element_selectors.txt_score.textContent = `score: ${score}`;
  // Append all new data to the participantData object -- function
  log_answers();
  // Reset all the holders -- function
  reset_holders();
  // Hide Answer buttons
  clearScreen();
  // - Increment the sequence counter
  counter_presentation += 1;
  // - Disable response button responsiveness
  responsive_circles(false);
  // Display Next Page -- function
  display_pageNext(confidence_entry);
}

// -------------------------------------------------------------------------------------------
function compute_interclick() {
  return Date.now() - last_click;
}

/* 
======================================================
++++++++++++++++ Transition functions +++++++++++++++
======================================================
*/

function display_pageNext(participant_input) {
  step = 'next';
  //display current score
  display_score(true);
  display_instructions(training_feedback_txt);
  clearScreen();

  if (state == 'training') {
    // console.log('REVEAL state -- TRAINING');
    revealElements(page_next_elements_training, element_selectors);
  } else {
    // console.log('REVEAL state -- MAIN');
    revealElements(page_next_elements, element_selectors);
    visual_feedback();
    readAndPlayMp3(playSound);
  }
}

function handle_training(counter_presentation, sequence) {
  display_score(false);
  state = 'training';
  // score stays at the same level
  score = initial_score;
  if (counter_presentation == 0) {
    element_selectors.prompt.innerHTML = training_prompt_txt[0];
    move_arrow(2, sequence);
  } else if (counter_presentation == 1) {
    element_selectors.prompt.innerHTML = training_prompt_txt[1];
    move_arrow(4, sequence);
  } else if (counter_presentation == 2) {
    element_selectors.prompt.innerHTML = training_prompt_txt[2];
    move_arrow(1, sequence);
  } else {
    element_selectors.prompt.innerHTML = training_prompt_txt[2];
  }
}

function handle_testing(counter_presentation, sequence) {
  state = 'testing';
  element_selectors.txt_container.classList.add('feedback-txt');
}

// -------------------------------------------------------------------------------------------

function reset_holders() {
  // Hold the responses: during presentation phase (response_before) and during the reproduction phase (response_after)
  response_before = [];
  response_after = [];

  // Hold the timings
  click_timings = [];
  interclick_timings = [];
}

// -------------------------------------------------------------------------------------------

function log_answers() {
  console.log('----- Logging Answers -----');
  participantData.participant_response_before.push(response_before);
  participantData.participant_response_after.push(response_after);
  participantData.participant_click_timings.push(click_timings);
  participantData.participant_interclick_durations.push(interclick_timings);
  participantData.participant_confidence.push(confidence_entry);
  participantData.participant_score.push(score);
  participantData.participant_state.push(state);
  participantData.participant_performance.push(performance);
  participantData.participant_distance_dl.push(dl_distance);
  participantData.participant_TokenErr.push(tokenErr);
  participantData.participant_zoom_level.push(getZoomLevel());

  if (counter_presentation == 0) {
    fill_participant_obj(1);
  } else {
    fill_participant_obj(2);
  }
}
// -------------------------------------------------------------------------------------------

function fill_participant_obj(state_fill) {
  //State_fill: indicates the state of the object updating depending on the value:
  // 0. if it's the initialization,
  // 1. First trial,
  // 2. Updating on subsequent trials
  if (state_fill == 0) {
    // Update Unique values
    participantData.participant_trialCounter =
      Array(1).fill(counter_presentation);

    participantData.last_click = Array(1).fill(last_click);

    // Update Constants (we need to keep every array at the same length)
    participantData.participant_id = Array(1).fill(participant_id);

    participantData.age = Array(1).fill(surveyResults['age']);

    participantData.diplome = Array(1).fill(surveyResults['diplome']);

    participantData.musicExp = Array(1).fill(surveyResults['musicExp']);

    participantData.musicScoreReading = Array(1).fill(
      surveyResults['musicScoreReading']
    );

    participantData.instrumentProficiency = Array(1).fill(
      surveyResults['instrumentProficiency']
    );

    participantData.mathExp = Array(1).fill(surveyResults['mathExp']);

    participantData.participant_language = Array(1).fill(lan_selected);

    participantData.participant_screenHeight = Array(1).fill(
      window.screen.height
    );
    participantData.participant_screenWidth = Array(1).fill(
      window.screen.width
    );

    participantData.participant_startTime = Array(1).fill(starting_time);

    participantData.experiment_SOA = Array(1).fill(SOA);

    participantData.experiment_blink = Array(1).fill(blink);

    participantData.experiment_rangeConfidence =
      Array(1).fill(range_confidence);

    participantData.last_click = last_click;
  } else if (state_fill == 1) {
    participantData.sequences_temp_tags = all_sequences_temp_tags.slice(0, 1);

    // Structure: pure temporal
    participantData.sequences_original = original_sequence_train_test.slice(
      0,
      1
    );

    // Sequences shown
    participantData.sequences_shown = sequence_train_test.slice(0, 1);
  } else {
    participantData.participant_trialCounter.push(counter_presentation + 1);

    // Update Constants (we need to keep every array at the same length)
    participantData.participant_id.push(participant_id);

    participantData.age.push(surveyResults['age']);

    participantData.diplome.push(surveyResults['diplome']);

    participantData.musicExp.push(surveyResults['musicExp']);

    participantData.musicScoreReading.push(surveyResults['musicScoreReading']);

    participantData.instrumentProficiency.push(
      surveyResults['instrumentProficiency']
    );

    participantData.mathExp.push(surveyResults['mathExp']);

    participantData.participant_language.push(lan_selected);

    participantData.participant_screenHeight.push(window.screen.height);
    participantData.participant_screenWidth.push(window.screen.width);

    participantData.participant_startTime.push(starting_time);

    participantData.experiment_SOA.push(SOA);

    participantData.experiment_blink.push(blink);

    participantData.experiment_rangeConfidence.push(range_confidence);

    participantData.sequences_temp_tags = all_sequences_temp_tags.slice(
      0,
      counter_presentation + 1
    );

    // Structure: pure temporal
    participantData.sequences_original = original_sequence_train_test.slice(
      0,
      counter_presentation + 1
    );

    // Sequences shown
    participantData.sequences_shown = sequence_train_test.slice(
      0,
      counter_presentation + 1
    );

    participantData.last_click = Array(counter_presentation + 1).fill(
      last_click
    );
  }

  console.log('ParticipantData = ', participantData);
}
// -------------------------------------------------------------------------------------------

function save_participant_data_browser(obj) {
  // Store the data as a JSON string in sessionStorage
  sessionStorage.setItem('participant_object', JSON.stringify(obj));

  // Set text inside the survey button
  if (lan_selected == 'fr') {
    element_selectors.btn_survey.innerHTML = 'Questionnaire';
  } else {
    element_selectors.btn_survey.innerHTML = 'Survey';
  }
  // Make the Go to survey button appear
  element_selectors.btn_survey.classList.remove('hidden');

  // Add the link to the survey page
  element_selectors.btn_survey.addEventListener(keyEvent, () => {
    window.location.href = 'end_survey.html';
  });
}
