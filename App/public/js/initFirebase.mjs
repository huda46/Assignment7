/**
 * @fileOverview  Initializing Cloud Firestore access
 * @author Gerd Wagner
 * @author Juan-Francisco Reyes
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore-lite.js";

// TODO: Replace the following with your web app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCh-YP8dhCfdvxSVnwtpMvIKpp4jiGEmtA",
  authDomain: "btu-wellness-club-app.firebaseapp.com",
  projectId: "btu-wellness-club-app",
  storageBucket: "btu-wellness-club-app.appspot.com",
  messagingSenderId: "1070286283053",
  appId: "1:1070286283053:web:53e0d43e65eb1f28dcb3a4"
};
// Initialize a Firebase App object
initializeApp( firebaseConfig);
// Initialize Cloud Firestore interface
const fsDb = getFirestore();

export { fsDb };
