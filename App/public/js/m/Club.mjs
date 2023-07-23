import { fsDb } from "../initFirebase.mjs";
import Staff from "./Staff.mjs";
import Member from "./Member.mjs";
import Enumeration from "../../lib/Enumeration.mjs";
import { collection as fsColl, doc as fsDoc, Timestamp, getDoc, getDocs, onSnapshot,
  orderBy, deleteField, query as fsQuery, startAt, limit, writeBatch, arrayUnion, arrayRemove }
  from "https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore.js";
import { isNonEmptyString, isIntegerOrIntegerString, date2IsoDateString } from "../../lib/util.mjs";
import { NoConstraintViolation, MandatoryValueConstraintViolation, PatternConstraintViolation,
  RangeConstraintViolation, UniquenessConstraintViolation, ReferentialIntegrityConstraintViolation } from "../../lib/errorTypes.mjs";

const WeekDaysEL = new Enumeration(["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]);
const StatusEL = new Enumeration(["Open","Inactive","Full","Beta Phase"]);

/**
 * Constructor function for the class Club
 * @constructor
 * @param {{clubId: number, name: string, status: StatusEL}} slots - Object creation slots.
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
    this._trainerIdRefs = this._trainerIdRefs.filter( d => d.personId !== t.personId);
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
    this._clubMemberIdRefs = this._clubMemberIdRefs.filter( d => d.personId !== m.personId);
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

Club.converter = {
  toFirestore: function(club) {
    const data =  {
      clubId: club.clubId,
      name: club.name,
      status: parseInt( club.status),
      trainerIdRef: club.trainerIdRef,
      fee: club.fee,
      description: club.description,
      contactInfo: club.contactInfo,
      memberIdRef: club.memberIdRef,
      startDate: Timestamp.fromDate( new Date(club.startDate)),
      endDate: Timestamp.fromDate( new Date(club.endDate)),
      daysInWeek: club.daysInWeek,
      time: Timestamp.fromDate( new Date(club.time)),
      location: club.location
    };
    if (club.chair_id) data.chair_id = club.chair_id;
    return data;
  },
  fromFirestore: function(snapshot, options) {
    const club = snapshot.data( options),
      data = {
        clubId: club.clubId,
        name: club.name,
        status: parseInt( club.status),
        trainerIdRef: club.trainerIdRef,
        fee: club.fee,
        description: club.description,
        contactInfo: club.contactInfo,
        memberIdRef: club.memberIdRef,
        startDate: date2IsoDateString( club.startDate.toDate()),
        endDate: date2IsoDateString( club.endDate.toDate()),
        daysInWeek: club.daysInWeek,
        time: date2IsoDateString( club.time.toDate()),
        location: club.location
      };
    if (club.chair_id) data.chair_id = club.chair_id;
    return new Club( data);
  }
};

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
      const validationResult = await Staff.checkPersonIdAsIdRef( a.personId);
      if (!(validationResult instanceof NoConstraintViolation)) throw validationResult;
    }
    for (const a of club.clubMemberIdRefs) {
      const validationResult = await Member.checkPersonIdAsIdRef( a.personId);
      if (!(validationResult instanceof NoConstraintViolation)) throw validationResult;
    }
  } catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
    club = null;
  }
  if (club) {
    const clubDocRef = fsDoc( fsDb, "clubs", club.clubId.toString())
        .withConverter( Club.converter),
      membersCollRef = fsColl( fsDb, "members")
        .withConverter( Member.converter);
    const clubInverseRef = {clubId: club.clubId, name: club.name};
    try {
      const batch = writeBatch( fsDb);
      await batch.set( clubDocRef, club);
      await Promise.all( club.clubMemberIdRefs.map( a => {
        const memberDocRef = fsDoc( membersCollRef, a.personId);
        batch.update( memberDocRef, {listOfClubs: arrayUnion( clubInverseRef)});
      }));
      batch.commit();
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
 * Load a block of club records from Firestore
 * @returns {Promise<*>} clubRecords: {array}
 */
Club.retrieveBlock = async function (params) {
  try {
    let clubsCollRef = fsColl( fsDb, "clubs");
    // set limit and order in query
    clubsCollRef = fsQuery( clubsCollRef, limit( 11));
    if (params.order) clubsCollRef = fsQuery( clubsCollRef, orderBy( params.order));
    // set pagination "startAt" cursor
    if (params.cursor) {
      if (params.order === "startDate")
        clubsCollRef = fsQuery( clubsCollRef, startAt( Timestamp
          .fromDate( new Date( params.cursor))));
      else clubsCollRef = fsQuery( clubsCollRef, startAt( params.cursor));
    }
    const clubRecs = (await getDocs( clubsCollRef.withConverter( Club.converter))).docs.map( d => d.data());
    console.log(`${clubRecs.length} club records retrieved ${params.order ? "ordered by " + params.order : ""}`);
    return clubRecs;
  } catch (e) {
    console.error(`Error retrieving club records: ${e}`);
  }
};
/**
 * Update a Firestore document in the Firestore collection "clubs"
 * @returns {Promise<void>}
 */
Club.update = async function ({clubId, name, trainerIdRefsToAdd, trainerIdRefsToRemove, chair_id, status, fee, description, contactInfo, clubMemberIdRefsToAdd, clubMemberIdRefsToRemove, startDate, endDate, daysInWeek, time, location}) {
  let noConstraintViolated = true,
    validationResult = null,
    clubBeforeUpdate = null;
  const clubDocRef = fsDoc( fsDb, "clubs", clubId.toString()).withConverter( Club.converter),
    updatedSlots = {};
  try {
    // retrieve up-to-date club record
    clubBeforeUpdate = await getDoc( clubDocRef).data();
  } catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
  }
  if (clubBeforeUpdate) {
    if (trainerIdRefsToAdd) for (const trainerIdRef of trainerIdRefsToAdd)
      clubBeforeUpdate.addTrainer( trainerIdRef);
    if (trainerIdRefsToRemove) for (const trainerIdRef of trainerIdRefsToRemove)
      clubBeforeUpdate.removeTrainer( trainerIdRef);
    if (trainerIdRefsToAdd || trainerIdRefsToRemove)
      updatedSlots.trainerIdRefs = clubBeforeUpdate.trainerIdRefs;

    if (clubMemberIdRefsToAdd) for (const memberIdRef of clubMemberIdRefsToAdd)
      clubBeforeUpdate.addMember( memberIdRef);
    if (clubMemberIdRefsToRemove) for (const memberIdRef of clubMemberIdRefsToRemove)
      clubBeforeUpdate.removeMember( memberIdRef);
    if (clubMemberIdRefsToAdd || clubMemberIdRefsToRemove)
      updatedSlots.clubMemberIdRefs = clubBeforeUpdate.clubMemberIdRefs;

    if (chair_id && clubBeforeUpdate.chair_id !== chair_id) {
      updatedSlots.chair_id = chair_id;
    } else if (!chair_id && clubBeforeUpdate.chair_id !== undefined) {
      updatedSlots.chair_id = deleteField();
    }

    if (clubBeforeUpdate.name !== name) updatedSlots.name = name;
    if (clubBeforeUpdate.status !== parseInt( status)) updatedSlots.status = status;
    if (clubBeforeUpdate.fee !== fee) updatedSlots.fee = fee;
    if (clubBeforeUpdate.description !== description) updatedSlots.description = description;
    if (clubBeforeUpdate.contactInfo !== contactInfo) updatedSlots.contactInfo = contactInfo;
    if (clubBeforeUpdate.startDate !== startDate)
      updatedSlots.startDate = Timestamp.fromDate(new Date(startDate));
    if (clubBeforeUpdate.endDate !== endDate) 
      updatedSlots.endDate = Timestamp.fromDate(new Date(endDate));
    if (clubBeforeUpdate.daysInWeek !== daysInWeek) updatedSlots.daysInWeek = daysInWeek;
    if (clubBeforeUpdate.time !== time) 
      updatedSlots.time = Timestamp.fromDate(new Date(time));
    if (clubBeforeUpdate.location !== location) updatedSlots.location = location;
  }  
  // if there are updates, run checkers while updating master object (club)
  // in a batch write transaction
  const updatedProperties = Object.keys(updatedSlots);
  if (updatedProperties.length) {
    try {
      const memberCollRef = fsColl( fsDb, "members")
          .withConverter( Member.converter);
      // initialize (before and after update) inverse personId references
      const inverseRefBefore = {clubId: clubId, name: clubBeforeUpdate.name};
      const inverseRefAfter = {clubId: clubId, name: name};
      const batch = writeBatch( fsDb); // initiate batch write

      if (updatedSlots.status) {
        validationResult = Club.checkStatus( status);
        if (!(validationResult instanceof NoConstraintViolation)) throw validationResult;
      }
      if (updatedSlots.chair_id) {
        validationResult = await Staff.checkPersonIdAsIdRef( chair_id);
        if (!(validationResult instanceof NoConstraintViolation)) throw validationResult;
      }
      if (trainerIdRefsToAdd) {
        await Promise.all(trainerIdRefsToAdd.map( async a => {
          validationResult = await Staff.checkPersonIdAsIdRef( a.personId);
          if (!(validationResult instanceof NoConstraintViolation)) throw validationResult;
        }));
      }
      if (updatedSlots.fee) {
        validationResult = Club.checkFee( fee);
        if (!(validationResult instanceof NoConstraintViolation)) throw validationResult;
      }
      if (updatedSlots.description) {
        validationResult = Club.checkDescription( description);
        if (!(validationResult instanceof NoConstraintViolation)) throw validationResult;
      }
      if (updatedSlots.contactInfo) {
        validationResult = Club.checkContactInfo( contactInfo);
        if (!(validationResult instanceof NoConstraintViolation)) throw validationResult;
      }
      if (updatedSlots.startDate) {
        validationResult = Club.checkStartDate( startDate);
        if (!(validationResult instanceof NoConstraintViolation)) throw validationResult;
      }
      if (updatedSlots.endDate) {
        validationResult = Club.checkEndDate( endDate);
        if (!(validationResult instanceof NoConstraintViolation)) throw validationResult;
      }
      if (updatedSlots.daysInWeek) {
        validationResult = Club.checkDaysInWeek( daysInWeek);
        if (!(validationResult instanceof NoConstraintViolation)) throw validationResult;
      }
      if (updatedSlots.time) {
        validationResult = Club.checkTime( time);
        if (!(validationResult instanceof NoConstraintViolation)) throw validationResult;
      }
      if (updatedSlots.location) {
        validationResult = Club.checkLocation( location);
        if (!(validationResult instanceof NoConstraintViolation)) throw validationResult;
      }
      // remove old derived inverse references properties from slave
      // objects (member) Member::listOfClubs
      if (clubMemberIdRefsToRemove) {
        await Promise.all(clubMemberIdRefsToRemove.map( a => {
          const memberDocRef = fsDoc(memberCollRef, a.personId);
          batch.update(memberDocRef, {listOfClubs: arrayRemove( inverseRefBefore)});
        }));
      }
      // add new derived inverse references properties from slave objects
      // (members) Member::listOfClubs, while checking constraint violations
      if (clubMemberIdRefsToAdd) {
        await Promise.all(clubMemberIdRefsToAdd.map( async a => {
          const memberDocRef = fsDoc(memberCollRef, a.personId);
          validationResult = await Member.checkPersonIdAsIdRef( a.personId);
          console.log("happend error ?");
          if (!validationResult instanceof NoConstraintViolation) throw validationResult;
          batch.update(memberDocRef, {listOfClubs: arrayUnion( inverseRefAfter)});
        }));
      }
      // if name changes, update name in personId references (array of maps) in
      // unchanged member objects
      if (updatedSlots.name) {
        validationResult = Club.checkName( name);
        if (!(validationResult instanceof NoConstraintViolation)) throw validationResult;
        const NoChangedMemberIdRefs = clubMemberIdRefsToAdd ?
          clubBeforeUpdate.clubMemberIdRefs.filter(d => !clubMemberIdRefsToAdd.includes(d))
          : clubBeforeUpdate.clubMemberIdRefs;
        await Promise.all(NoChangedMemberIdRefs.map( a => {
          const memberDocRef = fsDoc(memberCollRef, a.personId);
          batch.update(memberDocRef, {listOfClubs: arrayRemove( inverseRefBefore)});
        }));
        await Promise.all(NoChangedMemberIdRefs.map( a => {
          const memberDocRef = fsDoc(memberCollRef, a.personId);
          batch.update(memberDocRef, {listOfClubs: arrayUnion( inverseRefAfter)});
        }));
      }

      batch.update(clubDocRef, updatedSlots);
      batch.commit(); // commit batch write
    } catch (e) {
      console.error(`${e.constructor.name}: ${e.message}`);
    }
    if (updatedProperties.length === 1) {
      console.log(`Property ${updatedProperties.toString()} modified for club record "${clubId}"`);
    } else if (updatedProperties.length) {
      console.log(`Properties ${updatedProperties.toString()} modified for club record "${clubId}"`);
    }
  } else {
    console.log(`No property value changed for club record "${clubId}"!`);
  }
};

/**
 * Delete a Firestore document from the Firestore collection "clubs"
 * @param clubId: {string}
 * @returns {Promise<void>}
 */
Club.destroy = async function (clubId) {
  const clubDocRef = fsDoc( fsDb, "clubs", clubId.toString())
      .withConverter( Club.converter),
    membersCollRef = fsColl( fsDb, "members")
      .withConverter( Member.converter);
  try {
    // delete master class object (club) while updating derived inverse
    // properties in objects from slave classes (authors and publishers)
    const clubRec = (await getDoc( clubDocRef
      .withConverter( Club.converter))).data();
    const inverseRef = {clubId: clubRec.clubId, name: clubRec.name};
    const batch = writeBatch( fsDb); // initiate batch write object
    // delete derived inverse reference properties, Member::/listOfClubs
    await Promise.all( clubRec.clubMemberIdRefs.map( aId => {
      const authorDocRef = fsDoc( membersCollRef, aId.personId);
      batch.update( authorDocRef, {listOfClubs: arrayRemove( inverseRef)});
    }));
    batch.delete( clubDocRef); // create club record (master)
    batch.commit(); // commit batch write
    console.log(`Club record "${clubId}" deleted!`);
  } catch (e) {
    console.error(`Error deleting club record: ${e}`);
  }
};

export { StatusEL, WeekDaysEL };
export default Club;