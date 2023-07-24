import { handleAuthentication } from "./accessControl.mjs";
import Member from "../m/Member.mjs";
import { PersonTypeEL } from "../m/Person.mjs";
import { hideProgressBar, showProgressBar, fillSelectWithOptions } 
  from "../../lib/util.mjs";
import { auth } from "../initFirebase.mjs";
import { onAuthStateChanged, deleteUser } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js";

handleAuthentication();

/***************************************************************
 Declare variables for accessing UI elements
 ***************************************************************/
const formUpEl = document.forms["Update"],
  formDeEl = document.forms["Delete"];
const commitUpBtn = formUpEl["commit"],
  commitDeBtn = formDeEl["commit"];

/**********************************************
 * Use case Update Member
 **********************************************/
const memberIdEl = formUpEl["memberId"],
  firstnameEl = formUpEl["firstname"],
  lastnameEl = formUpEl["lastname"],
  typeEl = formUpEl["type"],
  progressEl = formUpEl.querySelector("progress");
  

onAuthStateChanged(auth, async function (user) {
  showProgressBar( progressEl);
  if (user) {
    const userId = user.uid;
    const responseValidation = await Member.checkPersonIdAsIdRef( userId);
    memberIdEl.setCustomValidity( responseValidation.message);
    commitUpBtn.disabled = responseValidation.message;
    commitDeBtn.disabled = responseValidation.message;
    memberIdEl.value = userId;
    
    const memberRec = await Member.retrieve( userId);
    firstnameEl.value = memberRec.firstname;
    lastnameEl.value = memberRec.lastname;
    typeEl.value = memberRec.type;
  }
  hideProgressBar(progressEl);
});

// set up the type selection list
fillSelectWithOptions( typeEl, PersonTypeEL.labels, true);

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
 commitUpBtn.addEventListener("click", async function () {
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
    //showProgressBar( progressEl);
    await Member.update( slots);
    //hideProgressBar( progressEl);
  }
});

/**********************************************
 * Use case Delete Member account
 **********************************************/

// handle Delete button click events
commitDeBtn.addEventListener("click", async function () {
  const memberIdRef = memberIdEl.value;
  if (!memberIdRef) return;
  if (confirm("Do you really want to delete your account?")) {
    await Member.destroy(memberIdRef);
    const user = auth.currentUser;
    deleteUser(user);
    alert (`Your account was successfully deleted!`);
    window.location.pathname = "/index.html"; // redirect user to start page
  }
});