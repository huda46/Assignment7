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
function fillSelectWithOptions(selectEl, selectionRange, hasDefOpt, optPar ) {
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
/**
 * Show progress bar element
 * @param {object} progressEl
 */
function showProgressBar (progressEl) {
  progressEl.hidden = false;
}

/**
 * Hide progress bar element
 * @param {object} progressEl
 */
function hideProgressBar (progressEl) {
  progressEl.hidden = true;
}


export { isNonEmptyString, isIntegerOrIntegerString, fillSelectWithOptions, createOption , showProgressBar , hideProgressBar};