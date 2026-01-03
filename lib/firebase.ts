import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAW-s9eHBf-c9fOZfql-j3MRYeF1FlEo-I",
  authDomain: "dadar-c2456.firebaseapp.com",
  projectId: "dadar-c2456",
  storageBucket: "dadar-c2456.firebasestorage.app",
  messagingSenderId: "776101172230",
  appId: "1:776101172230:web:3bdef1a95f7093c4315f87",
  measurementId: "G-WXW0Z0YR4Z"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
