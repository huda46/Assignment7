import { fsDb } from "../initFirebase.mjs";
import Enumeration from "../../lib/Enumeration.mjs";
import { isNonEmptyString, isIntegerOrIntegerString } from "../../lib/util.mjs";
import { NoConstraintViolation, MandatoryValueConstraintViolation, 
  RangeConstraintViolation, UniquenessConstraintViolation } from "../../lib/errorTypes.mjs";


const PersonTypeEL = new Enumeration(["Student","Employee","Guest"]);

/**
 * Constructor function for the class Person
 * @constructor
 * @param {{personId: number, name: string, type: PersonTypeEL}} slots - Object creation slots.
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
    d = parseInt(d);
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
    } else {
      id = parseInt( id); 
      if (isNaN( id) || !Number.isInteger( id) || id < 1) {
        return new RangeConstraintViolation("The person ID must be a positive integer!");
      } else {
        return new NoConstraintViolation();
      }
    }
  };
  static async checkPersonIdAsId( id) {
    let validationResult = Person.checkPersonId( id);
    if ((validationResult instanceof NoConstraintViolation)) {
      if (!id) {
        validationResult = new MandatoryValueConstraintViolation(
            "A positive integer value for the person ID is required!");
      } else {
        const personDocSn = await getDoc( fsDoc( fsDb, "persons", id.toString()));
        if (personDocSn.exists()) {
          validationResult = new UniquenessConstraintViolation(
            "There is already a person record with this Id!");
        } else {
          validationResult = new NoConstraintViolation();
        }
      }
    }
    return validationResult;
  };
  static async checkPersonIdAsIdRef( id) {
    let validationResult = Person.checkPersonId( id);
    if (validationResult instanceof NoConstraintViolation) {
      if (!id) {
        validationResult = new MandatoryValueConstraintViolation(
            "A positive integer value for the person ID is required!");
      } else {
        const personDocSn = await getDoc( fsDoc( fsDb, "persons", id.toString()));
        if (!personDocSn.exists()) {
          validationResult = new ReferentialIntegrityConstraintViolation(
            "There is no person with this name!");
        } else validationResult = new NoConstraintViolation();
      }
    }
    return validationResult;
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