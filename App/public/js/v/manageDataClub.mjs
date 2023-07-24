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
Render list of all club records
***************************************************************/
function infoButtonClicked(event) {
  const button = event.target;
  const parentRow = button.parentNode.parentNode;
  const columns = parentRow.getElementsByTagName('td');
  //save the club number for the next file
  localStorage.setItem('clubNo', columns[0].innerText);
  window.location.pathname = `/clubInfo.html`;
};

function addButtonClicked() {
  alert('Hi there');
};

function updateButtonClicked() {
  alert('Hi there');
};

function deleteButtonClicked() {
  alert('Hi there');
};

async function createBlock(startAt) {
  tableBodyEl.innerHTML = "";
  showProgressBar( progressEl);
  const clubRecs = await Club.retrieveBlock({"order": order, "cursor": startAt});
  if (clubRecs.length) {
    // set page references for current (cursor) page
    cursor = clubRecs[0][order];
    // set next startAt page reference, if not next page, assign "null" value
    nextPageRef = (clubRecs.length < 10) ? null : clubRecs[clubRecs.length - 1][order];
    for (const clubRec of clubRecs) {
      const row = tableBodyEl.insertRow(-1);
      row.insertCell(-1).textContent = clubRec.clubId;
      row.insertCell(-1).textContent = clubRec.name;
      row.insertCell(-1).textContent = StatusEL.labels[clubRec.status-1];

      row.insertCell(-1);
      let lastCell = row.cells[row.cells.length - 1];
      const infoBtn = document.createElement('button');
      infoBtn.innerText = "details";
      infoBtn.addEventListener('click', infoButtonClicked);
      lastCell.appendChild(infoBtn);

      row.insertCell(-1);
      lastCell = row.cells[row.cells.length - 1];
      const addBtn = document.createElement('button');
      addBtn.innerText = "add";
      infoBtn.addEventListener('click', addButtonClicked);
      lastCell.appendChild(addBtn);

      row.insertCell(-1);
      lastCell = row.cells[row.cells.length - 1];
      const updateBtn = document.createElement('button');
      updateBtn.innerText = "update";
      infoBtn.addEventListener('click', updateButtonClicked);
      lastCell.appendChild(updateBtn);

      row.insertCell(-1);
      lastCell = row.cells[row.cells.length - 1];
      const deleteBtn = document.createElement('button');
      deleteBtn.innerText = "delete";
      infoBtn.addEventListener('click', deleteButtonClicked);
      lastCell.appendChild(deleteBtn);
    }
  }
  hideProgressBar(progressEl);
};
 
// if (formUpEl["clubId"].checkValidity() && formUpEl["clubId"].value) {
//   const clubRec = await Club.retrieve( formUpEl["clubId"].value);
//   formUpEl["clubId"].value = clubRec.clubId;
//   formUpEl["name"].value = clubRec.name;
//   formUpEl["status"].value = clubRec.status;
//   formUpEl["description"].value = clubRec.description;
//   formUpEl["contactInfo"].value = clubRec.contactInfo;
//   formUpEl["startDate"].value = clubRec.startDate;
//   formUpEl["endDate"].value = clubRec.endDate;
//   formUpEl["daysInWeek"].value = clubRec.daysInWeek;
//   if (clubRec.chair_id) formUpEl["chair"].value = clubRec.chair_id;
//   updateTrainerWidget.innerHTML = "";
//   await createMultiSelectionWidget (formUpEl, clubRec.trainerIdRefs,
//     "trainers", "id", "trainerId",
//     Staff.checkTrainerIdAsIdRef, Trainer.retrieve);
// } else {
//   formUpEl.reset();
// }
/**********************************************
 * Use case Delete Club
 **********************************************/
// const deleteFormEl = clubDSectionEl.querySelector("form");
// deleteFormEl["clubId"].addEventListener("input", async function () {
//   const responseValidation = await Club.checkClubIdAsId( deleteFormEl["clubId"].value);
//   deleteFormEl["clubId"].setCustomValidity( responseValidation.message);
// });
// // commit delete only if all form field values are valid
// if (deleteFormEl.checkValidity()) {
//   // handle Delete button click events
//   deleteFormEl["commit"].addEventListener("click", async function () {
//     const clubIdRef = deleteFormEl["clubId"].value;
//     if (!clubIdRef) return;
//     if (confirm("Do you really want to delete this club?")) {
//       await Club.destroy(clubIdRef);
//       deleteFormEl.reset();
//     }
//   });
// }