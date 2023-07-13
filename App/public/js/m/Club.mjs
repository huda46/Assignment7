import { fsDb } from "../initFirebase.mjs";
import Staff from "./Staff.mjs";
import Member from "./Member.mjs";
import Enumeration from "../../lib/Enumeration.mjs";
import { collection as fsColl, deleteDoc, doc as fsDoc, getDoc, getDocs, onSnapshot,
  setDoc, orderBy, updateDoc, deleteField, query as fsQuery }
  from "https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore.js";
import { isNonEmptyString, isIntegerOrIntegerString } from "../../lib/util.mjs";
import { NoConstraintViolation, MandatoryValueConstraintViolation, PatternConstraintViolation,
  RangeConstraintViolation, UniquenessConstraintViolation, ReferentialIntegrityConstraintViolation } from "../../lib/errorTypes.mjs";

const WeekDaysEL = new Enumeration(["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]);
const StatusEL = new Enumeration(["Open","Inactive","Full","Beta Phase"]);

/**
 * Constructor function for the class Club
 * @constructor
 * @param {{clubId: number, name: string, type: ClubTypeEL}} slots - Object creation slots.
 */
class Club {
  // record parameter with the ES6 syntax for function parameter destructuring
  constructor({clubId, name, trainerIdRefs, chair_id, status, fee, description, contactInfo, clubMemberIdRefs, startDate, endDate, daysInWeek, time, location}) {
    this.clubId = clubId;
    this.name = name;
    this.status = status;
    this.trainerIdRefs = trainerIdRefs;
    this.chair_id = chair_id;
    this.fee = fee;
    this.description = description;
    this.contactInfo = contactInfo;
    this.clubMemberIdRefs = clubMemberIdRefs;
    this.startDate = startDate;
    this.endDate = endDate;
    this.daysInWeek = daysInWeek;
    this.time = time;
    this.location = location;
  };

  ///////// Getter functions /////////
  get clubId() {
    return this._clubId;  
  };
  get name() {
    return this._name;
  };
  get status() {
    return this._status;
  };
  get trainerIdRefs() {
    return this._trainerIdRefs;
  };
  get chair_id() {
    return this._chair_id;
  };
  get fee() {
    return this._fee;  
  };
  get description() {
    return this._description;  
  };
  get contactInfo() {
    return this._contactInfo;  
  };
  get clubMemberIdRefs() {
    return this._clubMemberIdRefs;  
  };
  get startDate() {
    return this._startDate;  
  };
  get endDate() {
    return this._endDate;  
  };
  get daysInWeek() {
    return this._daysInWeek;  
  };
  get time() {
    return this._time;  
  };
  get location() {
    return this._location;  
  };

  ///////// Setter functions /////////
  set clubId( c) {
    c = parseInt(c);
    const validationResult = Club.checkClubId( c);
    if (validationResult instanceof NoConstraintViolation) {
      this._clubId = c;
    } else {
      throw validationResult;
    }
  };
  set name( n) {
    const validationResult = Club.checkName( n);
    if (validationResult instanceof NoConstraintViolation) {
      this._name = n;
    } else {
      throw validationResult;
    }
  };
  set status( s) {
    const validationResult = Club.checkStatus( s);
    if (validationResult instanceof NoConstraintViolation) {
      this._status = s;
    } else {
      throw validationResult;
    }
  };
  addTrainer( t) {
    this._trainerIdRefs.push( t);
  };
  removeTrainer( t) {
    this._trainerIdRefs = this._trainerIdRefs.filter( d => d.id !== t.id);
  }
  set trainerIdRefs( tid) {
    this._trainerIdRefs = tid;
  };
  set chair_id( cid) {
    this._chair_id = cid;
  };
  set fee( f) {
    const validationResult = Club.checkFee( f);
    if (validationResult instanceof NoConstraintViolation) {
      this._fee = f;
    } else {
      throw validationResult;
    }
  };
  set description( d) {
    const validationResult = Club.checkDescription( d);
    if (validationResult instanceof NoConstraintViolation) {
      this._description = d;
    } else {
      throw validationResult;
    }
  };
  set contactInfo( ci) {
    const validationResult = Club.checkContactInfo( ci);
    if (validationResult instanceof NoConstraintViolation) {
      this._contactInfo = ci;
    } else {
      throw validationResult;
    }
  };
  addMember( m) {
    this._clubMemberIdRefs.push( m);
  };
  removeMember( m) {
    this._clubMemberIdRefs = this._clubMemberIdRefs.filter( d => d.id !== m.id);
  }
  set clubMemberIdRefs( mid) {
    this._clubMemberIdRefs = mid;
  };
  set startDate( sd) {
    const validationResult = Club.checkStartDate( sd);
    if (validationResult instanceof NoConstraintViolation) {
      this._startDate = sd;
    } else {
      throw validationResult;
    }
  };
  set endDate( ed) {
    const validationResult = Club.checkEndDate( ed);
    if (validationResult instanceof NoConstraintViolation) {
      this._endDate = ed;
    } else {
      throw validationResult;
    }
  };
  set daysInWeek( diw) {
    const validationResult = Club.checkDaysInWeek( diw);
    if (validationResult instanceof NoConstraintViolation) {
      this._daysInWeek = diw;
    } else {
      throw validationResult;
    }
  };
  set time( t) {
    const validationResult = Club.checkTime( t);
    if (validationResult instanceof NoConstraintViolation) {
      this._time = t;
    } else {
      throw validationResult;
    }
  };
  set location( l) {
    const validationResult = Club.checkLocation( l);
    if (validationResult instanceof NoConstraintViolation) {
      this._location = l;
    } else {
      throw validationResult;
    }
  };


  ///////// Check functions /////////
  static checkClubId( id) {
    if (!id) {
      return new NoConstraintViolation(); 
    } else {
      id = parseInt( id); 
    if (isNaN( id) || !Number.isInteger( id) || id < 1) {
    return new RangeConstraintViolation("The club ID must be a positive integer!");
      } else {
    return new NoConstraintViolation();
      }
    }
  };
  static async checkClubIdAsId( id) {
    let validationResult = Club.checkClubId( id);
    if ((validationResult instanceof NoConstraintViolation)) {
      if (!id) {
        validationResult = new MandatoryValueConstraintViolation(
            "A positive integer value for the club ID is required!");
      } else {
        const clubDocSn = await getDoc( fsDoc( fsDb, "clubs", id.toString()));
        if (clubDocSn.exists()) {
          validationResult = new UniquenessConstraintViolation(
            "There is already a club with this Id!");
        } else {
          validationResult = new NoConstraintViolation();
        }
      }
    }
    return validationResult;
  };
  static async checkClubIdAsIdRef( id) {
    let validationResult = Club.checkClubId( id);
    if (validationResult instanceof NoConstraintViolation) {
      if (!id) {
        validationResult = new MandatoryValueConstraintViolation(
            "A positive integer value for the club ID is required!");
      } else {
        const clubDocSn = await getDoc( fsDoc( fsDb, "clubs", id.toString()));
        if (!clubDocSn.exists()) {
          validationResult = new ReferentialIntegrityConstraintViolation(
            "There is no club with this name!");
        } else validationResult = new NoConstraintViolation();
      }
    }
    return validationResult;
  };
  static checkName( name) {
    if (!name) {
      return new MandatoryValueConstraintViolation("A club´s name must be provided!");
    } else if (!isNonEmptyString( name)) {
      return new RangeConstraintViolation("The name of club must be a non-empty string!");
    } else {
      return new NoConstraintViolation();
    }
  };
  static checkStatus( status) {
    if (!status) {
      return new MandatoryValueConstraintViolation("A status must be provided!");
    } else if (!isIntegerOrIntegerString(status) || parseInt(status) < 1 ||
        parseInt(status) > StatusEL.MAX) {
      return new RangeConstraintViolation(`Invalid value for type: ${t}`);
    } else {
      return new NoConstraintViolation();
    }
  };
  static checkFee( fee) {
    if (!fee) {
      return new NoConstraintViolation();
    } else {
      fee = parseInt( fee); 
      if (isNaN( fee) || !Number.isInteger( fee) || fee < 1) {
        return new RangeConstraintViolation("The fee must be a positive integer!");
      } else {
        return new NoConstraintViolation();
      }
    }
  };
  static checkDescription( description) {
    if (!description) {
      return new NoConstraintViolation();
    } else if (!isNonEmptyString( description)) {
      return new RangeConstraintViolation("The description must be a string!");
    } else {
      return new NoConstraintViolation();
    }
  };
  static checkContactInfo( contactInfo) {
    if (!contactInfo) {
      return new NoConstraintViolation();
    } else if (!isNonEmptyString( contactInfo)) {
      return new RangeConstraintViolation("The contact information must be a string!");
    } else {
      return new NoConstraintViolation();
    }
  };
  static checkStartDate( startDate) {
    if (!startDate) {
      return new MandatoryValueConstraintViolation("A startDate must be provided!");
    } else if (!(typeof startDate === "string" &&
    /\d{4}-(0\d|1[0-2])-([0-2]\d|3[0-1])/.test( startDate) &&
    !isNaN( Date.parse( startDate)))) {
    return new PatternConstraintViolation(
      "The startDate is not well formed");
    } else {
      return new NoConstraintViolation();
    }
  };
  static checkEndDate( endDate) {
    if (!endDate) {
      return new MandatoryValueConstraintViolation("An endDate must be provided!");
    } else if (!(typeof endDate === "string" &&
    /\d{4}-(0\d|1[0-2])-([0-2]\d|3[0-1])/.test( endDate) &&
    !isNaN( Date.parse( endDate)))) {
    return new PatternConstraintViolation(
      "The endDate is not well formed");
    } else return new NoConstraintViolation();
  };
  static checkDayInWeek( day) {
    if (day == undefined) {
      return new MandatoryValueConstraintViolation("No day provided!");
    } else if (!isIntegerOrIntegerString(day) || parseInt(day) < 1 ||
        parseInt(day) > WeekDaysEL.MAX) {
      return new RangeConstraintViolation("The name of club must be a non-empty string!");
    } else {
      return new NoConstraintViolation();
    }
  };
  static checkDaysInWeek( days) {
    if (!days || (Array.isArray( days) &&
        days.length === 0)) {
      return new MandatoryValueConstraintViolation("At least one day must be provided!");
    } else if (!Array.isArray( days)) {
      return new RangeConstraintViolation(
        "The value of days must be an array!");
    } else {
      for (let i of days.keys()) {
        const validationResult = Club.checkDayInWeek( days[i]);
        if (!(validationResult instanceof NoConstraintViolation)) {
          return validationResult;
        }
      }
      return new NoConstraintViolation();
    }
  };
  static checkTime( timeString) {
    const newDate = new Date(timeString);
    if (!timeString) {
      return new MandatoryValueConstraintViolation("A time must be provided!");
    } else if (!isNonEmptyString( timeString)) {
      return new RangeConstraintViolation("The time must be a non-empty string!");
    } else if (isNaN(newDate) || !/\b\d{2}:\d{2}\b/.test(newDateString)) {
      return new RangeConstraintViolation(
          "The time must be a real date in the form HH:MM!");
    } else {
      return new NoConstraintViolation();
    }
  };
  static checkLocation( loc) {
    if (!loc) {
      return new MandatoryValueConstraintViolation("A address must be provided!");
    } else if (!isNonEmptyString( loc)) {
      return new RangeConstraintViolation("The address must be a non-empty string!");
    } else {
      return new NoConstraintViolation();
    }
  };
}
/*********************************************************
 ***  Class-level ("static") storage management methods **
 *********************************************************/
/**
 * Create a Firestore document in the Firestore collection "clubs"
 * @param slots: {object}
 * @returns {Promise<void>}
 */
Club.add = async function (slots) {
  let club = null;
  try {
    club = new Club( slots);
    let validationResult = await Club.checkClubIdAsId( club.clubId);
    if (!(validationResult instanceof NoConstraintViolation)) throw validationResult;
    validationResult = await Staff.checkPersonIdAsIdRef( club.chair_id);
    if (!(validationResult instanceof NoConstraintViolation)) throw validationResult;
    for (const a of club.trainerIdRefs) {
      const validationResult = await Staff.checkPersonIdAsIdRef( String(a.id));
      if (!(validationResult instanceof NoConstraintViolation)) throw validationResult;
    }
    for (const a of club.clubMemberIdRefs) {
      const validationResult = await Member.checkPersonIdAsIdRef( String(a.id));
      if (!(validationResult instanceof NoConstraintViolation)) throw validationResult;
    }
  } catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
    club = null;
  }
  if (club) {
    const clubDocRef = fsDoc( fsDb, "clubs", club.clubId.toString()).withConverter( Club.converter);
    try {
      const batch = writeBatch( fsDb);
      await batch.set( clubDocRef, club);

      
      await setDoc( clubDocRef, club);
      console.log(`Club record "${club.clubId}" created!`);
    } catch (e) {
      console.error(`${e.constructor.name}: ${e.message} + ${e}`);
    }
  }
};
/**
 * Load a club record from Firestore
 * @param clubId: {object}
 * @returns {Promise<*>} clubRecord: {array}
 */
Club.retrieve = async function (clubId) {
  try {
    const clubRec = (await getDoc( fsDoc(fsDb, "clubs", clubId.toString())
      .withConverter( Club.converter))).data();
    console.log(`Club record "${clubRec.clubId}" retrieved.`);
    return clubRec;
  } catch (e) {
    console.error(`Error retrieving club record: ${e}`);
  }
};
/**
 * Load all club records from Firestore
 * @returns {Promise<*>} clubRecords: {array}
 */
Club.retrieveAll = async function (order) {
  if (!order) order = "clubId";
  const clubsCollRef = fsColl( fsDb, "clubs"),
    q = fsQuery( clubsCollRef, orderBy( order));
  try {
    const clubRecs = (await getDocs( q.withConverter( Club.converter))).docs.map( d => d.data());
    console.log(`${clubRecs.length} club records retrieved ${order ? "ordered by " + order : ""}`);
    return clubRecs;
  } catch (e) {
    console.error(`Error retrieving club records: ${e}`);
  }
};
/**
 * Update a Firestore document in the Firestore collection "clubs"
 * @param slots: {object}
 * @returns {Promise<void>}
 */
Club.update = async function (slots) {
  let noConstraintViolated = true,
  validationResult = null,
  clubBeforeUpdate = null;
  const clubDocRef = fsDoc( fsDb, "clubs", slots.clubId.toString()).withConverter( Club.converter),
    updatedSlots = {};
  try {
    // retrieve up-to-date club record
    const clubDocSn = await getDoc( clubDocRef);
    clubBeforeUpdate = clubDocSn.data();
  } catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
  }
  try {
    if (clubBeforeUpdate.name !== slots.name) {
      validationResult = Club.checkName( slots.name);
      if (validationResult instanceof NoConstraintViolation) updatedSlots.name = slots.name;
      else throw validationResult;
    }
    if (clubBeforeUpdate.status !== parseInt( slots.status)) {
      validationResult = Club.checkStatus( slots.status);
      if (validationResult instanceof NoConstraintViolation) updatedSlots.status = slots.status;
      else throw validationResult;
    }
    if (clubBeforeUpdate.fee !== slots.fee) {
      validationResult = Club.checkFee( slots.fee);
      if (validationResult instanceof NoConstraintViolation) updatedSlots.fee = slots.fee;
      else throw validationResult;
    }
    if (clubBeforeUpdate.description !== slots.description) {
      validationResult = Club.checkDescription( slots.description);
      if (validationResult instanceof NoConstraintViolation) updatedSlots.description = slots.description;
      else throw validationResult;
    }
    if (clubBeforeUpdate.contactInfo !== slots.contactInfo) {
      validationResult = Club.checkContactInfo( slots.contactInfo);
      if (validationResult instanceof NoConstraintViolation) updatedSlots.contactInfo = slots.contactInfo;
      else throw validationResult;
    }
    if (clubBeforeUpdate.startDate !== slots.startDate) {
      validationResult = Club.checkStartDate( slots.startDate);
      if (validationResult instanceof NoConstraintViolation) updatedSlots.startDate = slots.startDate;
      else throw validationResult;
    }
    if (clubBeforeUpdate.endDate !== slots.endDate) {
      validationResult = Club.checkEndDate( slots.endDate);
      if (validationResult instanceof NoConstraintViolation) updatedSlots.endDate = slots.endDate;
      else throw validationResult;
    }
    if (clubBeforeUpdate.daysInWeek !== slots.daysInWeek) {
      validationResult = Club.checkDaysInWeek( slots.daysInWeek);
      if (validationResult instanceof NoConstraintViolation) updatedSlots.daysInWeek = slots.daysInWeek;
      else throw validationResult;
    }
    if (clubBeforeUpdate.time !== slots.time) {
      validationResult = Club.checkTime( slots.time);
      if (validationResult instanceof NoConstraintViolation) updatedSlots.time = slots.time;
      else throw validationResult;
    }
    if (clubBeforeUpdate.location !== slots.location) {
      validationResult = Club.checkLocation( slots.location);
      if (validationResult instanceof NoConstraintViolation) updatedSlots.location = slots.location;
      else throw validationResult;
    }
  } catch (e) {
    noConstraintViolated = false;
    console.error(`${e.constructor.name}: ${e.message}`);
  }
  if (noConstraintViolated) {
    const updatedProperties = Object.keys(updatedSlots);
    if (updatedProperties.length === 1) {
      await updateDoc(clubDocRef, updatedSlots);
      console.log(`Property ${updatedProperties.toString()} modified for club record "${slots.clubId}"`);
    } else if (updatedProperties.length) {
      await updateDoc(clubDocRef, updatedSlots);
      console.log(`Properties ${updatedProperties.toString()} modified for club record "${slots.clubId}"`);
    } else {
      console.log(`No property value changed for club record "${slots.clubId}"!`);
    }
  }
};

/**
 * Delete a Firestore document from the Firestore collection "clubs"
 * @param clubId: {string}
 * @returns {Promise<void>}
 */
Club.destroy = async function (clubId) {
  try {
    await deleteDoc( fsDoc(fsDb, "clubs", clubId.toString()));
    console.log(`Club record "${clubId}" deleted!`);
  } catch (e) {
    console.error(`Error deleting club record: ${e}`);
  }
};
/*******************************************
 *** Auxiliary methods for testing **********
 ********************************************/
/**
 * Create test data
 */
Club.generateTestData = async function () {
  try {
    console.log("Generating test data...");
    const response = await fetch("../../test-data/clubs.json");
    const clubRecs = await response.json();
    await Promise.all( clubRecs.map( d => Club.add( d)));
    console.log(`${clubRecs.length} clubs saved.`);
  } catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
  }
};
/**
 * Clear database
 */
Club.clearData = async function () {
  if (confirm("Do you really want to delete all clubs?")) {
    try {
      console.log("Clearing test data...");
      const clubsCollRef = fsColl( fsDb, "clubs");
      const clubsQrySn = (await getDocs( clubsCollRef));  
      // delete all documents
      await Promise.all( clubsQrySn.docs.map( d => Club.destroy( d.id)));
      // ... and then report that they have been deleted
      console.log(`${clubsQrySn.docs.length} club records deleted.`);
    } catch (e) {
      console.error(`${e.constructor.name}: ${e.message}`);
    }
  }
};

Club.converter = {
  toFirestore: function(club) {
    return {
      clubId: club.clubId,
      name: club.name,
      status: parseInt( club.status),
      fee: club.fee,
      description: club.description,
      contactInfo: club.contactInfo,
      startDate: club.startDate,
      endDate: club.endDate,
      daysInWeek: club.daysInWeek,
      time: club.time,
      location: club.location
    };
  },
  fromFirestore: function(snapshot, options) {
    const data = snapshot.data( options);
    return new Club( data);
  }
};

Club.observeChanges = async function (id) {
  try {
    // listen document changes, returning a snapshot (snapshot) on every change
    const clubDocRef = fsDoc( fsDb, "clubs", id.toString()).withConverter( Club.converter);
    const clubRec = (await getDoc( clubDocRef)).data();
    return onSnapshot( clubDocRef, function (snapshot) {
      // create object with original document data
      const originalData = { itemName: "club", description: `${clubRec.name} (ClubId: ${clubRec.clubId })`};
      if (!snapshot.data()) { // removed: if snapshot has not data
        originalData.type = "REMOVED";
        createModalFromChange( originalData); // invoke modal window reporting change of original data
      } else if (JSON.stringify( clubRec) !== JSON.stringify( snapshot.data())) {
        originalData.type = "MODIFIED";
        createModalFromChange( originalData); // invoke modal window reporting change of original data
      }
    });
  } catch (e) {
    console.error(`${e.constructor.name} : ${e.message}`);
  }
};

export default Club;