import { auth } from "../initFirebase.mjs"
import { applyActionCode, confirmPasswordReset, signInWithEmailAndPassword,
  verifyPasswordResetCode } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js";

const mode = getParameterByName("mode");
const actionCode = getParameterByName("oobCode");
const [sectionVeriEmailEl, sectionRstPswEl]
  = document.querySelectorAll("main>div>section");

switch (mode) {
  case "verifyEmail":
    sectionVeriEmailEl.hidden = false;
    await handleVerifyEmail( sectionVeriEmailEl, actionCode);
    break;
  case "resetPassword":
    sectionRstPswEl.hidden = false;
    await handleResetPassword( sectionRstPswEl, actionCode);
    break;
}

function getParameterByName( parameter) {
  const urlParams = new URLSearchParams( location.search);
  return urlParams.get( parameter);
}

async function handleVerifyEmail( sectionVeriEmailEl, actionCode) {
  const h1El = document.querySelector("h1"),
    pEl = sectionVeriEmailEl.querySelector("p");
  let email = null;
  try {
    email = await verifyPasswordResetCode( auth, actionCode);
    await applyActionCode( auth, actionCode);
    h1El.textContent = "Your email address has been verified";
    const bEl = document.createElement("b");
    bEl.textContent = email;
    pEl.innerText = "Now this account can use any data management operation: ";
    pEl.appendChild( bEl);
  } catch (e) {
    h1El.textContent = "Invalid or expired link.";
    pEl.textContent = "Your email address has not been verified.";
    const divMsgEl = document.getElementById("message");
    divMsgEl.textContent = e.message;
    divMsgEl.hidden = false;
  }
}

async function handleResetPassword( sectionRstPswEl, actionCode) {
  const h1El = document.querySelector("h1"),
    pEl = sectionRstPswEl.querySelector("p"),
    formEl = document.forms["Password"];
  try {
    const email = await verifyPasswordResetCode( auth, actionCode);
    h1El.textContent = "Reset password";
    const bEl = document.createElement("b");
    bEl.textContent = email;
    pEl.innerText = "For: ";
    pEl.appendChild( bEl);
    const saveButton = formEl["commit"];
    saveButton.addEventListener("click", async function () {
      const newPassword = formEl["password"].value;
      if (newPassword) {
        await confirmPasswordReset( auth, actionCode, newPassword);
        alert(`Your password has been update! You will be automatically signed in with your email address "${email}.`);
        await signInWithEmailAndPassword( auth, email, newPassword);
        window.location.pathname = "/index.html"; // redirect user to start page
      }
    });
  } catch (e) {
    formEl.hidden = true;
    h1El.textContent = "Invalid or expired link.";
    pEl.textContent = "Your password cannot be reset.";
    const divMsgEl = document.getElementById("message");
    divMsgEl.textContent = e.message;
    divMsgEl.hidden = false;
  }
}