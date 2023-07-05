/***************************************************************
 Import classes and data types
 ***************************************************************/
import Person from "../m/Person.mjs";
import { handleAuthentication } from "./accessControl.mjs";
import { fillSelectWithOptions } from "../../lib/util.mjs";
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
  deleteButton = formEl["commit"],
  selectPersonEl = formEl["selectPerson"];

/***************************************************************
 Set up (choice) widgets
 ***************************************************************/
// set up the person selection list
fillSelectWithOptions( personRecords, selectPersonEl, "personId", "name");

/********************************************************************
 Add further event listeners, especially for the delete/submit button
 ********************************************************************/
deleteButton.addEventListener("click", function () {
  const personIdRef = selectPersonEl.value;
  if (!personIdRef) return;
  if (confirm("Do you really want to delete this person record?")) {
    Person.destroy( personIdRef);
    // remove deleted person from select options
    selectPersonEl.remove(selectPersonEl.selectedIndex);
  }
});