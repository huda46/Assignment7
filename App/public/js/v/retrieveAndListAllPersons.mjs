/***************************************************************
 Import classes and data types
 ***************************************************************/
import Person from "../m/Person.mjs";
import { PersonTypeEL } from "../m/Person.mjs";
import { handleAuthentication } from "./accessControl.mjs";
import { showProgressBar, hideProgressBar } from "../../lib/util.mjs";

 handleAuthentication();

 const selectOrderEl = document.querySelector("main>div>div>label>select");
 const tableBodyEl = document.querySelector("table#persons>tbody"),
   progressEl = document.querySelector("progress");

await retrieveAndListAllPersons();

selectOrderEl.addEventListener("change", async function (e) {
  // invoke list with order parameter selected
  await retrieveAndListAllPersons( e.target.value);
});
/***************************************************************
 Render list of all person records
 ***************************************************************/
async function retrieveAndListAllPersons( order) {
  tableBodyEl.innerHTML = "";
  showProgressBar( progressEl);
  // load all person records using order param
  const personRecords = await Person.retrieveAll( order);
  // for each person, create a table row with a cell for each attribute
  for (const p of personRecords) {
    let row = tableBodyEl.insertRow();
    row.insertCell(-1).textContent = p.personId;
    row.insertCell(-1).textContent = p.name;
    row.insertCell(-1).textContent = PersonTypeEL.labels[p.type-1];
  }
  hideProgressBar( progressEl);
}