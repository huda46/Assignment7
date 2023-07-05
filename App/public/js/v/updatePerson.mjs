/***************************************************************
 Import classes and data types
 ***************************************************************/
import Person from "../m/Person.mjs";
import { PersonTypeEL } from "../m/Person.mjs";
import { fillSelectWithOptions } from "../../lib/util.mjs"; 
import { handleAuthentication } from "./accessControl.mjs";

/***************************************************************
 Setup and handle UI Authentication
 ***************************************************************/
 handleAuthentication();

/***************************************************************
 Load data
 ***************************************************************/
const personRecords = await Person.retrieveAll();

/***************************************************************
 Declare variables for accessing UI elements
 ***************************************************************/
const formEl = document.forms["Person"],
  updateButton = formEl["commit"],
  typeEl = formEl["type"],
  selectPersonEl = formEl["selectPerson"];

// Add event listeners for responsive validation
  formEl["name"].addEventListener("input", function () {
    formEl["name"].setCustomValidity(
      Person.checkName( formEl["name"].value).message);
  });
  formEl["type"].addEventListener("input", function () {
    formEl["type"].setCustomValidity(
      Person.checkType( formEl["type"].value).message);
  });
/***************************************************************
 Set up (choice) widgets
 ***************************************************************/
 fillSelectWithOptions(personRecords, selectPersonEl, "personId", "name");
// when a person is selected, fill the form with its data
selectPersonEl.addEventListener("change", async function () {
  const personkey = selectPersonEl.value;
  if (personkey) {
    // retrieve up-to-date person record
    const personRecord = await Person.retrieve( personkey);
    for (const field of ["personId", "name", "type"]) {
      formEl[field].value = personRecord[field] !== undefined ? personRecord[field] : "";
      // delete custom validation error message which may have been set before
      formEl[field].setCustomValidity("");
    }
  } else {
    formEl.reset();
  }
});

// set up the type selection list
fillSelectWithOptions( typeEl, PersonTypeEL.labels, true);

updateButton.addEventListener("click", function () {
  const formEl = document.forms["Person"],
    selectPersonEl = formEl["selectPerson"],
    personIdRef = selectPersonEl.value;
  if (!personIdRef) return;
  const slots = {
    personId: formEl["personId"].value,
    name: formEl["name"].value,
    type: formEl["type"].value
  };
  // set error messages in case of constraint violations
  formEl["name"].addEventListener("input", function () {
    formEl["name"].setCustomValidity(
      Person.checkName( slots.name).message);
  });
  formEl["type"].addEventListener("input", function () {
    formEl["type"].setCustomValidity(
      Person.checkType( slots.type).message);
  });
  if (formEl.checkValidity()) {
    Person.update( slots);
    // update the selection list option
    selectPersonEl.options[selectPersonEl.selectedIndex].text = slots.name;
    formEl.reset();
  }
});
// neutralize the submit event
formEl.addEventListener("submit", function (e) {
  e.preventDefault();
});
