/***************************************************************
 Import classes and data types
 ***************************************************************/
import Club, { StatusEL } from "../m/Club.mjs";
import Member from "../m/Member.mjs";
import { auth } from "../initFirebase.mjs";
import { handleAuthentication } from "./accessControl.mjs";
import { showProgressBar, hideProgressBar } from "../../lib/util.mjs";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js";

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

function leaveButtonClicked(event) {
  const button = event.target;
  const parentRow = button.parentNode.parentNode;
  const columns = parentRow.getElementsByTagName('td');
  // adding current user to member list of club
  onAuthStateChanged(auth, async function (user) {
    showProgressBar( progressEl);
    if (user) {
      const userId = user.uid;
      const memberRec = await Member.retrieve( userId);
      const userRec = await Club.retrieve(columns[0].innerText);
      const personToRemove = {personId: memberRec.personId, lastname: memberRec.lastname};
      userRec.clubMemberIdRefsToRemove = [personToRemove];
      Club.update(userRec);
      
      button.innerText = "join";
      button.addEventListener('click', joinButtonClicked);
      button.removeEventListener('click', leaveButtonClicked);
    }
    hideProgressBar(progressEl);
  });
}

function joinButtonClicked(event) {
  const button = event.target;
  const parentRow = button.parentNode.parentNode;
  const columns = parentRow.getElementsByTagName('td');
  // adding current user to member list of club
  onAuthStateChanged(auth, async function (user) {
    showProgressBar( progressEl);
    if (user) {
      const userId = user.uid;
      const memberRec = await Member.retrieve( userId);
      const userRec = await Club.retrieve(columns[0].innerText);
      const personToAdd = {personId: memberRec.personId, lastname: memberRec.lastname};
      userRec.clubMemberIdRefsToAdd = [personToAdd];
      Club.update(userRec);
      
      button.innerText = "leave";
      button.addEventListener('click', leaveButtonClicked);
      button.removeEventListener('click', joinButtonClicked);
    }
    hideProgressBar(progressEl);
  });
};

function infoButtonClicked(event) {
  const button = event.target;
  const parentRow = button.parentNode.parentNode;
  const columns = parentRow.getElementsByTagName('td');
  //save the club number for the next file
  localStorage.setItem('clubNo', columns[0].innerText);
  window.location.pathname = `/clubInfo.html`;
};

async function createBlock(startAt) {
  tableBodyEl.innerHTML = "";
  onAuthStateChanged(auth, async function (user) {
    let member = null;
    if (user && !user.isAnonymous) {
      const userId = user.uid;
      const memberRec = await Member.retrieve( userId);
      member = {personId: memberRec.personId, lastname: memberRec.lastname};
    }
    
    const clubRecs = await Club.retrieveBlock({"order": order, "cursor": startAt});
    if (clubRecs.length) {
      // set page references for current (cursor) page
      cursor = clubRecs[0][order];
      if (cursor === startAtRefs[0]) previousBtnEl.disabled = true;
      // set next startAt page reference, if not next page, assign "null" value
      nextPageRef = (clubRecs.length < 10) ? null : clubRecs[clubRecs.length - 1][order];
      if (!nextPageRef) nextBtnEl.disabled = true;
      for (const clubRec of clubRecs) {
        const row = tableBodyEl.insertRow(-1);
        row.insertCell(-1).textContent = clubRec.clubId;
        row.insertCell(-1).textContent = clubRec.name;
        row.insertCell(-1).textContent = StatusEL.labels[clubRec.status-1];
  
        row.insertCell(-1);
        var lastCell = row.cells[row.cells.length - 1];
        const infoBtn = document.createElement('button');
        infoBtn.innerText = 'View';
        infoBtn.addEventListener('click', infoButtonClicked);
        lastCell.appendChild(infoBtn);
        
        if (user && !user.isAnonymous) {
          row.insertCell(-1);
          lastCell = row.cells[row.cells.length - 1];
          const joinBtn = document.createElement('button');
          if (testIfPartOfArray(clubRec.clubMemberIdRefs, member)) {
            joinBtn.innerText = "leave";
            joinBtn.addEventListener('click', leaveButtonClicked);
          } else {
            joinBtn.innerText = "join";
            joinBtn.addEventListener('click', joinButtonClicked);
          }
          // implement business constraints
          if (testIfPartOfArray(clubRec.trainerIdRefs, member) 
                || clubRec.status === 2 || clubRec.status === 4 || clubRec.status === 3) {
            joinBtn.disabled = true;
          }
          lastCell.appendChild(joinBtn);
        }
      }
    }
  });

  function testIfPartOfArray(array, member) {
    for (const entry of array) {
      if (JSON.stringify(entry) === JSON.stringify(member)) {
        return true;
      }
    }
    return false;
  }
};