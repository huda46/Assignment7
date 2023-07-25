/**
 * Verifies if a value represents an integer
 * @param {string} x
 * @return {boolean}
 */
function isNonEmptyString( x) {
  return typeof (x) === "string" && x.trim() !== "";
}
/**
   * Create a DOM option element
   * 
   * @param {string} val
   * @param {string} txt 
   * @param {string} classValues [optional]
   * 
   * @return {object}
   */
function createOption( val, txt, classValues) {
  var el = document.createElement("option");
  el.value = val;
  el.text = txt || val;
  if (classValues) el.className = classValues;
  return el;
}
/**
 * Verifies if a value represents an integer or integer string
 * @param {string} x
 * @return {boolean}
 */
function isIntegerOrIntegerString( x) {
  return typeof (x) === "number" && x.toString().search(/^-?[0-9]+$/) === 0 ||
    typeof (x) === "string" && x.search(/^-?[0-9]+$/) === 0;
}

/**
 * Convert Firestore timeStamp object to Date string in format YYYY-MM-DD
 * @param {object} timeStamp A Firestore timeStamp object
 */
function date2IsoDateString(timeStamp) {
  const dateObj = timeStamp.toDate();
  let  y = dateObj.getFullYear(),
    m = "" + (dateObj.getMonth() + 1),
    d = "" + dateObj.getDate();
  if (m.length < 2) m = "0" + m;
  if (d.length < 2) d = "0" + d;
  return [y, m, d].join("-");
}

function fillSelectWithOptions( selectEl, selectionRange, defaultSelection, optPar) {
  // create option elements from array key and values
  const options = selectionRange.entries();
  // delete old contents
  selectEl.innerHTML = "";
  // create "no selection yet" entry
  if (!selectEl.multiple && !defaultSelection) {
    selectEl.add( createOption(""," --- "));
  }
  //
  for (const [index, o] of options) {
    const key = index + 1;
    const optionEl = createOption(
      optPar ? (o[optPar.valueProp] ? o[optPar.valueProp] : key) : key,
      optPar ? (o[optPar.displayProp] ? o[optPar.displayProp] : o) : o
    );
    if (selectEl.multiple && optPar && optPar.selection &&
      optPar.selection.includes(key)) {
      // flag the option element with this value as selected
      optionEl.selected = true;
    }
    selectEl.add( optionEl);
  }
}
/**
 * Show progress bar element
 * @param {object} progressEl
 */
function showProgressBar(progressEl) {
  progressEl.hidden = false;
}

/**
 * Hide progress bar element
 * @param {object} progressEl
 */
function hideProgressBar(progressEl) {
  progressEl.hidden = true;
}

/**
 * Handle messages in modal window for listened change in item
 * @param change: {object}
 */
function createModalFromChange(change) {
  const { itemName, description, type } = change,
    divModalWindowEl = document.querySelector("#modal-window"),
    divModalContentEl = divModalWindowEl.querySelector("div"),
    pEl = document.createElement("p"),
    btnEl = document.createElement("button");
  divModalContentEl.innerHTML = "";
  pEl.textContent = `The selected ${itemName} "${description}" has been ${type} by another user.`;
  btnEl.type = "button";
  btnEl.textContent = "Reload this page to continue";
  btnEl.addEventListener( "click", () => location.reload());
  divModalContentEl.appendChild( pEl);
  divModalContentEl.appendChild( btnEl);
  divModalWindowEl.appendChild( divModalContentEl);
  divModalWindowEl.classList.add("show-modal");
}

// *************** Multiple Selection Widget ****************************************
/**
 * Create an input/button elements combo that creates associations between a "domain
 * object" and a "target object". This UI component checks/retrieves target objects
 * and adds them to a list (ul element) of ID references.
 * 1) creates an input field of "number" type, where ID references are entered,
 * 2) creates a button that adds li elements with ID reference's data to the list (ul),
 * 3) creates a ul element containing the association list
 * 4) each list item includes a button allowing each item to remove itself from the
 *    association list
 * @param {object} formEl The container form
 * @param {array} idRefs A map of objects, which is used to create the list of ID references
 * @param {string} inputEl Input element's name attribute
 * @param {string} idRefDomainName Domain object's attribute
 * @param {string} idRefTargetName Target object's attribute
 * @param {function} checkerMethod Method to check target object
 * @param {function} retrieveMethod Method to retrieve data from target object
 * @returns {Promise<void>}
 */
// set up event handler for adding/removing multiple ID reference to associate 2 objects
async function createMultiSelectionWidget (formEl, idRefs, inputEl,
                                           idRefDomainName, idRefTargetName,
                                           checkerMethod, retrieveMethod ) {
  const widgetEl = formEl.querySelector(".MultiSelectionWidget");
  const labelEl = document.createElement("label");
  const inputNumEl = document.createElement("input");
  const btnEl = document.createElement("button");
  const listEl = document.createElement("ul");
  inputNumEl.setAttribute("type", "text");
  inputNumEl.setAttribute("placeholder", "Enter ID");
  inputNumEl.setAttribute("name", "trainers");
  btnEl.textContent = "add";
  labelEl.appendChild( inputNumEl);
  labelEl.appendChild( btnEl);
  labelEl.prepend("Trainers: ");
  widgetEl.appendChild( labelEl);
  widgetEl.appendChild( listEl);
  // setup event handler for adding a new ID reference
  btnEl.addEventListener("click", async function () {
    const listEl = widgetEl.children[1]; // ul
    const idReference = formEl[inputEl].value;
    //if new ID reference is not empty or zero
    if (idReference && parseInt(idReference) !== 0) {
      let responseValidation = await checkerMethod( idReference); // invoke checker
      if (responseValidation.message) {
        formEl[inputEl].setCustomValidity( responseValidation.message);
      } else { // if checker passes
        // check if new ID reference has been already added
        const listOfIdRefs = getListOfIdRefs( listEl),
          alreadyAdded = !!listOfIdRefs
            .find( a => a[idRefDomainName] === parseInt( idReference));
        if (!alreadyAdded) { // if new ID reference has not yet added
          formEl[inputEl].setCustomValidity("");
          // retrieve target object
          const targetObjt = await retrieveMethod( idReference);
          // if target object is retrieved successfully, add ID reference to list
          if (targetObjt) {
            listEl.appendChild( addItemToListOfSelectedItems( targetObjt, idRefTargetName, "added"));
            formEl[inputEl].value = "";
            formEl[inputEl].focus();
          }
        } else { // if ID reference was already added
          formEl[inputEl].setCustomValidity("ID reference has been already added!");
        }
      }
    } else { // clear form if ID reference is not allowed
      formEl[inputEl].value = "";
    }
  });
  // setup event handler for removing an ID reference from list
  listEl.addEventListener( "click", function (e) {
    if (e.target.tagName === "BUTTON") {  // delete button
      const btnEl = e.target,
        listItemEl = btnEl.parentNode;
      if (listItemEl.classList.contains("removed")) {
        // undoing a previous removal
        listItemEl.classList.remove("removed");
        // change button text
        btnEl.textContent = "✕";
      } else if (listItemEl.classList.contains("added")) {
        listItemEl.remove();
      } else {
        // removing an ordinary item
        listItemEl.classList.add("removed");
        // change button text
        btnEl.textContent = "undo";
      }
    }
  });
  // fill loaded target ID references with
  if (idRefs.length) {
    for (const aId of idRefs) {
      const listEl = widgetEl.children[1];
      listEl.appendChild( addItemToListOfSelectedItems( aId, "personId"));
    }
  }
  /** get references of associated objects from list **/
  function getListOfIdRefs (listEl) {
    const listItemEls = Array.from( listEl.children);
    return listItemEls.map( a => JSON.parse(a.getAttribute("data-value")));
  }
}
/**
 * Create a choice widget in a given fieldset element.
 * A choice element is either an HTML radio button or an HTML checkbox.
 * @param containerEl
 * @param fld
 * @param values
 * @param choiceWidgetType
 * @param choiceItems
 * @param isMandatory
 * @returns {*}
 */
function createChoiceWidget( containerEl, fld, values,
                             choiceWidgetType, choiceItems, isMandatory) {
  const choiceControls = containerEl.querySelectorAll("label");
  // remove old content
  for (const j of choiceControls.keys()) {
    containerEl.removeChild( choiceControls[j]);
  }
  if (!containerEl.hasAttribute("data-bind")) {
    containerEl.setAttribute("data-bind", fld);
  }
  // for a mandatory radio button group initialze to first value
  if (choiceWidgetType === "radio" && isMandatory && values.length === 0) {
    values[0] = 1;
  }
  if (values.length >= 1) {
    if (choiceWidgetType === "radio") {
      containerEl.setAttribute("data-value", values[0]);
    } else {  // checkboxes
      containerEl.setAttribute("data-value", "["+ values.join() +"]");
    }
  }
  for (const j of choiceItems.keys()) {
    // button values = 1..n
    const el = createLabeledChoiceControl( choiceWidgetType, fld,
      j+1, choiceItems[j]);
    // mark the radio button or checkbox as selected/checked
    if (values.includes(j+1)) el.firstElementChild.checked = true;
    containerEl.appendChild( el);
    el.firstElementChild.addEventListener("click", function (e) {
      const btnEl = e.target;
      if (choiceWidgetType === "radio") {
        if (containerEl.getAttribute("data-value") !== btnEl.value) {
          containerEl.setAttribute("data-value", btnEl.value);
        } else if (!isMandatory) {
          // turn off radio button
          btnEl.checked = false;
          containerEl.setAttribute("data-value", "");
        }
      } else {  // checkbox
        let values = JSON.parse( containerEl.getAttribute("data-value")) || [];
        let i = values.indexOf( parseInt( btnEl.value));
        if (i > -1) {
          values.splice(i, 1);  // delete from value list
        } else {  // add to value list
          values.push( btnEl.value);
        }
        containerEl.setAttribute("data-value", "["+ values.join() +"]");
      }
    });
  }
  return containerEl;
}
/**
 * * Create a choice control (radio button or checkbox) element
 * @param {string} t  The type of choice control ("radio" or "checkbox")
 * @param {string} n  The name of the choice control input element
 * @param {string} v  The value of the choice control input element
 * @param {string} lbl  The label text of the choice control
 * @return {object}
 */
function createLabeledChoiceControl( t,n,v,lbl) {
  const ccEl = document.createElement("input"),
    lblEl = document.createElement("label");
  ccEl.type = t;
  ccEl.name = n;
  ccEl.value = v;
  lblEl.appendChild( ccEl);
  lblEl.appendChild( document.createTextNode( lbl));
  return lblEl;
}

/**
 * Add an item to a list element showing selected objects
 *
 * @param {object} targetObjt  Referenced target object
 * @param {string} idRefTargetName  ID reference of target
 * @param {string} classValue  CSS class name
 */
function addItemToListOfSelectedItems( targetObjt, idRefTargetName , classValue) {
  const listItemEl = document.createElement("li"),
    removeBtn = createPushButton("x");
  // add first 18 chars in list item
  listItemEl.innerText = `${targetObjt[idRefTargetName]}: ${targetObjt.lastname}`.substring(0, 16);
  // convert target object into text
  const targetObjText = JSON.stringify({personId: targetObjt[idRefTargetName], lastname: targetObjt.lastname});
  // embed target object in list item (li element)
  listItemEl.setAttribute("data-value", targetObjText);
  if (classValue) listItemEl.classList.add( classValue);
  listItemEl.appendChild( removeBtn);
  return listItemEl;
}
/**
 * Create a Push Button
 * @param {string} txt [optional]
 * @return {object}
 */
function createPushButton( txt) {
  const pB = document.createElement("button");
  pB.type = "button";
  if (txt) pB.textContent = txt;
  return pB;
}

export { date2IsoDateString, isNonEmptyString, isIntegerOrIntegerString,
  fillSelectWithOptions, createOption , showProgressBar , hideProgressBar,
  createModalFromChange, createMultiSelectionWidget, createChoiceWidget};