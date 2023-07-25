import { handleAuthentication } from "./accessControl.mjs";
import Club, {StatusEL, WeekDaysEL} from "../m/Club.mjs";
import Member from "../m/Member.mjs";
import { fillSelectWithOptions, createChoiceWidget, hideProgressBar,
  showProgressBar, createMultiSelectionWidget } from "../../lib/util.mjs";
import { auth } from "../initFirebase.mjs";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js";


handleAuthentication();

/**********************************************
 * Use case Update Club
 **********************************************/
const formEl = document.forms["Update"],
  progressEl = document.querySelector("progress"),
  daysFieldsetEl = formEl.querySelector("fieldset[data-bind='days']"),
  createTrainerWidget = formEl.querySelector(".MultiSelectionWidget"),
  clubId = localStorage.getItem("clubNo");


fillSelectWithOptions(formEl["status"], StatusEL.labels, true);

let userRef = null;
onAuthStateChanged(auth, async function (user) {
  if (user) {
    const userId = user.uid;
    const memberRec = await Member.retrieve( userId);
    userRef = memberRec;
    formEl["chair_id"].value = memberRec.firstname + " " + memberRec.lastname;
  }
});

const clubRec = await Club.retrieve( clubId);
formEl["clubId"].value = clubRec.clubId;
formEl["name"].value = clubRec.name;
formEl["status"].selectedIndex = clubRec.status - 1;
formEl["fee"].value = clubRec.fee;
formEl["description"].value = clubRec.description;
formEl["contactInfo"].value = clubRec.contactInfo;
formEl["startDate"].value = clubRec.startDate;
formEl["endDate"].value = clubRec.endDate;
formEl["time"].value = clubRec.time;
formEl["location"].value = clubRec.location;
formEl["chair_id"].value = clubRec.chair_id.lastname;
createChoiceWidget( daysFieldsetEl, "days", clubRec.daysInWeek,
  "checkbox", WeekDaysEL.labels);
await createMultiSelectionWidget (formEl, clubRec.trainerIdRefs, "trainers",
  "personId", "personId", Member.checkPersonIdAsIdRef, Member.retrieve);

// set up event handlers for responsive constraint validation
formEl["clubId"].addEventListener("input", async function () {
  const responseValidation = await Club.checkClubIdAsId( formEl["clubId"].value);
  formEl["clubId"].setCustomValidity( responseValidation.message);
});
formEl["name"].addEventListener("input", async function () {
  const responseValidation = Club.checkName( formEl["name"].value);
  formEl["name"].setCustomValidity( responseValidation.message);
});
formEl["status"].addEventListener("input", async function () {
  const responseValidation = Club.checkStatus( formEl["status"].value);
  formEl["status"].setCustomValidity( responseValidation.message);
});
formEl["fee"].addEventListener("input", async function () {
  const responseValidation = Club.checkFee( formEl["fee"].value);
  formEl["fee"].setCustomValidity( responseValidation.message);
});
formEl["description"].addEventListener("input", async function () {
  const responseValidation = Club.checkDescription( formEl["description"].value);
  formEl["description"].setCustomValidity( responseValidation.message);
});
formEl["contactInfo"].addEventListener("input", async function () {
  const responseValidation = Club.checkContactInfo( formEl["contactInfo"].value);
  formEl["contactInfo"].setCustomValidity( responseValidation.message);
});
formEl["startDate"].addEventListener("input", async function () {
  const responseValidation = Club.checkStartDate( formEl["startDate"].value);
  formEl["startDate"].setCustomValidity( responseValidation.message);
});
formEl["endDate"].addEventListener("input", async function () {
  const responseValidation = Club.checkEndDate( formEl["endDate"].value);
  formEl["endDate"].setCustomValidity( responseValidation.message);
});
formEl["time"].addEventListener("input", async function () {
  const responseValidation = Club.checkTime( formEl["time"].value);
  formEl["time"].setCustomValidity( responseValidation.message);
});
formEl["location"].addEventListener("input", async function () {
  const responseValidation = Club.checkLocation( formEl["location"].value);
  formEl["location"].setCustomValidity( responseValidation.message);
});
// mandatory value check constraint for checkbox group
daysFieldsetEl.addEventListener("click", function () {
  const val = daysFieldsetEl.getAttribute("data-value");
  formEl["days"][0].setCustomValidity(
    (!val || Array.isArray(val) && val.length === 0) ?
      "At least one day must be selected!":"" );
});


// handle Create button click events
formEl["commit"].addEventListener("click", async function () {
  if (!formEl["clubId"].value) return;
  const addedTrainersListEl = createTrainerWidget.children[1];
  const slots = {
    clubId: formEl["clubId"].value,
    name: formEl["name"].value,
    status: formEl["status"].value,
    trainerIdRefs: [],
    chair_id: {personId: userRef.personId, lastname: userRef.lastname},
    fee: formEl["fee"].value,
    description: formEl["description"].value,
    contactInfo: formEl["contactInfo"].value,
    clubMemberIdRefs: [],
    startDate: formEl["startDate"].value,
    endDate: formEl["endDate"].value,
    daysInWeek: JSON.parse( daysFieldsetEl.getAttribute("data-value")),
    time: formEl["time"].value,
    location: formEl["location"].value,
  };

  // check all input fields and show error messages
  formEl["clubId"].setCustomValidity(
    (await Club.checkClubIdAsId( slots.clubId)).message);
  formEl["name"].setCustomValidity(
    ( Club.checkName( slots.name)).message);
  formEl["status"].setCustomValidity(
    ( Club.checkStatus( slots.status)).message);

  let msg = (Club.checkFee( slots.fee)).message;
  if (!msg) {
    if (parseInt(slots.status) === 4 && parseInt(slots.fee) !== 0) {
      msg = "The fee needs to be 0, if beta phase is selected!";
    } 
  }
  formEl["fee"].setCustomValidity(msg);
  formEl["description"].setCustomValidity(
    ( Club.checkDescription( slots.description)).message);
  formEl["contactInfo"].setCustomValidity(
    ( Club.checkContactInfo( slots.contactInfo)).message);
  formEl["endDate"].setCustomValidity(
    ( Club.checkEndDate( slots.endDate)).message);
    
  msg = (Club.checkStartDate( slots.startDate)).message;
  if (!msg) {
    const end = new Date(slots.endDate);
    const start = new Date(slots.startDate);
    if (end < start) {
      msg = "The start date can`t be after the end date!";
    } 
  }
  formEl["startDate"].setCustomValidity(msg);
  formEl["days"][0].setCustomValidity(
    ( Club.checkDaysInWeek( slots.daysInWeek)).message);
  formEl["location"].setCustomValidity(
    ( Club.checkLocation( slots.location)).message);
  formEl["time"].setCustomValidity(
    ( Club.checkTime( slots.time)).message);
  if (addedTrainersListEl.children.length) {
    for (const trainerItemEl of addedTrainersListEl.children) {
      const trainer = JSON.parse(trainerItemEl.getAttribute("data-value"));
      slots.trainerIdRefs.push(trainer);
      formEl["trainers"].setCustomValidity("");
    }
  } else formEl["trainers"].setCustomValidity(
    formEl["trainers"].value ? "" : "No trainer selected!");

  // save the input data only if all form fields are valid
  if (formEl.reportValidity()) {
    showProgressBar(progressEl);
    await Club.update( slots);
    hideProgressBar(progressEl);
  }
});  

formEl.addEventListener("submit", function (e) {
  e.preventDefault();
});
