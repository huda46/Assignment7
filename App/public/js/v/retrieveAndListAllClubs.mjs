/***************************************************************
 Import classes and data types
 ***************************************************************/
import Club, { StatusEL } from "../m/Club.mjs";
import { handleAuthentication } from "./accessControl.mjs";
import { showProgressBar, hideProgressBar } from "../../lib/util.mjs";

/***************************************************************
 Setup and handle UI Access Control
 ***************************************************************/
handleAuthentication();

const selectOrderEl = document.querySelector("main>div>div>label>select");
const tableEl = document.getElementById("clubs");
const tableBodyEl = tableEl.querySelector("tbody"),
  progressEl = document.querySelector("progress"),
  previousBtnEl = document.getElementById("previousPage"),
  nextBtnEl = document.getElementById("nextPage");

// initialize pagination mapping references
let cursor = null,
  previousPageRef = null,
  nextPageRef = null,
  startAtRefs = [];
let order = "clubId"; // default order value

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
 *  another order was selected
 */
selectOrderEl.addEventListener("change", async function (e) {
  order = e.target.value;
  startAtRefs = [];
  // invoke list with order parameter selected
  await createBlock( e.target.value);
  previousBtnEl.disabled = true;
  nextBtnEl.disabled = false;
});

/***************************************************************
 Render list of all club records
 ***************************************************************/
async function createBlock(startAt) {
  tableBodyEl.innerHTML = "";
  showProgressBar( progressEl);
  const clubRecs = await Club.retrieveBlock({"order": order, "cursor": startAt});
  if (clubRecs.length) {
    // set page references for current (cursor) page
    cursor = clubRecs[0][order];
    // set next startAt page reference, if not next page, assign "null" value
    nextPageRef = (clubRecs.length < 21) ? null : clubRecs[clubRecs.length - 1][order];
    for (const clubRec of clubRecs) {
      const row = tableBodyEl.insertRow(-1);
      row.insertCell(-1).textContent = clubRec.clubId;
      row.insertCell(-1).textContent = clubRec.name;
      row.insertCell(-1).textContent = StatusEL.labels[clubRec.type-1];
    }
  }
  hideProgressBar(progressEl);
}