import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase configuration
// Replace with your actual Firebase project credentials from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyA_OsqVg0m6Jf31Y8PWf6SSRhRLMBu_z2Y",
  authDomain: "data-collection-c9d27.firebaseapp.com",
  databaseURL:
    "https://data-collection-c9d27-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "data-collection-c9d27",
  storageBucket: "data-collection-c9d27.firebasestorage.app",
  messagingSenderId: "1006162401817",
  appId: "1:1006162401817:web:e2edd4dfdca4feca1da888",
  measurementId: "G-P91LVHB57X",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

export default app;
