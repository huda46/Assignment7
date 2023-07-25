/***************************************************************
 Import classes and data types
 ***************************************************************/
import Staff from "../m/Staff.mjs";
import Club from "../m/Club.mjs";
import { handleAuthentication } from "./accessControl.mjs";
import { showProgressBar, hideProgressBar } from "../../lib/util.mjs";
import { auth } from "../initFirebase.mjs";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js";
import { NoConstraintViolation } from "../../lib/errorTypes.mjs";

/***************************************************************
 Setup and handle UI Access Control
 ***************************************************************/
handleAuthentication();

const tableEl = document.getElementById("clubs");
const tableBodyEl = tableEl.querySelector("tbody"),
  progressEl = document.querySelector("progress");

listClubs();

/***************************************************************
Render list of all club that the user manages
***************************************************************/
function infoButtonClicked(event) {
  const button = event.target;
  const parentRow = button.parentNode.parentNode;
  const columns = parentRow.getElementsByTagName('td');
  //save the club number for the next file
  localStorage.setItem('clubNo', columns[0].innerText);
  window.location.pathname = `/clubInfo.html`;
};

function updateButtonClicked(event) {
  const button = event.target;
  const parentRow = button.parentNode.parentNode;
  const columns = parentRow.getElementsByTagName('td');
  //save the club number for the next file
  localStorage.setItem('clubNo', columns[0].innerText);
  window.location.pathname = `/updateClub.html`;
};

async function deleteButtonClicked(event) {
  const button = event.target;
  const parentRow = button.parentNode.parentNode;
  const columns = parentRow.getElementsByTagName('td');
  const clubId = columns[0].innerText;
  if (confirm("Do you really want to delete this club?")) {
    await Club.destroy( clubId);
    tableBodyEl.removeChild(parentRow);
  }
};

async function listClubs() {
  tableBodyEl.innerHTML = "";
  onAuthStateChanged(auth, async function (user) {
    showProgressBar( progressEl);
    if (user) {
      const userId = user.uid;
      const validationResult = await Staff.checkPersonIdAsIdRef(userId);
      if (validationResult instanceof NoConstraintViolation) {

        const staff = await Staff.retrieve(userId);
        if (staff.managingClubs) {
          for (const clubRec of staff.managingClubs) {
            const row = tableBodyEl.insertRow(-1);
            row.insertCell(-1).textContent = clubRec.clubId;
            row.insertCell(-1).textContent = clubRec.name;
      
            row.insertCell(-1);
            let lastCell = row.cells[row.cells.length - 1];
            const infoBtn = document.createElement('button');
            infoBtn.innerText = "details";
            infoBtn.addEventListener('click', infoButtonClicked);
            lastCell.appendChild(infoBtn);
      
            row.insertCell(-1);
            lastCell = row.cells[row.cells.length - 1];
            const updateBtn = document.createElement('button');
            updateBtn.innerText = "update";
            updateBtn.addEventListener('click', updateButtonClicked);
            lastCell.appendChild(updateBtn);
      
            row.insertCell(-1);
            lastCell = row.cells[row.cells.length - 1];
            const deleteBtn = document.createElement('button');
            deleteBtn.innerText = "delete";
            deleteBtn.addEventListener('click', deleteButtonClicked);
            lastCell.appendChild(deleteBtn);
          }
        } else {
          console.log("No club was found to manage.!");
        }
      } else {
        console.log("No club was found to manage.!");
      }
    }
    hideProgressBar(progressEl);
  });
}