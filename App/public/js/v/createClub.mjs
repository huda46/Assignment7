import { handleAuthentication } from "./accessControl.mjs";
import Club, {StatusEL, WeekDaysEL} from "../m/Club.mjs";
import Member from "../m/Member.mjs";
import Staff from "../m/Staff.mjs";
import Person from "../m/Person.mjs";
import { fillSelectWithOptions, createChoiceWidget, hideProgressBar,
  showProgressBar, createMultiSelectionWidget } from "../../lib/util.mjs";
import { auth } from "../initFirebase.mjs";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js";


handleAuthentication();

/**********************************************
 * Use case Create Club
 **********************************************/
const formEl = document.forms["Create"],
  progressEl = document.querySelector("progress"),
  daysFieldsetEl = formEl.querySelector("fieldset[data-bind='days']"),
  createTrainerWidget = formEl.querySelector(".MultiSelectionWidget");

await createMultiSelectionWidget (formEl, [], "staffs",
  "id", "personId", Staff.checkPersonIdAsIdRef, Staff.retrieve);

fillSelectWithOptions(formEl["status"], StatusEL.labels, true);
createChoiceWidget( daysFieldsetEl, "days", [],
  "checkbox", WeekDaysEL.labels);

let userRef = null;
onAuthStateChanged(auth, async function (user) {
  if (user) {
    const userId = user.uid;
    const memberRec = await Member.retrieve( userId);
    userRef = memberRec;
    formEl["chair_id"].value = memberRec.firstname + " " + memberRec.lastname;
  }
});

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
formEl["location"].addEventListener("input", async function () {
  const responseValidation = Club.checkLocation( formEl["location"].value);
  formEl["location"].setCustomValidity( responseValidation.message);
});


// handle Create button click events
formEl["commit"].addEventListener("click", async function () {
  if (!formEl["clubId"].value) return;
  const addedTrainersListEl = createStaffWidget.children[1];
  const addedMembersListEl = createStaffWidget.children[1]; // ul
  const slots = {
      clubId: formEl["clubId"].value,
      name: formEl["name"].value,
      status: formEl["status"].value,
      trainerIdRefs: [],
      chair_id: formEl["chair"].value,
      fee: formEl["fee"].value,
      description: formEl["description"].value,
      contactInfo: formEl["contactInfo"].value,
      clubMemberIdRefs: [],
      startDate: formEl["startDate"].value,
      endDate: formEl["endDate"].value,
      daysInWeek: formEl["daysInWeek"].value,
      location: formEl["location"].value,
    };
  // check all input fields and show error messages
  formEl["clubId"].setCustomValidity(
    (await Club.checkclubIdAsId( slots.clubId)).message);
  formEl["name"].setCustomValidity(
    ( Club.checkName( slots.name)).message);
  formEl["status"].setCustomValidity(
    ( Club.checkStatus( slots.status)).message);
  formEl["fee"].setCustomValidity(
    ( Club.checkFee( slots.fee)).message);
  formEl["description"].setCustomValidity(
    ( Club.checkFee( slots.description)).message);
  formEl["contactInfo"].setCustomValidity(
    ( Club.checkContactInfo( slots.contactInfo)).message);
  formEl["startDate"].setCustomValidity(
    ( Club.checkStartDate( slots.startDate)).message);
  formEl["endDate"].setCustomValidity(
    ( Club.checkEndDate( slots.endDate)).message);
  formEl["daysInWeek"].setCustomValidity(
    ( Club.checkDaysInWeek( slots.daysInWeek)).message);
  formEl["location"].setCustomValidity(
    ( Club.checkLocation( slots.location)).message);
  const responseValidation = await Staff.checkPersonIdAsIdRef( slots.chair_id);
  formEl["staff"].setCustomValidity( responseValidation.message);
  if (addedTrainersListEl.children.length) {
    for (const trainerItemEl of addedTrainersListEl.children) {
      const trainer = JSON.parse(trainerItemEl.getAttribute("data-value"));
      const responseValidation = await Staff.checkTrainerIdAsIdRef(trainer.id);
      if (responseValidation.message) {
        formEl["trainers"].setCustomValidity(responseValidation.message);
        break;
      } else {
        slots.trainerIdRefs.push(trainer);
        formEl["trainers"].setCustomValidity("");
      }
    }
  } else formEl["trainers"].setCustomValidity(
    formEl["trainers"].value ? "" : "No trainer selected!");
  // save the input data only if all form fields are valid
  if (formEl.reportValidity()) {
    showProgressBar(progressEl);
    await Club.add( slots);
    formEl.reset();
    addedTrainersListEl.innerHTML = "";
    hideProgressBar(progressEl);
  }
});
