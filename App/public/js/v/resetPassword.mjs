import { auth } from "../initFirebase.mjs";
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js";

const formEl = document.forms["Password"],
  resetBtn = formEl["commit"];

resetBtn.addEventListener("click", async function () {
  const email = formEl["email"].value;
  if (email) {
    try {
      await sendPasswordResetEmail( auth, email);
      alert(`Check your email "${email} and confirm this request to create a new password.`);
      window.location.pathname = "/index.html";
    } catch (e) {
      const divMsgEl = document.getElementById("message");
      divMsgEl.textContent = e.message;
      divMsgEl.hidden = false;
    }
  }
});