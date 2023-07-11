import { fsDb } from "../initFirebase.mjs";
import Person from "../m/Person.mjs";
import { collection as fsColl, deleteDoc, doc as fsDoc, getDoc, getDocs, onSnapshot,
  setDoc, orderBy, updateDoc, deleteField, query as fsQuery }
  from "https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore.js";
import { isNonEmptyString, isIntegerOrIntegerString, createModalFromChange } from "../../lib/util.mjs";
import { NoConstraintViolation, MandatoryValueConstraintViolation, 
  RangeConstraintViolation, UniquenessConstraintViolation } from "../../lib/errorTypes.mjs";

/**
 * Constructor function for the class Member
 * @constructor
 * @param {{personId: number, name: string, type: PersonTypeEL}} slots - Object creation slots.
 */
class Member extends Person {
  // record parameter with the ES6 syntax for function parameter destructuring
  constructor({personId, name, type}) {
    this.personId = personId;
    this.name = name;
    this.type = type;
  };
}
/*********************************************************
 ***  Class-level ("static") storage management methods **
 *********************************************************/
/**
 * Create a Firestore document in the Firestore collection "members"
 * @param slots: {object}
 * @returns {Promise<void>}
 */
Member.add = async function (slots) {
  let member = null;
  try {
    member = new Member( slots);
    let validationResult = await Person.checkPersonIdAsId( member.personId);
    if (!(validationResult instanceof NoConstraintViolation)) {
      throw validationResult;
    }
  } catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
    member = null;
  }
  if (member) {
    try {
      const memberDocRef = fsDoc( fsDb, "members", member.personId.toString()).withConverter( Member.converter);
      await setDoc( memberDocRef, member);
      console.log(`Member record "${member.personId}" created!`);
    } catch (e) {
      console.error(`${e.constructor.name}: ${e.message} + ${e}`);
    }
  }
};
/**
 * Load a member record from Firestore
 * @param personId: {object}
 * @returns {Promise<*>} memberRecord: {array}
 */
Member.retrieve = async function (personId) {
  try {
    const memberRec = (await getDoc( fsDoc(fsDb, "members", personId.toString())
      .withConverter( Member.converter))).data();
    console.log(`Member record "${memberRec.personId}" retrieved.`);
    return memberRec;
  } catch (e) {
    console.error(`Error retrieving member record: ${e}`);
  }
};
/**
 * Load all member records from Firestore
 * @returns {Promise<*>} memberRecords: {array}
 */
Member.retrieveAll = async function (order) {
  if (!order) order = "personId";
  const membersCollRef = fsColl( fsDb, "members"),
    q = fsQuery( membersCollRef, orderBy( order));
  try {
    const memberRecs = (await getDocs( q.withConverter( Member.converter))).docs.map( d => d.data());
    console.log(`${memberRecs.length} member records retrieved ${order ? "ordered by " + order : ""}`);
    return memberRecs;
  } catch (e) {
    console.error(`Error retrieving member records: ${e}`);
  }
};
/**
 * Update a Firestore document in the Firestore collection "members"
 * @param slots: {object}
 * @returns {Promise<void>}
 */
Member.update = async function (slots) {
  let noConstraintViolated = true,
  validationResult = null,
  memberBeforeUpdate = null;
const memberDocRef = fsDoc( fsDb, "members", slots.personId.toString()).withConverter( Member.converter),
  updatedSlots = {};
try {
  // retrieve up-to-date member record
  const memberDocSn = await getDoc( memberDocRef);
  memberBeforeUpdate = memberDocSn.data();
} catch (e) {
  console.error(`${e.constructor.name}: ${e.message}`);
}
try {
  if (memberBeforeUpdate.name !== slots.name) {
    validationResult = Person.checkName( slots.name);
    if (validationResult instanceof NoConstraintViolation) updatedSlots.name = slots.name;
    else throw validationResult;
  }
  if (memberBeforeUpdate.type !== parseInt( slots.type)) {
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
    await updateDoc(memberDocRef, updatedSlots);
    console.log(`Property ${updatedProperties.toString()} modified for member record "${slots.personId}"`);
  } else if (updatedProperties.length) {
    await updateDoc(memberDocRef, updatedSlots);
    console.log(`Properties ${updatedProperties.toString()} modified for member record "${slots.personId}"`);
  } else {
    console.log(`No property value changed for member record "${slots.personId}"!`);
  }
}
};

/**
 * Delete a Firestore document from the Firestore collection "members"
 * @param personId: {string}
 * @returns {Promise<void>}
 */
Member.destroy = async function (personId) {
  try {
    await deleteDoc( fsDoc(fsDb, "members", personId.toString()));
    console.log(`Member record "${personId}" deleted!`);
  } catch (e) {
    console.error(`Error deleting member record: ${e}`);
  }
};
/*******************************************
 *** Auxiliary methods for testing **********
 ********************************************/
/**
 * Create test data
 */
Member.generateTestData = async function () {
  try {
    console.log("Generating test data...");
    const response = await fetch("../../test-data/members.json");
    const memberRecs = await response.json();
    await Promise.all( memberRecs.map( d => Member.add( d)));
    console.log(`${memberRecs.length} members saved.`);
  } catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
  }
};
/**
 * Clear database
 */
Member.clearData = async function () {
  if (confirm("Do you really want to delete all members?")) {
    try {
      console.log("Clearing test data...");
      const membersCollRef = fsColl( fsDb, "members");
      const membersQrySn = (await getDocs( membersCollRef));  
      // delete all documents
      await Promise.all( membersQrySn.docs.map( d => Member.destroy( d.id)));
      // ... and then report that they have been deleted
      console.log(`${membersQrySn.docs.length} member records deleted.`);
    } catch (e) {
      console.error(`${e.constructor.name}: ${e.message}`);
    }
  }
};

Member.converter = {
  toFirestore: function(member) {
    return {
      personId: member.personId,
      name: member.name,
      type: parseInt( member.type)
    };
  },
  fromFirestore: function(snapshot, options) {
    const data = snapshot.data( options);
    return new Member( data);
  }
};

Member.observeChanges = async function (id) {
  try {
    // listen document changes, returning a snapshot (snapshot) on every change
    const memberDocRef = fsDoc( fsDb, "members", id.toString()).withConverter( Member.converter);
    const memberRec = (await getDoc( memberDocRef)).data();
    return onSnapshot( memberDocRef, function (snapshot) {
      // create object with original document data
      const originalData = { itemName: "member", description: `${memberRec.name} (PersonId: ${memberRec.personId })`};
      if (!snapshot.data()) { // removed: if snapshot has not data
        originalData.type = "REMOVED";
        createModalFromChange( originalData); // invoke modal window reporting change of original data
      } else if (JSON.stringify( memberRec) !== JSON.stringify( snapshot.data())) {
        originalData.type = "MODIFIED";
        createModalFromChange( originalData); // invoke modal window reporting change of original data
      }
    });
  } catch (e) {
    console.error(`${e.constructor.name} : ${e.message}`);
  }
};

export default Member;