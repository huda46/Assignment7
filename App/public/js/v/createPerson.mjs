/***************************************************************
 Import classes and data types
 ***************************************************************/
import Person from "../m/Person.mjs";
import { PersonTypeEL } from "../m/Person.mjs";
import { fillSelectWithOptions } from "../../lib/util.mjs"; 

/***************************************************************
 Declare variables for accessing UI elements
 ***************************************************************/
const formEl = document.forms["Person"],
  typeEl = formEl["type"],
  createButton = formEl["commit"];

// set up the type selection list
fillSelectWithOptions( typeEl, PersonTypeEL.labels, true);

/******************************************************************
 Add event listeners for the create/submit button
 ******************************************************************/
createButton.addEventListener("click", async function () {
  const slots = {
    personId: formEl["personId"].value,
    name: formEl["name"].value,
    type: formEl["type"].value
  };
  await Person.add( slots);
  formEl.reset();
});
