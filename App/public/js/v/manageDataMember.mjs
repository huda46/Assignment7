/***************************************************************
 Import classes and data types
 ***************************************************************/
import Member from "../m/Member.mjs";
import { PersonTypeEL } from "../m/Person.mjs";
import { handleAuthentication } from "./accessControl.mjs";
import { showProgressBar, hideProgressBar } from "../../lib/util.mjs";
 
 /***************************************************************
  Setup and handle UI Access Control
  ***************************************************************/
handleAuthentication();

const selectOrderEl = document.querySelector("main>div>div>label>select");
const tableEl = document.getElementById("persons");
const tableBodyEl = tableEl.querySelector("tbody"),
  progressEl = document.querySelector("progress"),
  previousBtnEl = document.getElementById("previousPage"),
  nextBtnEl = document.getElementById("nextPage");

// initialize pagination mapping references
let cursor = null,
  previousPageRef = null,
  nextPageRef = null,
  startAtRefs = [];
let order = "personId"; // default order value

await createBlock();
startAtRefs.push( cursor); // set "first" startAt page reference
previousBtnEl.disabled = true;
 
 /**
  * "Previous" button
  */
previousBtnEl.addEventListener("click", async function () {
  // locate current page reference in index of page references
  previousPageRef = startAtRefs[startAtRefs.indexOf( cursor) - 1];
  // create new page
  await createBlock( previousPageRef);
  // disable "previous" button if cursor is first page
  if (cursor === startAtRefs[0]) previousBtnEl.disabled = true;
  // enable "next" button if cursor is not last page
  if (cursor !== startAtRefs[startAtRefs.length -1]) nextBtnEl.disabled = false;
});
 
/**
 *  "Next" button clicked
 */
nextBtnEl.addEventListener("click", async function () {
  await createBlock( nextPageRef);
  // add new page reference if not present in index
  if (!startAtRefs.find( i => i === cursor)) startAtRefs.push( cursor);
  // disable "next" button if cursor is last page
  if (!nextPageRef) nextBtnEl.disabled = true;
  // enable "previous" button if cursor is not first page
  if (cursor !== startAtRefs[0]) previousBtnEl.disabled = false;
});
 
/**
 * handle order selection events: when an order is selected,
 * populate the list according to the selected order
 */
selectOrderEl.addEventListener("change", async function (e) {
  order = e.target.value;
  console.log(order);
  startAtRefs = [];
  // invoke list with order parameter selected
  await createBlock();
  startAtRefs.push( cursor);
  previousBtnEl.disabled = true;
  nextBtnEl.disabled = false;
});
 
/***************************************************************
 Render list of all member records
 ***************************************************************/
function updateButtonClicked() {
  alert('Hi there');
};
 
async function createBlock(startAt) {
  tableBodyEl.innerHTML = "";
  showProgressBar( progressEl);
  const memberRecs = await Member.retrieveBlock({"order": order, "cursor": startAt});
  if (memberRecs.length) {
    // set page references for current (cursor) page
    cursor = memberRecs[0][order];
    // set next startAt page reference, if not next page, assign "null" value
    nextPageRef = (memberRecs.length < 10) ? null : memberRecs[memberRecs.length - 1][order];
    for (const memberRec of memberRecs) {
      const row = tableBodyEl.insertRow(-1);

      row.insertCell(-1);
      var lastCell = row.cells[row.cells.length - 1];
      const checkbox = document.createElement('input');
      checkbox.type = "checkbox";
      lastCell.appendChild(checkbox);
      
      row.insertCell(-1).textContent = memberRec.personId;
      row.insertCell(-1).textContent = memberRec.firstname;
      row.insertCell(-1).textContent = memberRec.lastname;
      row.insertCell(-1).textContent = PersonTypeEL.labels[memberRec.type-1];

      row.insertCell(-1);
      lastCell = row.cells[row.cells.length - 1];
      const updateBtn = document.createElement('input');
      updateBtn.type = "button";
      updateBtn.className = "updateM";
      updateBtn.value = "update";
      updateBtn.onclick = (function() {updateButtonClicked()});
      lastCell.appendChild(updateBtn);
    }
  }
  hideProgressBar(progressEl);
};