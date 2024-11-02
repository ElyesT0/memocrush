'use strict';
/* 
======================================================
++++++++ Scoring and Performance Functions +++++++++++
======================================================
*/

// Damerau Levenshtein
function compute_damerau_levenshtein(answer, original_sequence) {
  /**
   * Computes the Damerau-Levenshtein distance between two arrays.
   * This metric accounts for insertions, deletions, substitutions,
   * and transpositions of adjacent elements.
   *
   * @param {Array} answer - The first array to compare.
   * @param {Array} original_sequence - The second array to compare.
   * @return {Number} - The Damerau-Levenshtein distance between the two arrays.
   */

  var i;
  var j;
  var cost;
  var d = new Array();
  answer = answer.join('');
  original_sequence = original_sequence.join('');

  if (answer.length == 0) {
    let dist = original_sequence.length;
  }

  if (original_sequence.length == 0) {
    let dist = answer.length;
  }

  for (i = 0; i <= answer.length; i++) {
    d[i] = new Array();
    d[i][0] = i;
  }

  for (j = 0; j <= original_sequence.length; j++) {
    d[0][j] = j;
  }

  for (i = 1; i <= answer.length; i++) {
    for (j = 1; j <= original_sequence.length; j++) {
      if (answer.charAt(i - 1) == original_sequence.charAt(j - 1)) {
        cost = 0;
      } else {
        cost = 1;
      }

      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost
      );

      if (
        i > 1 &&
        j > 1 &&
        answer.charAt(i - 1) == original_sequence.charAt(j - 2) &&
        answer.charAt(i - 2) == original_sequence.charAt(j - 1)
      ) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
      }
    }
  }

  return d[answer.length][original_sequence.length]; //Damerau-Levenshtein distance
}

// -------------------------------------------------------------------------------------------

// Token Error
function is_token_error(answer, original_sequence) {
  /**
   * Compares two arrays and returns whether they have different unique items.
   *
   * This function converts both input arrays into sets and checks if they contain the same unique elements.
   * If the sets are identical (contain the same unique items), the function returns false.
   * Otherwise, it returns true.
   *
   * @param {Array} answer - The first array to compare.
   * @param {Array} original_sequence - The second array to compare.
   * @return {Boolean} - Returns false if both arrays contain the same unique elements, true otherwise.
   */

  let set_answer = new Set(answer);
  let set_original = new Set(original_sequence);

  // Check if the sets have the same size
  if (set_answer.size !== set_original.size) {
    return true;
  }

  // Check if all items in set_answer are also in set_original
  for (let item of set_answer) {
    if (!set_original.has(item)) {
      return true;
    }
  }

  // If the sets are identical, return false
  return false;
}

// -------------------------------------------------------------------------------------------

// Score updating
function update_score(
  answer,
  original_sequence,
  current_score,
  bet,
  correct_threshold_tmp = correct_threshold
) {
  /**
   * Updates the score based on the answer's similarity to the original sequence, considering token errors
   * and Damerau-Levenshtein distance, with adjustments based on a betting factor and a correctness threshold.
   *
   * @param {string} answer - The user's answer to be evaluated.
   * @param {string} original_sequence - The original sequence to compare the answer against.
   * @param {number} current_score - The user's current score.
   * @param {number} bet - The betting factor influencing score adjustments.
   * @param {number} [correct_threshold_tmp=correct_threshold] - Optional threshold for determining acceptable distance.
   * @returns {Object} An object containing the updated score, Damerau-Levenshtein distance, and token error status.
   * @property {number} score - The new score after adjustments.
   * @property {number} dl_distance - The Damerau-Levenshtein distance between the answer and the original sequence.
   * @property {boolean} tokenErr - Indicates if there was a token error in the answer.
   */

  let score_update;
  let new_score;
  let dl_distance_tmp;
  let tokenErr_tmp = is_token_error(answer, original_sequence);

  dl_distance_tmp = compute_damerau_levenshtein(answer, original_sequence);

  // CASE: Token Error.
  if (tokenErr_tmp) {
    score_update = -100 * bet;
    playSound = 'neg1';
    positive_streak = 0;
  }
  // CASE: not a token error
  else {
    // -- CASE: Distance is WITHIN the defined threshold. POSITIVE addition to score.
    if (dl_distance_tmp == 0) {
      score_update = 100 * bet;
      playSound =
        positive_streak <= soundPosHolder.length
          ? soundPosHolder[positive_streak]
          : soundPosHolder[soundPosHolder.length - 1];
      positive_streak += 1;
    } else if (dl_distance_tmp <= correct_threshold_tmp) {
      score_update = (100 * bet) / dl_distance_tmp;
      playSound =
        positive_streak <= soundPosHolder.length
          ? soundPosHolder[positive_streak]
          : soundPosHolder[soundPosHolder.length - 1];
      positive_streak += 1;
    }
    // -- CASE: Distance is OUTSIDE the defined threshold. NEGATIVE addition to score.
    else {
      if (original_sequence.length - dl_distance_tmp == 0) {
        score_update = -100 * bet;
      } else {
        score_update =
          (-100 * bet) / (original_sequence.length - dl_distance_tmp);
      }
      playSound = 'neg1';
      positive_streak = 0;
    }
  }

  // Round score update
  score_update = Math.round(score_update);

  // Update the score
  if (current_score + score_update > 0) {
    new_score = current_score + score_update;
  } else {
    new_score = 0;
  }

  // During training we don't want the score to move
  if (state == 'training') {
    new_score = initial_score;
  }

  // Update Textual Feedback
  select_feedbackTxt(tokenErr_tmp, score_update, dl_distance_tmp);

  console.log('score update: ', score_update);
  console.log('new score: ', new_score);
  console.log('original_sequence.length : ', original_sequence.length);
  console.log('dl_distance_tmp : ', dl_distance_tmp);

  return {
    score: new_score,
    dl_distance: dl_distance_tmp,
    tokenErr: tokenErr_tmp,
  };
}

// -------------------------------------------------------------------------------------------
function select_feedbackTxt(token_err_bool, score_update, dl_distance_tmp) {
  /**
   * Sets feedback text based on token error status and Damerau-Levenshtein distance (dl_distance).
   * Chooses feedback message in either French or English depending on the selected language.
   *
   * @param {boolean} token_err_bool - Indicates whether there is a token error.
   * @returns {void}
   */

  let feedbackTXT;
  if (token_err_bool) {
    feedbackTXT =
      lan_selected === 'fr' ? 'Erreur de position' : 'Wrong position';
  } else {
    switch (dl_distance_tmp) {
      case 0:
        feedbackTXT = lan_selected === 'fr' ? 'Parfait !' : 'Flawless!';
        break;

      case 1:
        feedbackTXT =
          lan_selected === 'fr' ? 'Incroyable !' : 'Genius! Keep it up!';
        break;

      case 2:
        feedbackTXT =
          lan_selected === 'fr'
            ? 'Génial ! Presque parfait !'
            : 'Amazing! Almost perfect!';
        break;

      case 3:
        feedbackTXT =
          lan_selected === 'fr'
            ? 'Très bien !'
            : 'Great! You’re getting there!';
        break;

      case 4:
        feedbackTXT = lan_selected === 'fr' ? 'Bravo !' : 'Well done!';
        break;

      case 5:
        feedbackTXT = lan_selected === 'fr' ? 'Presque !' : 'Almost there!';
        break;

      case 6:
        feedbackTXT =
          lan_selected === 'fr'
            ? "Bien joué, c'était presque ça !"
            : 'Well played, it was almost that !';
        break;

      case 7:
        feedbackTXT =
          lan_selected === 'fr'
            ? 'Pas loin ! Encore un petit effort !'
            : 'That was close! Keep it up!';
        break;

      default:
        feedbackTXT = lan_selected === 'fr' ? 'Faux.' : 'Try again!';
        break;
    }
  }

  // Adjust the text and the sign of the score update to the dl distance.
  element_selectors.txt_container.innerHTML =
    score_update < 0
      ? `${feedbackTXT}<br><br>${score_update}`
      : `${feedbackTXT}<br><br><div style="font-size:50px"> +${score_update}</div>`;
}

// -------------------------------------------------------------------------------------------

function visual_feedback() {
  let visual_feedback_class;
  if (tokenErr) {
    visual_feedback_class = 'fail';
  } else {
    if (dl_distance < 3) {
      // CASE: Success
      visual_feedback_class = 'success';
    } else if (dl_distance < correct_threshold) {
      // CASE: Moderate success
      visual_feedback_class = 'moderate--failure';
    } else {
      // CASE: Fail
      visual_feedback_class = 'fail';
    }
  }

  bodyElement.classList.add(visual_feedback_class);
  setTimeout(() => {
    bodyElement.classList.remove(visual_feedback_class);
    setTimeout(() => {
      bodyElement.classList.add(visual_feedback_class);
    }, 150);
  }, 150);
}

// -------------------------------------------------------------------------------------------

function readAndPlayMp3(soundFile) {
  let soundPath = `ressources/sounds/${soundFile}.mp3`;

  const audio = new Audio(soundPath);
  audio
    .play()
    .then(() => console.log('Playing MP3 file'))
    .catch((error) => console.error('Error playing MP3:', error));
}
