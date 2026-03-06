// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBWE120SMn54JeShOJP71J_dKb9s4byE_Y",
  authDomain: "flightpricetracker-7fbf2.firebaseapp.com",
  projectId: "flightpricetracker-7fbf2",
  storageBucket: "flightpricetracker-7fbf2.firebasestorage.app",
  messagingSenderId: "103690972257",
  appId: "1:103690972257:web:2a9f3d28d4b50cc976ce20",
  measurementId: "G-ZKQS0MPYMT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);