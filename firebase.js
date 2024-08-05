// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCtCFUjvhfneaFRiwrneGHLB92WyWPNpKE",
  authDomain: "nventory-tracker.firebaseapp.com",
  projectId: "nventory-tracker",
  storageBucket: "nventory-tracker.appspot.com",
  messagingSenderId: "506568364246",
  appId: "1:506568364246:web:c96ec79cf0a05cf09df977",
  measurementId: "G-K9QPSC7PLZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export { firestore };
