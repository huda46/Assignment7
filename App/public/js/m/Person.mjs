import { fsDb } from "../initFirebase.mjs";
import Enumeration from "../../lib/Enumeration.mjs"; 
import { collection as fsColl, deleteDoc, doc as fsDoc, getDoc, getDocs, setDoc, updateDoc }
  from "https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore-lite.js";

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
  }
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
  const personsCollRef = fsColl( fsDb, "persons"),
    personDocRef = fsDoc(personsCollRef, slots.personId.toString()).withConverter(Person.converter);
  try {
    await setDoc( personDocRef, slots);
    console.log(`Person record ${slots.personId} created.`);
  } catch( e) {
    console.error(`Error when adding person record: ${e}`);
  }
};
/**
 * Load a person record from Firestore
 * @param personId: {object}
 * @returns {Promise<*>} personRecord: {array}
 */
Person.retrieve = async function (personId) {
  let personDocSn = null;
  try {
    const personDocRef = fsDoc( fsDb, "persons", personId.toString()).withConverter(Person.converter);
    personDocSn = await getDoc( personDocRef.withConverter( Person.converter));
  } catch( e) {
    console.error(`Error when retrieving person record: ${e}`);
    return null;
  }
  const personRec = personDocSn.data();
  return personRec;
};
/**
 * Load all person records from Firestore
 * @returns {Promise<*>} personRecords: {array}
 */
Person.retrieveAll = async function () {
  let personsQrySn = null;
  try {
    const personsCollRef = fsColl( fsDb, "persons");
    personsQrySn = await getDocs( personsCollRef.withConverter( Person.converter));
  } catch( e) {
    console.error(`Error when retrieving person records: ${e}`);
    return null;
  }
  const personDocs = personsQrySn.docs,
    personRecs = personDocs.map( d => d.data());
  console.log(`${personRecs.length} person records retrieved.`);
  return personRecs;
};
/**
 * Update a Firestore document in the Firestore collection "persons"
 * @param slots: {object}
 * @returns {Promise<void>}
 */
Person.update = async function (slots) {
  const updSlots = {};
  // retrieve up-to-date person record
  const personRec = await Person.retrieve( slots.personId);
  // update only those slots that have changed
  if (personRec.name !== slots.name) updSlots.name = slots.name;
  if (personRec.type !== slots.type) updSlots.type = slots.type;
  if (Object.keys( updSlots).length > 0) {
    try {
      const personDocRef = fsDoc( fsDb, "persons", slots.personId.toString()).withConverter(Person.converter);
      await updateDoc( personDocRef, updSlots);
      console.log(`Person record ${slots.personId} modified.`);
    } catch( e) {
      console.error(`Error when updating person record: ${e}`);
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
    await deleteDoc( fsDoc( fsDb, "persons", personId.toString()).withConverter(Person.converter));
    console.log(`Person record ${personId} deleted.`);
  } catch( e) {
    console.error(`Error when deleting person record: ${e}`);
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
    const response = await fetch("../../test-data/books.json");
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
      await Promise.all( personsQrySn.map( d => Person.destroy( d.personId)));
      // ... and then report that they have been deleted
      console.log(`${Object.values( personRecs).length} person records deleted.`);
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