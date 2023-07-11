import { fsDb } from "../initFirebase.mjs";
import Person from "../m/Person.mjs";
import { collection as fsColl, deleteDoc, doc as fsDoc, getDoc, getDocs, onSnapshot,
  setDoc, orderBy, updateDoc, deleteField, query as fsQuery }
  from "https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore.js";
import { isNonEmptyString, isIntegerOrIntegerString, createModalFromChange } from "../../lib/util.mjs";
import { NoConstraintViolation, MandatoryValueConstraintViolation, 
  RangeConstraintViolation, UniquenessConstraintViolation } from "../../lib/errorTypes.mjs";

/**
 * Constructor function for the class Person
 * @constructor
 * @param {{personId: number, name: string, type: PersonTypeEL}} slots - Object creation slots.
 */
class Admin extends Person {
  // record parameter with the ES6 syntax for function parameter destructuring
  constructor({personId, name, type}) {
    super({personId, name, type});
  }
}
/*********************************************************
 ***  Class-level ("static") storage management methods **
 *********************************************************/
/**
 * Create a Firestore document in the Firestore collection "staffs"
 * @param slots: {object}
 * @returns {Promise<void>}
 */
Admin.add = async function (slots) {
  let staff = null;
  try {
    staff = new Admin( slots);
    let validationResult = await Person.checkPersonIdAsId( staff.personId);
    if (!(validationResult instanceof NoConstraintViolation)) {
      throw validationResult;
    }
  } catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
    staff = null;
  }
  if (staff) {
    try {
      const staffDocRef = fsDoc( fsDb, "staffs", staff.personId.toString()).withConverter( Admin.converter);
      await setDoc( staffDocRef, staff);
      console.log(`Admin record "${staff.personId}" created!`);
    } catch (e) {
      console.error(`${e.constructor.name}: ${e.message} + ${e}`);
    }
  }
};
/**
 * Load a staff record from Firestore
 * @param personId: {object}
 * @returns {Promise<*>} staffRecord: {array}
 */
Admin.retrieve = async function (personId) {
  try {
    const staffRec = (await getDoc( fsDoc(fsDb, "staffs", personId.toString())
      .withConverter( Admin.converter))).data();
    console.log(`Admin record "${staffRec.personId}" retrieved.`);
    return staffRec;
  } catch (e) {
    console.error(`Error retrieving staff record: ${e}`);
  }
};
/**
 * Load all staff records from Firestore
 * @returns {Promise<*>} staffRecords: {array}
 */
Admin.retrieveAll = async function (order) {
  if (!order) order = "personId";
  const staffsCollRef = fsColl( fsDb, "staffs"),
    q = fsQuery( staffsCollRef, orderBy( order));
  try {
    const staffRecs = (await getDocs( q.withConverter( Admin.converter))).docs.map( d => d.data());
    console.log(`${staffRecs.length} staff records retrieved ${order ? "ordered by " + order : ""}`);
    return staffRecs;
  } catch (e) {
    console.error(`Error retrieving staff records: ${e}`);
  }
};
/**
 * Update a Firestore document in the Firestore collection "staffs"
 * @param slots: {object}
 * @returns {Promise<void>}
 */
Admin.update = async function (slots) {
  let noConstraintViolated = true,
  validationResult = null,
  staffBeforeUpdate = null;
const staffDocRef = fsDoc( fsDb, "staffs", slots.personId.toString()).withConverter( Admin.converter),
  updatedSlots = {};
try {
  // retrieve up-to-date staff record
  const staffDocSn = await getDoc( staffDocRef);
  staffBeforeUpdate = staffDocSn.data();
} catch (e) {
  console.error(`${e.constructor.name}: ${e.message}`);
}
try {
  if (staffBeforeUpdate.name !== slots.name) {
    validationResult = Person.checkName( slots.name);
    if (validationResult instanceof NoConstraintViolation) updatedSlots.name = slots.name;
    else throw validationResult;
  }
  if (staffBeforeUpdate.type !== parseInt( slots.type)) {
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
    await updateDoc(staffDocRef, updatedSlots);
    console.log(`Property ${updatedProperties.toString()} modified for staff record "${slots.personId}"`);
  } else if (updatedProperties.length) {
    await updateDoc(staffDocRef, updatedSlots);
    console.log(`Properties ${updatedProperties.toString()} modified for staff record "${slots.personId}"`);
  } else {
    console.log(`No property value changed for staff record "${slots.personId}"!`);
  }
}
};

/**
 * Delete a Firestore document from the Firestore collection "staffs"
 * @param personId: {string}
 * @returns {Promise<void>}
 */
Admin.destroy = async function (personId) {
  try {
    await deleteDoc( fsDoc(fsDb, "staffs", personId.toString()));
    console.log(`Admin record "${personId}" deleted!`);
  } catch (e) {
    console.error(`Error deleting staff record: ${e}`);
  }
};
/*******************************************
 *** Auxiliary methods for testing **********
 ********************************************/
/**
 * Create test data
 */
Admin.generateTestData = async function () {
  try {
    console.log("Generating test data...");
    const response = await fetch("../../test-data/staffs.json");
    const staffRecs = await response.json();
    await Promise.all( staffRecs.map( d => Admin.add( d)));
    console.log(`${staffRecs.length} staffs saved.`);
  } catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
  }
};
/**
 * Clear database
 */
Admin.clearData = async function () {
  if (confirm("Do you really want to delete all staffs?")) {
    try {
      console.log("Clearing test data...");
      const staffsCollRef = fsColl( fsDb, "staffs");
      const staffsQrySn = (await getDocs( staffsCollRef));  
      // delete all documents
      await Promise.all( staffsQrySn.docs.map( d => Admin.destroy( d.id)));
      // ... and then report that they have been deleted
      console.log(`${staffsQrySn.docs.length} staff records deleted.`);
    } catch (e) {
      console.error(`${e.constructor.name}: ${e.message}`);
    }
  }
};

Admin.converter = {
  toFirestore: function(staff) {
    return {
      staffId: staff.personId,
      name: staff.name,
      type: parseInt( staff.type)
    };
  },
  fromFirestore: function(snapshot, options) {
    const data = snapshot.data( options);
    return new Admin( data);
  }
};

Admin.observeChanges = async function (id) {
  try {
    // listen document changes, returning a snapshot (snapshot) on every change
    const staffDocRef = fsDoc( fsDb, "staffs", id.toString()).withConverter( Admin.converter);
    const staffRec = (await getDoc( staffDocRef)).data();
    return onSnapshot( staffDocRef, function (snapshot) {
      // create object with original document data
      const originalData = { itemName: "staff", description: `${staffRec.name} (PersonId: ${staffRec.personId })`};
      if (!snapshot.data()) { // removed: if snapshot has not data
        originalData.type = "REMOVED";
        createModalFromChange( originalData); // invoke modal window reporting change of original data
      } else if (JSON.stringify( staffRec) !== JSON.stringify( snapshot.data())) {
        originalData.type = "MODIFIED";
        createModalFromChange( originalData); // invoke modal window reporting change of original data
      }
    });
  } catch (e) {
    console.error(`${e.constructor.name} : ${e.message}`);
  }
};

export default Admin;