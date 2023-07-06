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
 Declare variable to cancel observer, DB-UI sync
 ***************************************************************/
let cancelListener = null;

/***************************************************************
 Set up (choice) widgets
 ***************************************************************/
// set up the person selection list
fillSelectWithOptions( personRecords, selectPersonEl, "personId", "name");

/*******************************************************************
 Setup listener on the selected person record synchronising DB with UI
 ******************************************************************/
// set up listener to document changes on selected person record
selectPersonEl.addEventListener("change", async function () {
  const personKey = selectPersonEl.value;
  if (personKey) {
    // cancel record listener if a previous listener exists
    if (cancelListener) cancelListener();
    // add listener to selected person, returning the function to cancel listener
    cancelListener = await Person.observeChanges( personKey);
  }
});

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
// set event to cancel DB listener when the browser window/tab is closed
window.addEventListener("beforeunload", function () {
  if (cancelListener) cancelListener();
});