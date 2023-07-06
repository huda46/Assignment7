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
 * Fill a select element with option elements created from a 
 * map of objects 
 *
 * @param {object} selectEl  A select(ion list) element
 * @param {object|array} selectionRange  A map of objects or an array list
 * @param {bool} hasDefOpt Look if it has a default value, 
 *     else create an empty (---) option
 * @param {object} optPar [optional]  An optional parameter record including
 *     optPar.displayProp and optPar.selection
 */
function fillSelectWithOptions2(selectEl, selectionRange, hasDefOpt, optPar ) {
  // create option elements from object property values
  const options = Array.isArray( selectionRange) ? selectionRange :
  Object.keys( selectionRange);
  var initValue = 0;
  // delete old contents
  selectEl.innerHTML = "";
  if (!hasDefOpt) {
    initValue = 1;
    let initOptionEl = createOption( 0, "---");
    initOptionEl.selected = true;
    selectEl.add( initOptionEl);
  }
  for (let i=initValue; i < options.length + initValue; i++) {
    let optionEl=null;
    if (Array.isArray( selectionRange)) {
      optionEl = createOption( i+1, options[i-initValue]);
      if (selectEl.multiple && optPar && optPar.selection && 
          optPar.selection.includes(i+1) && hasDefOpt) {
        // flag the option element with this value as selected
        optionEl.selected = true;
      }      
    } else {
      const key = options[i-initValue];
      const obj = selectionRange[key];
      if (optPar && optPar.displayProp) {
        optionEl = createOption( key, obj[optPar.displayProp]);
      } else optionEl = createOption( key);
      // if invoked with a selection argument, flag the selected options
      if (selectEl.multiple && optPar && optPar.selection && 
          optPar.selection[key] && hasDefOpt) {
        // flag the option element with this value as selected
        optionEl.selected = true;
      }      
    }
    selectEl.add( optionEl);
  }
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

export { isNonEmptyString, isIntegerOrIntegerString, fillSelectWithOptions, 
  createOption , showProgressBar , hideProgressBar, createModalFromChange};