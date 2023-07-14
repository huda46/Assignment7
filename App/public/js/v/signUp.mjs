/***************************************************************
 Import methods and properties
 ***************************************************************/
import { auth } from "../initFirebase.mjs";
import Member from "../m/Member.mjs";
import { PersonTypeEL } from "../m/Person.mjs";
import { fillSelectWithOptions } from "../../lib/util.mjs";
import { createUserWithEmailAndPassword, sendEmailVerification }
  from "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js";

/***************************************************************
 Declare variables for accessing UI elements
 ***************************************************************/
const formEl = document.forms["Auth"],
  firstnameEl = formEl["firstname"],
  lastnameEl = formEl["lastname"],
  typeEl = formEl["type"],
  emailEl = formEl["email"],
  passwordEl = formEl["password"],
  confirmPassEl = formEl["confirmPass"],
  signUpBtn = formEl["signUp"];

// set up the type selection list
fillSelectWithOptions( typeEl, PersonTypeEL.labels, true);

/******************************************************************
 Add event listeners for input of data
 ******************************************************************/

firstnameEl.addEventListener("input", function () {
  firstnameEl.setCustomValidity( Member.checkName( firstnameEl.value).message);
});
lastnameEl.addEventListener("input", function () {
  lastnameEl.setCustomValidity( Member.checkName( lastnameEl.value).message);
});
typeEl.addEventListener("input", function () {
  typeEl.setCustomValidity( Member.checkType( typeEl.value).message);
});

//TODO maybe add checker for email?

/******************************************************************
 Add event listeners for the sign-up button
 ******************************************************************/

// manage sign up event
signUpBtn.addEventListener("click", async function () {
  const slots = {
    personId: 0,
    firstname: firstnameEl.value,
    lastname: lastnameEl.value,
    type: typeEl.value
  }
  console.log(`in signUp try to get slots ${slots}`);
  firstnameEl.setCustomValidity( Member.checkName( slots.firstname).message);
  lastnameEl.setCustomValidity( Member.checkName( slots.lastname).message);
  typeEl.setCustomValidity( Member.checkType( slots.type).message);
  confirmPassEl.setCustomValidity( passwordEl.value === confirmPassEl.value 
    ? "" : "Both passwords should be the same!");
  emailEl.setCustomValidity( emailEl.value 
    ? "" : "You need to enter an Email!");
  passwordEl.setCustomValidity( passwordEl.value 
    ? "" : "You need to enter a password!");
    
  if (formEl.reportValidity()) {
    try {
      // create account and get credential by providing email and password
      // user is signed in automatically if the account is created successfully
      const userCredential = await createUserWithEmailAndPassword( auth, emailEl.value, passwordEl.value);
      // get user reference from Firebase
      const userRef = userCredential.user;
      // send verification email
      await sendEmailVerification( userRef);
      console.log (`User ${emailEl.value} became "Registered"`);
      await Member.add( slots);
      alert (`Account created ${emailEl.value}. Check your email for instructions to verify this account.`);
      window.location.pathname = "/index.html"; // redirect user to start page
    } catch (e) {
      const divMsgEl = document.getElementById("message");
      divMsgEl.textContent = e.message;
      divMsgEl.hidden = false;
    }
  }
});
