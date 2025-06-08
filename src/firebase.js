// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, } from "firebase/auth";
import { getFirestore } from 'firebase/firestore'; // Import Firestore
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDExNgraITaJpcA8eFhyDbdfj51aRxpwnI",
  authDomain: "edd-boyz-network.firebaseapp.com",
  projectId: "edd-boyz-network",
  storageBucket: "edd-boyz-network.firebasestorage.app",
  messagingSenderId: "726747548460",
  appId: "1:726747548460:web:f64099bd104dff7a08ba89",
  measurementId: "G-ZE5Y9BQXVZ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app); //Initialize Firestore
const storage = getStorage(app);

export { auth, provider, db, storage };
