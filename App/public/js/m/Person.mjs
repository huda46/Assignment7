import { fsDb } from "../initFirebase.mjs";
import Enumeration from "../../lib/Enumeration.mjs"; 
import { collection as fsColl, deleteDoc, doc as fsDoc, getDoc, getDocs, onSnapshot,
  setDoc, orderBy, updateDoc, deleteField, query as fsQuery }
  from "https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore.js";
import { isNonEmptyString, isIntegerOrIntegerString, createModalFromChange } from "../../lib/util.mjs";
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
  constructor({personId, name, type}) {
    this.personId = personId;
    this.name = name;
    this.type = type;
  };
  get personId() {
    return this._personId;  
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
  set personId( d) {
    d = parseInt(d);
    const validationResult = Person.checkPersonId( d);
    if (validationResult instanceof NoConstraintViolation) {
      this._personId = d;
    } else {
      throw validationResult;
    }
  };
  get name() {
    return this._name;
  };
  static checkName( n) {
    if (!n) {
      return new MandatoryValueConstraintViolation("A person´s name must be provided!");
    } else if (!isNonEmptyString( n)) {
      return new RangeConstraintViolation("The name of person must be a non-empty string!");
    } else {
      return new NoConstraintViolation();
    }
  };
  set name( n) {
    const validationResult = Person.checkName( n);
    if (validationResult instanceof NoConstraintViolation) {
      this._name = n;
    } else {
      throw validationResult;
    }
  };
  get type() {
    return this._type;
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
  set type( t) {
    const validationResult = Person.checkType( t);
    if (validationResult instanceof NoConstraintViolation) {
      this._type = t;
    } else {
      throw validationResult;
    }
  };
}
/*********************************************************
 ***  Class-level ("static") storage management methods **
 *********************************************************/
/**
 * Create a Firestore document in the Firestore collection "persons"
 * @param slots: {object}
 * @returns {Promise<void>}
 */
Person.add = async function (slots) {
  let person = null;
  try {
    person = new Person( slots);
    let validationResult = await Person.checkPersonIdAsId( person.personId);
    if (!(validationResult instanceof NoConstraintViolation)) {
      throw validationResult;
    }
  } catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
    person = null;
  }
  if (person) {
    try {
      const personDocRef = fsDoc( fsDb, "persons", person.personId.toString()).withConverter( Person.converter);
      await setDoc( personDocRef, person);
      console.log(`Person record "${person.personId}" created!`);
    } catch (e) {
      console.error(`${e.constructor.name}: ${e.message} + ${e}`);
    }
  }
};
/**
 * Load a person record from Firestore
 * @param personId: {object}
 * @returns {Promise<*>} personRecord: {array}
 */
Person.retrieve = async function (personId) {
  try {
    const personRec = (await getDoc( fsDoc(fsDb, "persons", personId.toString())
      .withConverter( Person.converter))).data();
    console.log(`Person record "${personRec.personId}" retrieved.`);
    return personRec;
  } catch (e) {
    console.error(`Error retrieving person record: ${e}`);
  }
};
/**
 * Load all person records from Firestore
 * @returns {Promise<*>} personRecords: {array}
 */
Person.retrieveAll = async function (order) {
  if (!order) order = "personId";
  const personsCollRef = fsColl( fsDb, "persons"),
    q = fsQuery( personsCollRef, orderBy( order));
  try {
    const personRecs = (await getDocs( q.withConverter( Person.converter))).docs.map( d => d.data());
    console.log(`${personRecs.length} person records retrieved ${order ? "ordered by " + order : ""}`);
    return personRecs;
  } catch (e) {
    console.error(`Error retrieving person records: ${e}`);
  }
};
/**
 * Update a Firestore document in the Firestore collection "persons"
 * @param slots: {object}
 * @returns {Promise<void>}
 */
Person.update = async function (slots) {
  let noConstraintViolated = true,
  validationResult = null,
  personBeforeUpdate = null;
const personDocRef = fsDoc( fsDb, "persons", slots.personId.toString()).withConverter( Person.converter),
  updatedSlots = {};
try {
  // retrieve up-to-date person record
  const personDocSn = await getDoc( personDocRef);
  personBeforeUpdate = personDocSn.data();
} catch (e) {
  console.error(`${e.constructor.name}: ${e.message}`);
}
try {
  if (personBeforeUpdate.name !== slots.name) {
    validationResult = Person.checkName( slots.name);
    if (validationResult instanceof NoConstraintViolation) updatedSlots.name = slots.name;
    else throw validationResult;
  }
  if (personBeforeUpdate.type !== parseInt( slots.type)) {
    validationResult = Person.checkType( slots.type);
    if (validationResult instanceof NoConstraintViolation) updatedSlots.type = parseInt( slots.type);
    else throw validationResult;
  }
} catch (e) {
  noConstraintViolated = false;
  console.error(`${e.constructor.name}: ${e.message}`);
}
if (noConstraintViolated) {
  const updatedProperties = Object.keys(updatedSlots);
  if (updatedProperties.length === 1) {
    await updateDoc(personDocRef, updatedSlots);
    console.log(`Property ${updatedProperties.toString()} modified for person record "${slots.personId}"`);
  } else if (updatedProperties.length) {
    await updateDoc(personDocRef, updatedSlots);
    console.log(`Properties ${updatedProperties.toString()} modified for person record "${slots.personId}"`);
  } else {
    console.log(`No property value changed for person record "${slots.personId}"!`);
  }
}
};

/**
 * Delete a Firestore document from the Firestore collection "persons"
 * @param personId: {string}
 * @returns {Promise<void>}
 */
Person.destroy = async function (personId) {
  try {
    await deleteDoc( fsDoc(fsDb, "persons", personId.toString()));
    console.log(`Person record "${personId}" deleted!`);
  } catch (e) {
    console.error(`Error deleting person record: ${e}`);
  }
};
/*******************************************
 *** Auxiliary methods for testing **********
 ********************************************/
/**
 * Create test data
 */
Person.generateTestData = async function () {
  try {
    console.log("Generating test data...");
    const response = await fetch("../../test-data/persons.json");
    const personRecs = await response.json();
    await Promise.all( personRecs.map( d => Person.add( d)));
    console.log(`${personRecs.length} persons saved.`);
  } catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
  }
};
/**
 * Clear database
 */
Person.clearData = async function () {
  if (confirm("Do you really want to delete all persons?")) {
    try {
      console.log("Clearing test data...");
      const personsCollRef = fsColl( fsDb, "persons");
      const personsQrySn = (await getDocs( personsCollRef));  
      // delete all documents
      await Promise.all( personsQrySn.docs.map( d => Person.destroy( d.id)));
      // ... and then report that they have been deleted
      console.log(`${personsQrySn.docs.length} person records deleted.`);
    } catch (e) {
      console.error(`${e.constructor.name}: ${e.message}`);
    }
  }
};

Person.converter = {
  toFirestore: function(person) {
    return {
      personId: person.personId,
      name: person.name,
      type: parseInt( person.type)
    };
  },
  fromFirestore: function(snapshot, options) {
    const data = snapshot.data( options);
    return new Person( data);
  }
};

Person.observeChanges = async function (id) {
  try {
    // listen document changes, returning a snapshot (snapshot) on every change
    const personDocRef = fsDoc( fsDb, "persons", id.toString()).withConverter( Person.converter);
    const personRec = (await getDoc( personDocRef)).data();
    return onSnapshot( personDocRef, function (snapshot) {
      // create object with original document data
      const originalData = { itemName: "person", description: `${personRec.name} (PersonId: ${personRec.personId })`};
      if (!snapshot.data()) { // removed: if snapshot has not data
        originalData.type = "REMOVED";
        createModalFromChange( originalData); // invoke modal window reporting change of original data
      } else if (JSON.stringify( personRec) !== JSON.stringify( snapshot.data())) {
        originalData.type = "MODIFIED";
        createModalFromChange( originalData); // invoke modal window reporting change of original data
      }
    });
  } catch (e) {
    console.error(`${e.constructor.name} : ${e.message}`);
  }
};

export { PersonTypeEL };
export default Person;