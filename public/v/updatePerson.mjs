/**
 * @fileOverview  View methods for the use case "update person"
 * @author Gerd Wagner
 * @author Juan-Francisco Reyes
 */
/***************************************************************
 Import classes and data types
 ***************************************************************/
import Person from "../m/Person.mjs";

/***************************************************************
 Load data
 ***************************************************************/
const personRecords = await Person.retrieveAll();

/***************************************************************
 Declare variables for accessing UI elements
 ***************************************************************/
const formEl = document.forms["Person"],
  updateButton = formEl["commit"],
  selectPersonEl = formEl["selectPerson"];

/***************************************************************
 Set up select element
 ***************************************************************/
// fill select with options
for (const personRec of personRecords) {
  const optionEl = document.createElement("option");
  optionEl.text = personRec.name;
  optionEl.value = personRec.personId;
  selectPersonEl.add( optionEl, null);
}
// when a person is selected, fill the form with its data
selectPersonEl.addEventListener("change", async function () {
  const personId = selectPersonEl.value;
  if (personId) {
    // retrieve up-to-date person record
    const personRec = await Person.retrieve( personId);
    formEl["personId"].value = personRec.personId;
    formEl["name"].value = personRec.name;
    formEl["type"].value = personRec.type;// muss Enumeration sein
  } else {
    formEl.reset();
  }
});

/******************************************************************
 Add event listeners for the update/submit button
 ******************************************************************/
// set an event handler for the update button
updateButton.addEventListener("click", async function () {
  const slots = {
    personId: formEl["personId"].value,
    name: formEl["name"].value,
    type: formEl["type"]
  },
    personIdRef = selectPersonEl.value;
  if (!personIdRef) return;
  await Person.update( slots);
  // update the selection list option element
  selectPersonEl.options[selectPersonEl.selectedIndex].text = slots.title;
  formEl.reset();
});
