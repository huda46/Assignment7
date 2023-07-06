/***************************************************************
 Import classes and data types
 ***************************************************************/
import Person from "../m/Person.mjs";
import { PersonTypeEL } from "../m/Person.mjs";
import { fillSelectWithOptions } from "../../lib/util.mjs"; 
import { handleAuthentication } from "./accessControl.mjs";
import { showProgressBar, hideProgressBar } from "../../lib/util.mjs";

/***************************************************************
 Setup and handle UI Authentication
 ***************************************************************/
 handleAuthentication();

/***************************************************************
 Declare variables for accessing UI elements
 ***************************************************************/
const formEl = document.forms["Person"],
  typeEl = formEl["type"],
  createButton = formEl["commit"];
  //progressEl = document.querySelector("progress");

// set up the type selection list
fillSelectWithOptions( typeEl, PersonTypeEL.labels, true);
// add event listeners for responsive validation
formEl["personId"].addEventListener("input", function () {
  formEl["personId"].setCustomValidity( Person.checkPersonId( formEl["personId"].value).message);
});
formEl["name"].addEventListener("input", function () {
  formEl["name"].setCustomValidity( Person.checkName( formEl["name"].value).message);
});
formEl["type"].addEventListener("input", function () {
  formEl["type"].setCustomValidity( Person.checkType( formEl["type"].value).message);
});
/******************************************************************
 Add event listeners for the create/submit button
 ******************************************************************/
createButton.addEventListener("click", async function () {
  const formEl = document.forms["Person"],
  slots = {
  personId: formEl["personId"].value,
  name: formEl["name"].value,
  type: formEl["type"].value
  };
  // check constraints and set error messages
  //showProgressBar( progressEl);
  formEl["personId"].setCustomValidity(( await Person.checkPersonId( slots.personId)).message);
  formEl["name"].setCustomValidity( Person.checkName( slots.name).message);
  formEl["type"].setCustomValidity( Person.checkType( slots.type).message);
  if (formEl.checkValidity()) {
  await Person.add( slots);
  formEl.reset();
  }
  //hideProgressBar( progressEl);
});
// neutralize the submit event
formEl.addEventListener("submit", function (e) {
  e.preventDefault();
});
