import { handleAuthentication } from "./accessControl.mjs";
import Club from "../m/Club.mjs";
import Member from "../m/Member.mjs";
import Staff from "../m/Staff.mjs";
import Person from "../m/Person.mjs";
import { createListFromMap, hideProgressBar, showProgressBar, createMultiSelectionWidget }
  from "../../lib/util.mjs";


handleAuthentication();

const clubMSectionEl = document.getElementById("Club-M"),
  clubRSectionEl = document.getElementById("Club-R"),
  clubCSectionEl = document.getElementById("Club-C"),
  clubUSectionEl = document.getElementById("Club-U"),
  clubDSectionEl = document.getElementById("Club-D");

for (const btn of document.querySelectorAll("button.back-to-menu")) {
  btn.addEventListener("click", refreshManageDataUI);
}
// neutralize the submit event for all use cases
for (const frm of document.querySelectorAll("section > form")) {
  frm.addEventListener("submit", function (e) {
    e.preventDefault();
  });
}
/**********************************************
 * Use case Retrieve/List All clubs
 **********************************************/
for (const btn of document.querySelectorAll("button.back-to-menu")) {
  btn.addEventListener("click", refreshManageDataUI);
}
// neutralize the submit event for all use cases
for (const frm of document.querySelectorAll("section > form")) {
  frm.addEventListener("submit", function (e) {
    e.preventDefault();
  });
}
document.getElementById("RetrieveAndListAll")
  .addEventListener("click", async function () {
    clubMSectionEl.hidden = true;
    clubRSectionEl.hidden = false;
    await createBlock();
    startAtRefs.push( cursor); // set "first" startAt page reference
    previousBtnEl.disabled = true;
  });
async function createBlock (startAt) {
  tableBodyEl.innerHTML = "";
  showProgressBar( "Club-R");
  const clubRecs = await Club.retrieveBlock({"order": order, "cursor": startAt});
  if (clubRecs.length) {
    // set page references for current (cursor) page
    cursor = clubRecs[0][order];
    // set next startAt page reference, if not next page, assign "null" value
    nextPageRef = (clubRecs.length < 21) ? null : clubRecs[clubRecs.length - 1][order];
    for (const clubRec of clubRecs) {
    const listEl = createListFromMap( clubRec.trainerIdRefs, "name");
      const row = tableBodyEl.insertRow(-1);
      row.insertCell(-1).textContent = clubRec.clubId;
      row.insertCell(-1).textContent = clubRec.name;
      row.insertCell(-1).textContent = clubRec.status;
      row.insertCell(-1).textContent = clubRec.fee;
      row.insertCell(-1).textContent = clubRec.description;
      row.insertCell(-1).textContent = clubRec.contactInfo;
      row.insertCell(-1).textContent = clubRec.startDate;
      row.insertCell(-1).textContent = clubRec.endDate;
      row.insertCell(-1).textContent = clubRec.daysInWeek;
      row.insertCell(-1).textContent = clubRec.location;
      row.insertCell(-1).appendChild( listEl);
    }
  }
  hideProgressBar("Club-R");
}
/**
 * "Previous" button
 */
previousBtnEl.addEventListener("click", async function () {
  // locate current page reference in index of page references
  previousPageRef = startAtRefs[startAtRefs.indexOf( cursor) - 1];
  // create new page
  await createBlock( previousPageRef);
  // disable "previous" button if cursor is first page
  if (cursor === startAtRefs[0]) previousBtnEl.disabled = true;
  // enable "next" button if cursor is not last page
  if (cursor !== startAtRefs[startAtRefs.length -1]) nextBtnEl.disabled = false;
});
/**
 *  "Next" button
 */
nextBtnEl.addEventListener("click", async function () {
  await createBlock( nextPageRef);
  // add new page reference if not present in index
  if (!startAtRefs.find( i => i === cursor)) startAtRefs.push( cursor);
  // disable "next" button if cursor is last page
  if (!nextPageRef) nextBtnEl.disabled = true;
  // enable "previous" button if cursor is not first page
  if (cursor !== startAtRefs[0]) previousBtnEl.disabled = false;
});
selectOrderEl.addEventListener("change", async function (e) {
  order = e.target.value;
  startAtRefs = [];
  await createBlock();
  startAtRefs.push( cursor);
  previousBtnEl.disabled = true;
  nextBtnEl.disabled = false;
});
/**********************************************
 * Use case Create Club
 **********************************************/
const createFormEl = clubCSectionEl.querySelector("form"),
  createStaffWidget = createFormEl.querySelector(".MultiSelectionWidget");
await createMultiSelectionWidget (createFormEl, [], "staffs",
  "id", "personId", Person.checkPersonIdAsIdRef, Staff.retrieve);
  createMemberWidget = createFormEl.querySelector(".MultiSelectionWidget");
  await createMultiSelectionWidget (createFormEl, [], "members",
    "id", "personId", Person.checkPersonIdAsIdRef, Member.retrieve);
document.getElementById("Create").addEventListener("click", async function () {
  createFormEl.reset();
  clubMSectionEl.hidden = true;
  clubCSectionEl.hidden = false;
});
// set up event handlers for responsive constraint validation
createFormEl["clubId"].addEventListener("input", async function () {
  const responseValidation = await Club.checkClubIdAsId( createFormEl["clubId"].value);
  createFormEl["clubId"].setCustomValidity( responseValidation.message);
});
// handle Create button click events
createFormEl["commit"].addEventListener("click", async function () {
  if (!createFormEl["clubId"].value) return;
  const addedTrainersListEl = createStaffWidget.children[1];
  const addedMembersListEl = createStaffWidget.children[1]; // ul
  const slots = {
      clubId: createFormEl["clubId"].value,
      name: createFormEl["name"].value,
      status: createFormEl["status"].value,
      trainerIdRefs: [],
      chair_id: createFormEl["chair"].value,
      fee: createFormEl["fee"].value,
      description: createFormEl["description"].value,
      contactInfo: createFormEl["contactInfo"].value,
      clubMemberIdRefs: [],
      startDate: createFormEl["startDate"].value,
      endDate: createFormEl["endDate"].value,
      daysInWeek: createFormEl["daysInWeek"].value,
      location: createFormEl["location"].value,
    };
  // check all input fields and show error messages
  createFormEl["clubId"].setCustomValidity(
    (await Club.checkclubIdAsId( slots.clubId)).message);
  createFormEl["name"].setCustomValidity(
    (await Club.checkName( slots.name)).message);
  createFormEl["status"].setCustomValidity(
    (await Club.checkStatus( slots.status)).message);
  createFormEl["fee"].setCustomValidity(
    (await Club.checkFee( slots.fee)).message);
  createFormEl["description"].setCustomValidity(
    (await Club.checkFee( slots.description)).message);
  createFormEl["contactInfo"].setCustomValidity(
    (await Club.checkContactInfo( slots.contactInfo)).message);
  createFormEl["startDate"].setCustomValidity(
    (await Club.checkStartDate( slots.startDate)).message);
  createFormEl["endDate"].setCustomValidity(
    (await Club.checkEnddate( slots.endDate)).message);
  createFormEl["daysInWeek"].setCustomValidity(
    (await Club.checkDaysInWeek( slots.daysInWeek)).message);
  createFormEl["location"].setCustomValidity(
    (await Club.checkLocation( slots.location)).message);
  const responseValidation = await Staff.checkPersonIdAsIdRef( slots.chair_id);
  createFormEl["staff"].setCustomValidity( responseValidation.message);
  if (addedTrainersListEl.children.length) {
    for (const trainerItemEl of addedTrainersListEl.children) {
      const trainer = JSON.parse(trainerItemEl.getAttribute("data-value"));
      const responseValidation = await Staff.checkTrainerIdAsIdRef(trainer.id);
      if (responseValidation.message) {
        createFormEl["trainers"].setCustomValidity(responseValidation.message);
        break;
      } else {
        slots.trainerIdRefs.push(trainer);
        createFormEl["trainers"].setCustomValidity("");
      }
    }
  } else createFormEl["trainers"].setCustomValidity(
    createFormEl["trainers"].value ? "" : "No trainer selected!");
  // save the input data only if all form fields are valid
  if (createFormEl.checkValidity()) {
    showProgressBar("Club-C");
    await Club.add( slots);
    createFormEl.reset();
    addedTrainersListEl.innerHTML = "";
    hideProgressBar( "Club-C");
  }
});

/**********************************************
 * Use case Update Club
 **********************************************/
const updateFormEl = clubUSectionEl.querySelector("form"),
  updateTrainerWidget = updateFormEl.querySelector(".MultiSelectionWidget");
document.getElementById("Update").addEventListener("click", async function () {
  clubMSectionEl.hidden = true;
  clubUSectionEl.hidden = false;
  updateFormEl.reset();
  updateTrainerWidget.innerHTML = "";
});
/**
 * handle club clubId input: when a clubId is entered, and the
 * user changes focus, the form is populated with club data
 */
// set up event handlers for responsive constraint validation
updateFormEl["clubId"].addEventListener("input", async function () {
  const responseValidation = await Club.checkClubIdAsId( updateFormEl["clubId"].value);
  if (responseValidation) updateFormEl["clubId"].setCustomValidity( responseValidation.message);
  if (!updateFormEl["clubId"].value) {
    updateFormEl.reset();
    updateTrainerWidget.innerHTML = "";
  }
});
updateFormEl["clubId"].addEventListener("blur", async function () {
  if (updateFormEl["clubId"].checkValidity() && updateFormEl["clubId"].value) {
    const clubRec = await Club.retrieve( updateFormEl["clubId"].value);
    updateFormEl["clubId"].value = clubRec.clubId;
    updateFormEl["name"].value = clubRec.name;
    updateFormEl["status"].value = clubRec.status;
    updateFormEl["description"].value = clubRec.description;
    updateFormEl["contactInfo"].value = clubRec.contactInfo;
    updateFormEl["startDate"].value = clubRec.startDate;
    updateFormEl["endDate"].value = clubRec.endDate;
    updateFormEl["daysInWeek"].value = clubRec.daysInWeek;
    if (clubRec.chair_id) updateFormEl["chair"].value = clubRec.chair_id;
    updateTrainerWidget.innerHTML = "";
    await createMultiSelectionWidget (updateFormEl, clubRec.trainerIdRefs,
      "trainers", "id", "trainerId",
      Trainer.checkTrainerIdAsIdRef, Trainer.retrieve);
  } else {
    updateFormEl.reset();
  }
});
// handle Update button click events
updateFormEl["commit"].addEventListener("click", async function () {
  if (!updateFormEl["clubId"].value) return;
  const addedTrainersListEl = updateTrainerWidget.children[1], // ul
    slots = {
      clubId: updateFormEl["clubId"].value,
      name: updateFormEl["name"].value,
      status: updateFormEl["status"].value,
      trainerIdRefs: [],
      chair_id: updateFormEl["chair"].value,
      fee: updateFormEl["fee"].value,
      description: updateFormEl["description"].value,
      contactInfo: updateFormEl["contactInfo"].value,
      clubMemberIdRefs: [],
      startDate: updateFormEl["startDate"].value,
      endDate: updateFormEl["endDate"].value,
      daysInWeek: updateFormEl["daysInWeek"].value,
      location: updateFormEl["location"].value,
    };

  updateFormEl["name"].setCustomValidity(
    Club.checkName( slots.name).message);
  updateFormEl["status"].setCustomValidity(
    Club.checkStatus( slots.status).message);
  updateFormEl["fee"].setCustomValidity(
    Club.checkFee( slots.fee).message);
  updateFormEl["description"].setCustomValidity(
    Club.checkDescription( slots.description).message);
  updateFormEl["contactInfo"].setCustomValidity(
    Club.checkContactInfo( slots.contactInfo).message);
  updateFormEl["startDate"].setCustomValidity(
    Club.checkStartDate( slots.startDate).message);
  updateFormEl["endDate"].setCustomValidity(
    Club.checkEndDate( slots.endDate).message);
  updateFormEl["daysInWeek"].setCustomValidity(
    Club.checkDaysInWeek( slots.daysInWeek).message);
  const responseValidation = await Chair.checkNameAsIdRef( slots.chair_id);
  updateFormEl["chair"].setCustomValidity( responseValidation.message);
  if (addedTrainersListEl.children.length) {
    // construct trainerIdRefs-ToAdd/ToRemove lists
    const trainerIdRefsToAdd=[], trainerIdRefsToRemove=[];
    for (const trainerItemEl of addedTrainersListEl.children) {
      if (trainerItemEl.classList.contains("added")) {
        const trainer = JSON.parse(trainerItemEl.getAttribute("data-value"));
        const responseValidation = await Trainer.checkTrainerIdAsIdRef( trainer.id);
        if (responseValidation.message) {
          updateFormEl["trainers"].setCustomValidity( responseValidation.message);
          break;
        } else {
            trainersIdRefsToAdd.push( trainer);
          updateFormEl["trainers"].setCustomValidity( "");
        }
      }
      if (trainerItemEl.classList.contains("removed")) {
        const trainer = JSON.parse(trainerItemEl.getAttribute("data-value"));
        trainersIdRefsToRemove.push( trainer);
      }
    }
    // if the add/remove list is non-empty, create a corresponding slot
    if (trainerIdRefsToRemove.length > 0) {
      slots.trainerIdRefsToRemove = trainerIdRefsToRemove;
    }
    if (trainerIdRefsToAdd.length > 0) {
      slots.trainerIdRefsToAdd = trainerIdRefsToAdd;
    }
  } else updateFormEl["trainers"].setCustomValidity(
    updateFormEl["trainers"].value ? "" : "No trainer selected!");
  // commit the update only if all form field values are valid
  if (updateFormEl.checkValidity()) {
    showProgressBar( "Club-U");
    await Club.update( slots);
    // drop widget content
    updateFormEl.reset();
    updateTrainerWidget.innerHTML = ""; // ul
    hideProgressBar( "Club-U");
  }
});

/**********************************************
 * Use case Delete Club
 **********************************************/
const deleteFormEl = clubDSectionEl.querySelector("form");
document.getElementById("Delete").addEventListener("click", async function () {
  deleteFormEl.reset();
  clubMSectionEl.hidden = true;
  clubDSectionEl.hidden = false;
});
deleteFormEl["clubId"].addEventListener("input", async function () {
  const responseValidation = await Club.checkClubIdAsId( deleteFormEl["clubId"].value);
  deleteFormEl["clubId"].setCustomValidity( responseValidation.message);
});
// commit delete only if all form field values are valid
if (deleteFormEl.checkValidity()) {
  // handle Delete button click events
  deleteFormEl["commit"].addEventListener("click", async function () {
    const clubIdRef = deleteFormEl["clubId"].value;
    if (!clubIdRef) return;
    if (confirm("Do you really want to delete this club?")) {
      await Club.destroy(clubIdRef);
      deleteFormEl.reset();
    }
  });
}

console.log("testBranch-old branch is broken")


/**********************************************
 * Refresh the Manage clubs Data UI
 **********************************************/
function refreshManageDataUI() {
    // show the manage club UI and hide the other UIs
    clubMSectionEl.hidden = false;
    clubRSectionEl.hidden = true;
    clubCSectionEl.hidden = true;
    clubUSectionEl.hidden = true;
    clubDSectionEl.hidden = true;
  }
  
  /** Retrieve data and set up the club management UI */
  // set up Manage club UI
  refreshManageDataUI();