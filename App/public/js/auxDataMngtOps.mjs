import { auth, fsDb } from "./initFirebase.mjs";
import { collection as fsColl, getDocs, orderBy }
  from "https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js";
import Member from "./m/Member.mjs";
import Staff from "./m/Staff.mjs";
import Club from "./m/Club.mjs";

/*******************************************
 *** Auxiliary methods for testing **********
 ********************************************/
/**
 *  Load and save test data
 */
async function generateTestData () {
  try {
    let response;
    console.log("Generating members data...");
    response = await fetch( "../../test-data/members.json");
    const memberRecs = await response.json();
    await Promise.all( memberRecs.map( d => Member.add( d)));
    console.log(`${memberRecs.length} member data generated.`);
    console.log("Generating staff data...");
    response = await fetch( "../../test-data/staffs.json");
    const staffRecs = await response.json();
    await Promise.all( staffRecs.map( d => Staff.add( d)));
    console.log(`${staffRecs.length} staff data saved.`);
    console.log("Generating clubs data...");
    response = await fetch( "../../test-data/clubs.json");
    const clubRecs = await response.json();
    await Promise.all( clubRecs.map( d => Club.add( d)));
    console.log(`${clubRecs.length} club data saved.`);
  } catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
  }
}
/**
 * Clear data
 */
async function clearData () {
  try {
    if (confirm("Do you really want to delete all test data?")) {
      // save own account, then delete everything and recreate own account
      let savedAccountData;
      onAuthStateChanged(auth, async function (user) {
        if (user) {
          const userId = user.uid;
          savedAccountData = await Member.retrieve( userId);
        }
      });

      console.log("Clearing clubs data...");
      const clubsCollRef = fsColl( fsDb, "clubs");
      const clubQrySns = (await getDocs( clubsCollRef, orderBy( "clubId")));
      await Promise.all( clubQrySns.docs.map( d => Club.destroy( d.id)))
      console.log(`${clubQrySns.docs.length} club data deleted.`);
      console.log("Clearing member data...");
      const membersCollRef = fsColl( fsDb, "members");
      const memberQrySns = (await getDocs( membersCollRef, orderBy( "personId")));
      await Promise.all( memberQrySns.docs.map( d => Member.destroy( d.data())))
      console.log(`${memberQrySns.docs.length} member data deleted.`);
      console.log("Clearing staff data...");
      const staffsCollRef = fsColl( fsDb, "staffs");
      const staffQrySns = (await getDocs( staffsCollRef, orderBy( "personId")));
      await Promise.all( staffQrySns.docs.map( d => Staff.destroy( d.id)))
      console.log(`${staffQrySns.docs.length} staff dara deleted.`);

      // recreate saved account
      await Member.add( savedAccountData);
    }
  } catch (e) {
    console.error(`${e.constructor.name}: ${e.message}`);
  }
}

export { generateTestData, clearData };
