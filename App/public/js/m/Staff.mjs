import { fsDb } from "../initFirebase.mjs";
import Person from "../m/Person.mjs";
import { collection as fsColl, doc as fsDoc, getDoc, getDocs, where, writeBatch,
  setDoc, orderBy, updateDoc, deleteField, query as fsQuery }
  from "https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore.js";
import { NoConstraintViolation, MandatoryValueConstraintViolation,
   UniquenessConstraintViolation, ReferentialIntegrityConstraintViolation } from "../../lib/errorTypes.mjs";

/**
 * Constructor function for the class Person
 * @constructor
 * @param {{personId: string, name: string, type: PersonTypeEL}} slots - Object creation slots.
 */
class Staff extends Person {
  // record parameter with the ES6 syntax for function parameter destructuring
  constructor({personId, firstname, lastname, type}) {
    super({personId, firstname, lastname, type});
  };

  get managingClubs() {
    return this._managingClubs;
  };

  static async checkPersonIdAsId( id) {
    let validationResult = Person.checkPersonId( id);
    if ((validationResult instanceof NoConstraintViolation)) {
      if (!id) {
        validationResult = new MandatoryValueConstraintViolation(
            "A value for the person ID must be provided!");
      } else {
        const staffDocSn = await getDoc( fsDoc( fsDb, "staffs", id));
        if (staffDocSn.exists()) {
          validationResult = new UniquenessConstraintViolation(
            "There is already a staff record with this ID!");
        } else {
          validationResult = new NoConstraintViolation();
        }
      }
    }
    return validationResult;
  };
  static async checkPersonIdAsIdRef( id) {
    let constraintViolation = Person.checkPersonId( id);
    if ((constraintViolation instanceof NoConstraintViolation) && id) {
      const staffDocSn = await getDoc( fsDoc( fsDb, "staffs", id));
      if (!staffDocSn.exists()) {
        constraintViolation = new ReferentialIntegrityConstraintViolation(
          `There is no staff record with this staff ID ${id}!`);
      }
    }
    return constraintViolation;
  };
}

Staff.converter = {
  toFirestore: function(staff) {
    return {
      staffId: staff.personId,
      firstname: staff.firstname,
      lastname: staff.lastname,
      type: parseInt( staff.type)
    };
  },
  fromFirestore: function(snapshot, options) {
    const data = snapshot.data( options),
      staff = new Staff( data);
    staff._managingClubs = data.managingClubs;
    return staff;
  }
};
/*********************************************************
 ***  Class-level ("static") storage management methods **
 *********************************************************/
/**
 * Create a Firestore document in the Firestore collection "staffs"
 * @param slots: {object}
 * @returns {Promise<void>}
 */
Staff.add = async function (slots) {
  let staff = null;
  try {
    staff = new Staff( slots);
    let validationResult = await Staff.checkPersonIdAsId( staff.personId);
    if (!(validationResult instanceof NoConstraintViolation)) {
      throw validationResult;
    }
  } catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
    staff = null;
  }
  if (staff) {
    try {
      const staffDocRef = fsDoc( fsDb, "staffs", staff.personId).withConverter( Staff.converter);
      await setDoc( staffDocRef, staff);
      console.log(`Staff record "${staff.personId}" created!`);
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
Staff.retrieve = async function (personId) {
  try {
    const staffRec = (await getDoc( fsDoc(fsDb, "staffs", personId)
      .withConverter( Staff.converter))).data();
    console.log(`Staff record "${staffRec.personId}" retrieved.`);
    return staffRec;
  } catch (e) {
    console.error(`Error retrieving staff record: ${e}`);
  }
};
/**
 * Load all staff records from Firestore
 * @returns {Promise<*>} staffRecords: {array}
 */
Staff.retrieveAll = async function (order) {
  if (!order) order = "personId";
  const staffsCollRef = fsColl( fsDb, "staffs"),
    q = fsQuery( staffsCollRef, orderBy( order));
  try {
    const staffRecs = (await getDocs( q.withConverter( Staff.converter))).docs.map( d => d.data());
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
Staff.update = async function (slots) {
  let noConstraintViolated = true,
  validationResult = null,
  staffBeforeUpdate = null;
const staffDocRef = fsDoc( fsDb, "staffs", slots.personId).withConverter( Staff.converter),
  updatedSlots = {};
try {
  // retrieve up-to-date staff record
  const staffDocSn = await getDoc( staffDocRef);
  staffBeforeUpdate = staffDocSn.data();
} catch (e) {
  console.error(`${e.constructor.name}: ${e.message}`);
}
try {
  if (staffBeforeUpdate.firstname !== slots.firstname) {
    validationResult = Person.checkName( slots.firstname);
    if (validationResult instanceof NoConstraintViolation) updatedSlots.firstname = slots.firstname;
    else throw validationResult;
  }
  if (staffBeforeUpdate.lastname !== slots.lastname) {
    validationResult = Person.checkName( slots.lastname);
    if (validationResult instanceof NoConstraintViolation) updatedSlots.lastname = slots.lastname;
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
Staff.destroy = async function (personId) {
  const clubsCollRef = fsColl( fsDb, "clubs"),
    q = fsQuery( clubsCollRef, where("chair_id", "==", personId)),
    staffDocRef = fsDoc( fsColl( fsDb, "staffs"), personId);
  try {
    const clubQrySns = (await getDocs( q)),
      batch = writeBatch( fsDb); // initiate batch write
    // iterate ID references (foreign keys) of master class objects (books) and
    // update derived inverse reference property
    await Promise.all( clubQrySns.docs.map( d => {
      batch.update( fsDoc( clubsCollRef, d.id), {
        chair_id: deleteField()
      });
    }));
    batch.delete( staffDocRef); // delete publisher record
    batch.commit(); // finish batch write
    console.log(`Staff record "${personId}" deleted!`);
  } catch (e) {
    console.error(`Error deleting staff record: ${e}`);
  }
};

export default Staff;