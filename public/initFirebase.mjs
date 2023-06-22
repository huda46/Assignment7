import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore-lite.js";

// our web app's Firebase configuration
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

// Initialize Firestore interface
const fsDb = getFirestore();

export { fsDb };