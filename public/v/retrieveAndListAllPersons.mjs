/**
 * @fileOverview  View methods for the use case "retrieve and list persons"
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
const tableBodyEl = document.querySelector("table#persons>tbody");

/***************************************************************
 Render list of all person records
 ***************************************************************/
// for each person, create a table row with a cell for each attribute
for (const personRec of personRecords) {
  const row = tableBodyEl.insertRow();
  row.insertCell().textContent = personRec.personId;
  row.insertCell().textContent = personRec.name;
  row.insertCell().textContent = personRec.type;
}
