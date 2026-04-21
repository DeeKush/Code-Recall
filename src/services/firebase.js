// ==========================================
// FIREBASE CONFIGURATION
// ==========================================
// This file sets up Firebase for our app.
// Includes: Authentication, Google Sign-In, and Firestore Database
// ==========================================

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyBGZFhBNBATF9tO4f75jodQf7_bzCvBkaQ",
  authDomain: "code-recall.firebaseapp.com",
  projectId: "code-recall",
  storageBucket: "code-recall.firebasestorage.app",
  messagingSenderId: "748413368242",
  appId: "1:748413368242:web:0cb1b919b874bb4396d6ab",
  measurementId: "G-537KVGFTZP"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Google Auth Provider for Google Sign-In
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore Database (NEW for Day 2)
// We'll use this to store snippets in the cloud
export const db = getFirestore(app);

export default app;

