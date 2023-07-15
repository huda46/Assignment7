import { handleAuthentication } from "./accessControl.mjs";
import Club from "../m/Club.mjs";
import Member from "../m/Member.mjs";
import { PersonTypeEL } from "../m/Person.mjs";
import { createListFromMap, hideProgressBar, showProgressBar, createMultiSelectionWidget }
  from "../../lib/util.mjs";
import { auth } from "../initFirebase.mjs";


handleAuthentication();

/***************************************************************
 Declare variables for accessing UI elements
 ***************************************************************/
const formUpEl = document.forms["Update"],
  formDeEl = document.forms["Delete"];

/**********************************************
 * Use case Update Club
 **********************************************/
const firstnameEl = formUpEl["firstname"],
  lastnameEl = formUpEl["lastname"],
  typeEl = formUpEl["type"],
  progressEl = formUpEl.querySelector("progress"),
  commitBtn = formUpEl["commit"];

// set up the type selection list
fillSelectWithOptions( typeEl, PersonTypeEL.labels, true);

// TODO: get memberId is todo! (no solution yet)
const userId = auth.currentUser.uid;
console.log(`the current user id is ${userId}`);
if (formUpEl["clubId"].checkValidity() && formUpEl["clubId"].value) {
  const clubRec = await Club.retrieve( formUpEl["clubId"].value);
  formUpEl["clubId"].value = clubRec.clubId;
  formUpEl["name"].value = clubRec.name;
  formUpEl["status"].value = clubRec.status;
  formUpEl["description"].value = clubRec.description;
  formUpEl["contactInfo"].value = clubRec.contactInfo;
  formUpEl["startDate"].value = clubRec.startDate;
  formUpEl["endDate"].value = clubRec.endDate;
  formUpEl["daysInWeek"].value = clubRec.daysInWeek;
  if (clubRec.chair_id) formUpEl["chair"].value = clubRec.chair_id;
  updateTrainerWidget.innerHTML = "";
  await createMultiSelectionWidget (formUpEl, clubRec.trainerIdRefs,
    "trainers", "id", "trainerId",
    Trainer.checkTrainerIdAsIdRef, Trainer.retrieve);
} else {
  formUpEl.reset();
}

/******************************************************************
 Add event listeners for input of data
 ******************************************************************/

firstnameEl.addEventListener("input", function () {
  firstnameEl.setCustomValidity( Member.checkName( firstnameEl.value).message);
});
lastnameEl.addEventListener("input", function () {
  lastnameEl.setCustomValidity( Member.checkName( lastnameEl.value).message);
});
typeEl.addEventListener("input", function () {
  typeEl.setCustomValidity( Member.checkType( typeEl.value).message);
});


/******************************************************************
 Add event listeners for the commit button
 ******************************************************************/
commitBtn.addEventListener("click", async function () {
  const slots = {
    personId: formUpEl["memberId"].value,
    firstname: formUpEl["firstname"].value,
    lastname: formUpEl["lastname"].value,
    type: formUpEl["type"].value
  };

  formUpEl["firstname"].setCustomValidity( Member.checkName( slots.firstname).message);
  formUpEl["lastname"].setCustomValidity( Member.checkName( slots.lastname).message);
  formUpEl["type"].setCustomValidity( Member.checkType( slots.type).message);
  
  // commit the update only if all form field values are valid
  if (formUpEl.reportValidity()) {
    showProgressBar( progressEl);
    await Member.update( slots);
    // drop widget content
    formUpEl.reset();
    hideProgressBar( progressEl);
  }
});

/**********************************************
 * Use case Delete Club
 **********************************************/

// TODO: get memberId! (no solution yet)
const responseValidation = await Club.checkClubIdAsId( formDeEl["clubId"].value);
formDeEl["clubId"].setCustomValidity( responseValidation.message);

// commit delete only if all form field values are valid
if (formDeEl.checkValidity()) {
  // handle Delete button click events
  formDeEl["commit"].addEventListener("click", async function () {
    const clubIdRef = formDeEl["clubId"].value;
    if (!clubIdRef) return;
    if (confirm("Do you really want to delete your account?")) {
      await Club.destroy(clubIdRef);
      formDeEl.reset();
    }
  });
}