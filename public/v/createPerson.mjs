/**
 * @fileOverview  View methods for the use case "create person"
 * @author Gerd Wagner
 * @author Juan-Francisco Reyes
 */
/***************************************************************
 Import classes and data types
 ***************************************************************/
import Person, {PersonTypeEL} from "../m/Person.mjs";
import { fillSelectWithOptions } from "../lib/useful.mjs";

/***************************************************************
 Declare variables for accessing UI elements
 ***************************************************************/
const formEl = document.forms["Person"],
  createButton = formEl["commit"];

/******************************************************************
 Add event listeners for the create/submit button
 ******************************************************************/

 // set up the type of person selection list
//fillSelectWithOptions( PersonTypeEL, PersonTypeEL.labels);

 createButton.addEventListener("click", async function () {
  const slots = {
    personId: formEl["personId"].value,
    name: formEl["name"].value,
    type: formEl["type"]
  };
  await Person.add( slots);
  formEl.reset();
});
