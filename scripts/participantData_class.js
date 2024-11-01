'use strict';

class ParticipantCl {
  constructor() {
    this.sequences_temp_tags = 'toFill';

    this.sequences_original = 'toFill';
    this.sequences_shown = 'toFill';

    // -- Participant's Response data --
    this.participant_response_before = []; // This is the participant entry for every sequences presented BEFORE the reproduction state. Format: Array of arrays.
    this.participant_response_after = []; // This is the participant entry for every sequences presented during the reproduction state. Format: Array of arrays.
    this.participant_click_timings = []; // Participant click timings for every entry during reproduction. Format: Array of arrays.
    this.participant_interclick_durations = []; // Participant interclick timings for every entry during reproduction. Format: Array of arrays.
    this.participant_confidence = []; // Participant's confidence entries.
    this.participant_score = []; // Participant's score evolution.
    this.participant_state = []; // Tracks Training vs Main experiment trials. Takes either: "main_experiment" or "training" as values.
    this.participant_performance = []; // "success" if the sequence was correct, "fail" otherwise.
    this.participant_distance_dl = []; // Response Damerau-Levenshtein distance to original sequence (sequences_shown).
    this.participant_TokenErr = []; // Bool: True if the answer contains a token that was not presented. False otherwise.

    // -- Participant's parameters data --
    this.participant_id = 'toFill';
    this.participant_startTime = 'toFill';
    this.participant_screenWidth = 'toFill';
    this.participant_screenHeight = 'toFill';
    this.participant_language = 'toFill';
    this.participant_trialCounter = 'toFill';
    this.last_click = 'toFill';
    this.participant_zoom_level = []; // Tracks if the participant did not zoom. If the participant is on standard display, zoom level is 1.

    // -- Experimental parameters data --
    this.experiment_SOA = 'toFill';
    this.experiment_blink = 'toFill';
    this.experiment_rangeConfidence = 'toFill';

    // -- Survey Results --
    this.age = 'toFill';
    this.diplome = 'toFill';
    this.musicExp = 'toFill';
    this.musicScoreReading = 'toFill';
    this.instrumentProficiency = 'toFill';
    this.mathExp = 'toFill';
  }
}
