/**
 * @fileOverview  Initializing Cloud Firestore access
 * @author Gerd Wagner
 * @author Juan-Francisco Reyes
 */
import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore-lite.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCh-YP8dhCfdvxSVnwtpMvIKpp4jiGEmtA",
  authDomain: "btu-wellness-club-app.firebaseapp.com",
  projectId: "btu-wellness-club-app",
  storageBucket: "btu-wellness-club-app.appspot.com",
  messagingSenderId: "1070286283053",
  appId: "1:1070286283053:web:53e0d43e65eb1f28dcb3a4"
};
// Initialize a Firebase App object only if not already initialized
const app = (!getApps().length) ? initializeApp( firebaseConfig): getApp();
// Initialize Firebase Authentication
const auth = getAuth( app);
// Initialize Cloud Firestore interface
const fsDb = getFirestore();

export { auth, fsDb };
