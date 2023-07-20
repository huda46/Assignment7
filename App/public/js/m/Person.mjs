import Enumeration from "../../lib/Enumeration.mjs";
import { isNonEmptyString, isIntegerOrIntegerString } from "../../lib/util.mjs";
import { NoConstraintViolation, MandatoryValueConstraintViolation, 
  RangeConstraintViolation } from "../../lib/errorTypes.mjs";


const PersonTypeEL = new Enumeration(["Student","Employee","Guest"]);

/**
 * Constructor function for the class Person
 * @constructor
 * @param {{personId: string, name: string, type: PersonTypeEL}} slots - Object creation slots.
 */
class Person {
  // record parameter with the ES6 syntax for function parameter destructuring
  constructor({personId, firstname, lastname, type}) {
    this.personId = personId;
    this.firstname = firstname;
    this.lastname = lastname;
    this.type = type;
  };

  /************* getter functions *************/
  get personId() {
    return this._personId;  
  };
  get firstname() {
    return this._firstname;
  };
  get lastname() {
    return this._lastname;
  };
  get type() {
    return this._type;
  };

  /************* setter functions *************/
  set personId( d) {
    const validationResult = Person.checkPersonId( d);
    if (validationResult instanceof NoConstraintViolation) {
      this._personId = d;
    } else {
      throw validationResult;
    }
  };
  set firstname( n) {
    const validationResult = Person.checkName( n);
    if (validationResult instanceof NoConstraintViolation) {
      this._firstname = n;
    } else {
      throw validationResult;
    }
  };
  set lastname( n) {
    const validationResult = Person.checkName( n);
    if (validationResult instanceof NoConstraintViolation) {
      this._lastname = n;
    } else {
      throw validationResult;
    }
  };
  set type( t) {
    const validationResult = Person.checkType( t);
    if (validationResult instanceof NoConstraintViolation) {
      this._type = t;
    } else {
      throw validationResult;
    }
  };

  static checkPersonId( id) {
    if (!id) {
      return new NoConstraintViolation(); 
    } else if (typeof id !== "string" || id.trim() === "") {
        return new RangeConstraintViolation("The person ID must be a non-empty string!");
    } else {
        return new NoConstraintViolation();
    }
  };
  static checkName( n) {
    if (!n) {
      return new MandatoryValueConstraintViolation("A full person´s name must be provided!");
    } else if (!isNonEmptyString( n)) {
      return new RangeConstraintViolation("The full name of a person must be a non-empty string!");
    } else {
      return new NoConstraintViolation();
    }
  };
  static checkType ( t) {
    if (!t) {
      return new MandatoryValueConstraintViolation(
        "A type must be provided!");
    } else if (!isIntegerOrIntegerString(t) || parseInt(t) < 1 ||
      parseInt(t) > PersonTypeEL.MAX) {
      return new RangeConstraintViolation(
        `Invalid value for type: ${t}`);
    } else {
      return new NoConstraintViolation();
    } 
  };
}

export { PersonTypeEL };
export default Person;