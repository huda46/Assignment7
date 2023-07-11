import { fsDb } from "../initFirebase.mjs";
import Enumeration from "../../lib/Enumeration.mjs"; 
import { collection as fsColl, deleteDoc, doc as fsDoc, getDoc, getDocs, onSnapshot,
  setDoc, orderBy, updateDoc, deleteField, query as fsQuery }
  from "https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore.js";
import { isNonEmptyString, isIntegerOrIntegerString, createModalFromChange } from "../../lib/util.mjs";
import { NoConstraintViolation, MandatoryValueConstraintViolation, IntervalConstraintViolation
    PatternConstraintViolation, RangeConstraintViolation, UniquenessConstraintViolation } from "../../lib/errorTypes.mjs";

  const scheduleEL = new Enumeration(["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]);

/**
 * Constructor function for the class Schedule
 * @constructor
 * @param {{scheduleId: number, startDate: Date, endDate: Date, daysInWeek: daysInWeekEL, time: Date, location: string}} slots - Object creation slots.
 */
class Schedule {
  // record parameter with the ES6 syntax for function parameter destructuring
  constructor({scheduleId, startDate, endDate, daysInWeek, time, location}) {
    this.scheduleId = scheduleId;
    this.startDate = startDate;
    this.endDate = endDate;
    this.daysInWeek = daysInWeek;
    this.time = time;
    this.location = location;
  };
  get scheduleId() {
    return this._scheduleId;  
  };
  static checkscheduleId( id) {
    if (!id) {
      return new NoConstraintViolation(); 
    } else {
      id = parseInt( id); 
    if (isNaN( id) || !Number.isInteger( id) || id < 1) {
    return new RangeConstraintViolation("The schedule ID must be a positive integer!");
      } else {
    return new NoConstraintViolation();
      }
    }
  };
  static async checkScheduleIdAsId( id) {
    let validationResult = Schedule.checkscheduleId( id);
    if ((validationResult instanceof NoConstraintViolation)) {
      if (!id) {
        validationResult = new MandatoryValueConstraintViolation(
            "A positive integer value for the schedule ID is required!");
      } else {
        const scheduleDocSn = await getDoc( fsDoc( fsDb, "schedules", id.toString()));
        if (scheduleDocSn.exists()) {
          validationResult = new UniquenessConstraintViolation(
            "There is already a schedule with this Id!");
        } else {
          validationResult = new NoConstraintViolation();
        }
      }
    }
    return validationResult;
  };
  set scheduleId( d) {
    d = parseInt(d);
    const validationResult = Schedule.checkscheduleId( d);
    if (validationResult instanceof NoConstraintViolation) {
      this._scheduleId = d;
    } else {
      throw validationResult;
    }
  };
  get startDate() {
    return this._startDate;
  };
  static checkStartDate( sd) {
    if (!sd) {
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
  set startDate( sd) {
    const validationResult = Schedule.checkStartDate( sd);
    if (validationResult instanceof NoConstraintViolation) {
      this._startDate = sd;
    } else {
      throw validationResult;
    }
  };
  get endDate() {
    return this._endDate;
  };
  static checkEndDate( ed, startDate) {
    if (!ed) {
      return new MandatoryValueConstraintViolation("An endDate must be provided!");
    } else if (!(typeof endDate === "string" &&
    /\d{4}-(0\d|1[0-2])-([0-2]\d|3[0-1])/.test( endDate) &&
    !isNaN( Date.parse( endDate)))) {
    return new PatternConstraintViolation(
      "The endDate is not well formed");
    }  else if (ed > startDate) {
        return new IntervalConstraintViolation(
          `The value of the endDate must be after the startDate!`);
      } else return new NoConstraintViolation();
    };
  set endDate( ed) {
    const validationResult = Schedule.checkEndDate( ed);
    if (validationResult instanceof NoConstraintViolation) {
      this._endDate = ed;
    } else {
      throw validationResult;
    }
  };
  get time() {
    return this._time;
  };
  static checkTime( t) {
    };
  set time( t) {
    this._time = t;
  };
  get location() {
    return this._location;
  };
  static checkLocation( l) {
    };
  set location( l) {
    this._location = l;
  };
}