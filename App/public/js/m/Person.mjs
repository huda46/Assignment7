import { fsDb } from "../initFirebase.mjs";
import Enumeration from "../../lib/Enumeration.mjs"; 
import { collection as fsColl, deleteDoc, doc as fsDoc, getDoc, getDocs, setDoc, updateDoc, deleteField }
  from "https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore-lite.js";
  import { isNonEmptyString, isIntegerOrIntegerString }
  from "../../lib/util.mjs";
import { NoConstraintViolation, MandatoryValueConstraintViolation, RangeConstraintViolation, UniquenessConstraintViolation }
  from "../../lib/errorTypes.mjs";


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
  let validationResult = Person.checkId( id);
  if ((validationResult instanceof NoConstraintViolation)) {
    if (!id) {
      validationResult = new MandatoryValueConstraintViolation(
          "A positive integer value for the person ID is required!");
        } else {
          const personDocSn = await getDoc( fsDoc( fsDb, "persons", id));
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
    let validationResult = await Person.checkPersonIdAsId( Person.personId);
    if (!validationResult instanceof NoConstraintViolation) throw validationResult;
  } catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
    person = null;
  }
  if (person) {
    try {
      const personDocRef = fsDoc( fsDb, "persons", person.personId).withConverter( Person.converter);
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
    const personRec = (await getDoc( fsDoc(fsDb, "persons", personId)
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
const personDocRef = fsDoc( fsDb, "persons", slots.personId).withConverter( Person.converter),
  updatedSlots = {};
try {
  // retrieve up-to-date person record
  const personDocSn = await getDoc( personDocRef);
  personBeforeUpdate = personDocSn.data();
} catch (e) {
  console.error(`${e.constructor.name}: ${e.message}`);
}
try {
  if (personBeforeUpdate.title !== slots.title) {
    validationResult = Person.checkTitle( slots.title);
    if (validationResult instanceof NoConstraintViolation) updatedSlots.title = slots.title;
    else throw validationResult;
  }
  if (personBeforeUpdate.year !== parseInt( slots.year)) {
    validationResult = Person.checkYear( slots.year);
    if (validationResult instanceof NoConstraintViolation) updatedSlots.year = parseInt( slots.year);
    else throw validationResult;
  }
  if (slots.edition && personBeforeUpdate.edition !== parseInt( slots.edition)) {
    // slots.edition has a non-empty value that is different from the old value
    validationResult = Person.checkEdition( slots.edition);
    if (validationResult instanceof NoConstraintViolation) updatedSlots.edition = parseInt( slots.edition);
    else throw validationResult;
  } else if (!slots.edition && personBeforeUpdate.edition) {
    // slots.edition has an empty value while the old value was not empty
    updatedSlots.edition = await updateDoc( personDocRef, {edition: deleteField()});
  }
} catch (e) {
  noConstraintViolated = false;
  console.error(`${e.constructor.name}: ${e.message}`);
}
if (noConstraintViolated) {
  const updatedProperties = Object.keys(updatedSlots);
  if (updatedProperties.length) {
    await updateDoc(personDocRef, updatedSlots);
    console.log(`Property(ies) "${updatedProperties.toString()}" modified for person record "${slots.personId}"`);
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
    await deleteDoc( fsDoc(fsDb, "persons", personId));
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
  let personRecs = [
    {
      personId: 1,
      name: "Max Mustermann",
      type: 1
    },
    {
      personId: 2,
      name: "Ulrike Mustermann",
      type: 2
    },
    {
      personId: 3,
      name: "John Mustermann",
      type: 3
    }
  ];
  // save all person record/documents
  await Promise.all( personRecs.map( d => Person.add( d)));
  console.log(`${Object.keys( personRecs).length} person records saved.`);
};
/**
 * Clear database
 */
Person.clearData = async function () {
    if (confirm("Do you really want to delete all person records?")) {
      try {
        console.log("Clearing test data...");
        const personsCollRef = fsColl( fsDb, "persons");
        const personsQrySn = (await getDocs( personsCollRef));
        await Promise.all( personsQrySn.docs.map( d => Person.destroy( d.id)))
        console.log(`${personsQrySn.docs.length} persons deleted.`);
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


export { PersonTypeEL };
export default Person;