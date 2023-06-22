/**
 * @fileOverview  The model class Person with attribute definitions and storage management methods
 * @author Gerd Wagner
 * @author Juan-Francisco Reyes
 * @copyright Copyright 2020-2022 Gerd Wagner (Chair of Internet Technology) and Juan-Francisco Reyes,
 * Brandenburg University of Technology, Germany.
 * @license This code is licensed under The Code Project Open License (CPOL), implying that the code is provided "as-is",
 * can be modified to create derivative works, can be redistributed, and can be used in commercial applications.
 */
import { fsDb } from "../initFirebase.mjs";
import Enumeration from "../lib/Enumeration.mjs"; 
import { collection as fsColl, deleteDoc, doc as fsDoc, getDoc, getDocs, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
//import { fillSelectWithOptions } from "../lib/useful.mjs";


const PersonTypeEL = new Enumeration(["STUDENT","EMPLOYEE","GUEST"]);
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
    personDocRef = fsDoc (personsCollRef, parseInt( slots.personId),);
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
    const personDocRef = fsDoc( fsDb, "persons", personId);
    personDocSn = await getDoc( personDocRef);
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
    personsQrySn = await getDocs( personsCollRef);
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
  const personRec = await Person.retrieve( parseInt(slots.personId));
  // update only those slots that have changed
  if (personRec.name !== slots.name) updSlots.name = slots.name;
  //HIER ENUM!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  if (personRec.type !== slots.type) updSlots.type = slots.type;
  if (Object.keys( updSlots).length > 0) {
    try {
      const personDocRef = fsDoc( fsDb, "persons", slots.personId);
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
    await deleteDoc( fsDoc( fsDb, "persons", personId));
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
  let personRecs = [
    {
      personId: 1,
      name: "Max Mustermann",
      type: "STUDENT"},
    {
      personId: 2,
      name: "Ulrike Mustermann",
      year: "EMPLOYEE"
    },
    {
      personId: 3,
      name: "John Mustermann",
      type: "GUEST"
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
  if (confirm("Do you really want to delete this person?")) {
    // retrieve all person documents from Firestore
    const personRecs = await Person.retrieveAll();
    // delete all documents
    await Promise.all( personRecs.map( d => Person.destroy( d.personId)));
    // ... and then report that they have been deleted
    console.log(`${Object.values( personRecs).length} person records deleted.`);
  }
};

export default Person;
export { PersonTypeEL };