class Enumeration {
  constructor (enumArg) {
    if (Array.isArray( enumArg)) {
      // a simple enum defined by a list of labels
      if (!enumArg.every( function (l) {
        return (typeof l === "string"); })) {
        throw new ConstraintViolation(
          "A list of enumeration labels must be an array of strings!");
      }
      this.labels = enumArg;
      this.enumLitNames = this.labels;
      this.codeList = null;
    } else if (typeof enumArg === "object" && Object.keys( enumArg).length) {
      // a code list defined by a map
      if (!Object.keys( enumArg).every( function (code) {
        return (typeof enumArg[code] === "string"); })) {
        throw new ConstraintViolation(
          "All values of a code list map must be strings!");
      }
      this.codeList = enumArg;
      // use the codes as the names of enumeration literals
      this.enumLitNames = Object.keys( this.codeList);
      this.labels = this.enumLitNames.map( c => `${enumArg[c]} (${c})`);
    } else {
      throw new ConstraintViolation(
        `Invalid Enumeration constructor argument: ${enumArg}`);
    }
    this.MAX = this.enumLitNames.length;
    // generate the enumeration literals by capitalizing/normalizing the names
    for (let i=1; i <= this.enumLitNames.length; i++) {
      // replace " " and "-" with "_"
      const lbl = this.enumLitNames[i-1].replace(/( |-)/g, "_");
      // convert to array of words, capitalize them, and re-convert
      const LBL = lbl.split("_").map( lblPart => lblPart.toUpperCase()).join("_");
      // assign enumeration index
      this[LBL] = i;
    }
    // make the new enumeration object immutable
    Object.freeze( this);
  }
}
/*
 * Serialize a list of enumeration literals/indexes as a list of 
 * enumeration literal names
 */
Enumeration.prototype.stringify = function (a) {
  var listStr = a.map( (enumInt) => this.enumLitNames[enumInt-1]).join(", ");
  return listStr;
}

export default Enumeration;