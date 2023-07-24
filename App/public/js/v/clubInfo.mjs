import { handleAuthentication } from "./accessControl.mjs";
import Club, {StatusEL, WeekDaysEL} from "../m/Club.mjs";
import { hideProgressBar, showProgressBar } 
  from "../../lib/util.mjs";

handleAuthentication();

/***************************************************************
 Declare variables for accessing UI elements
 ***************************************************************/
const formEl = document.forms["Retrieve"],
  progressEl = document.querySelector("progress"),
  clubNo = localStorage.getItem("clubNo"),
  trainerTableEl = document.getElementById("trainers"),
  trainerBodyEl = trainerTableEl.querySelector("tbody"),
  memberTableEl = document.getElementById("members"),
  memberBodyEl = memberTableEl.querySelector("tbody");
  
if (clubNo) {
  showProgressBar( progressEl);

  const clubRec = await Club.retrieve( clubNo);
  formEl["clubName"].value = clubRec.name;
  formEl["status"].value = StatusEL.labels[clubRec.status - 1];
  formEl["fee"].value = String(clubRec.fee) + " €";
  formEl["description"].value = clubRec.description;
  formEl["contactInfo"].value = clubRec.contactInfo;
  formEl["startDate"].value = clubRec.startDate;
  formEl["endDate"].value = clubRec.endDate;
  formEl["time"].value = clubRec.time;
  formEl["location"].value = clubRec.location;
  formEl["daysInWeek"].value = clubRec.daysInWeek.map(l => WeekDaysEL.labels[l - 1]).join(", ");
  formEl["chair_id"].value = clubRec.chair_id.lastname;

  // fill trainer and member tables
  for (const trainerIdRef of clubRec.trainerIdRefs) {
    const row = trainerBodyEl.insertRow(-1);
    row.insertCell(-1).textContent = trainerIdRef.personId;
    row.insertCell(-1).textContent = trainerIdRef.lastname;
  }
  for (const memberIdRef of clubRec.clubMemberIdRefs) {
    const row = memberBodyEl.insertRow(-1);
    row.insertCell(-1).textContent = memberIdRef.personId;
    row.insertCell(-1).textContent = memberIdRef.lastname;
  }

  hideProgressBar(progressEl);
}