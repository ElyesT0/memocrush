"use strict";

const saveParticipantData = (
  experiment_name_loc,
  initial_participantID,
  participantData_loc
) => {
  var participantID_loc = initial_participantID;
  console.log("sending data");
  console.log("sent object POST : ", {
    experiment_name: experiment_name_loc,
    participantID: participantID_loc,
    participantData: participantData_loc,
  });
  axios

    .post(`https://etabbane.fr:3456/api/saveParticipantData`, {
      experiment_name: experiment_name_loc,
      participantID: participantID_loc,
      participantData: participantData_loc,
    })
    .then((response) => {
      console.log("Data successfully saved:", response.data);
    })
    .catch((error) => {
      console.error("Error saving data:", error);
    });
};

// SUB-PART
// -----------------------
// SANITY CHECKS FUNCTIONS
// -----------------------
function sanity_check_data_JSON() {
  const data = {
    sequences_temp_tags: all_sequences_temp_tags,
    sequences_geom_tags: all_sequences_geom_tags,
    sequences_original: original_sequence_train_test,
    sequences_shown: sequence_train_test,
  };

  // helper for download
  function downloadJSON(obj, filename) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // download both sessions separately
  downloadJSON(data, "data_sanityCheck.json");
}
