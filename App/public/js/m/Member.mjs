import { fsDb } from "../initFirebase.mjs";
import Person from "../m/Person.mjs";
import { collection as fsColl, doc as fsDoc, getDoc, getDocs, where,
  setDoc, orderBy, updateDoc, writeBatch, arrayRemove, arrayUnion, query as fsQuery }
  from "https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore.js";
import { NoConstraintViolation } from "../../lib/errorTypes.mjs";

/**
 * Constructor function for the class Member
 * @constructor
 * @param {{personId: number, name: string, type: PersonTypeEL}} slots - Object creation slots.
 */
class Member extends Person {
  // record parameter with the ES6 syntax for function parameter destructuring
  constructor({personId, name, type}) {
    super({personId, name, type});
  };
  get listOfClubs() {
    return this._listOfClubs;
  }
}

Member.converter = {
  toFirestore: function(member) {
    return {
      personId: member.personId,
      name: member.name,
      type: parseInt( member.type)
    };
  },
  fromFirestore: function(snapshot, options) {
    const data = snapshot.data( options),
      member = new Member( data);
    member._listOfClubs = data.listOfClubs;
    return member;
  }
};

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
    let validationResult = await Member.checkPersonIdAsId( member.personId);
    if (!(validationResult instanceof NoConstraintViolation)) throw validationResult;
    const memberDocRef = fsDoc( fsDb, "members", slots.personId.toString())
      .withConverter( Member.converter);
    await setDoc( memberDocRef, member);
    console.log(`Member with id = "${member.personId}" created!`);
  } catch (e) {
    console.error(`${e.constructor.name}: ${e.message} + ${e}`);
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
    clubsCollRef = fsColl(fsDb, "clubs"),
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
  const updatedProperties = Object.keys(updatedSlots);
  if (updatedProperties.length && noConstraintViolated) {
    try {
      const memberRefBefore
          = {id: parseInt(slots.personId), name: memberBeforeUpdate.name},
        memberRefAfter = {id: parseInt(slots.personId), name: slots.name},
        q = fsQuery( clubsCollRef, where("clubMemberIdRefs", "array-contains",
          memberRefBefore)),
        clubQrySns = (await getDocs(q)),
        batch = writeBatch( fsDb); // initiate batch write
      // iterate ID references (foreign keys) of master class objects (clubs) and
      // update derived inverse reference properties, remove/add
      await Promise.all( clubQrySns.docs.map( d => {
        const clubDocRef = fsDoc(clubsCollRef, d.id);
        batch.update(clubDocRef, {clubMemberIdRefs: arrayRemove( memberRefBefore)});
        batch.update(clubDocRef, {clubMemberIdRefs: arrayUnion( memberRefAfter)});
      }));
      // update club object
      batch.update(memberDocRef, updatedSlots);
      batch.commit(); // commit batch write
    } catch (e) {
      console.error(`${e.constructor.name}: ${e.message}`);
    }

    if (updatedProperties.length === 1) {
      await updateDoc(memberDocRef, updatedSlots);
      console.log(`Property ${updatedProperties.toString()} modified for member record "${slots.personId}"`);
    } else if (updatedProperties.length) {
      await updateDoc(memberDocRef, updatedSlots);
      console.log(`Properties ${updatedProperties.toString()} modified for member record "${slots.personId}"`);
    }
  } else {
    console.log(`No property value changed for member record "${slots.personId}"!`);
  }
};

/**
 * Delete a Firestore document from the Firestore collection "members"
 * @param personId: {string}
 * @returns {Promise<void>}
 */
Member.destroy = async function (slots) {
  const membersCollRef = fsColl( fsDb, "members"),
    clubsCollRef = fsColl( fsDb, "clubs");
  try {
    const memberRef = {id: parseInt( slots.personId), name: slots.name},
      q = fsQuery( clubsCollRef, where("clubMemberIdRefs", "array-contains", memberRef)),
      memberDocRef = fsDoc( membersCollRef, String( slots.personId)),
      clubQrySns = (await getDocs( q)),
      batch = writeBatch( fsDb); // initiate batch write
    // iterate ID references (foreign keys) of master class objects (clubs) and
    // delete derived inverse reference properties
    await Promise.all( clubQrySns.docs.map( d => {
      const clubDocRef = fsDoc(clubsCollRef, d.id);
      batch.update(clubDocRef, {clubMemberIdRefs: arrayRemove( memberRef)});
    }));
    batch.delete( memberDocRef);
    batch.commit();
    console.log(`Member record "${slots.personId}" deleted!`);
  } catch (e) {
    console.error(`Error deleting member record: ${e}`);
  }
};

export default Member;