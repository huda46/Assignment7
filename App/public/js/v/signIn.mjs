import { auth } from "../initFirebase.mjs";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js";

const formEl = document.forms["Auth"],
  signInBtn = formEl["signIn"];

signInBtn.addEventListener("click", async function () {
  const email = formEl["email"].value,
    password = formEl["password"].value;
  if (email && password) {
    try {
      // sign in user using email + password
      await signInWithEmailAndPassword( auth, email, password);
      window.location.pathname = "/menu.html"; // redirect user to menu page
    } catch (e) {
      const divMsgEl = document.getElementById("message");
      divMsgEl.textContent = e.message;
      divMsgEl.hidden = false;
    }
  }
});