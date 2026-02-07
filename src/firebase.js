// ==========================================
// FIREBASE CONFIGURATION
// ==========================================
// This file sets up Firebase for our app.
// You need to replace the placeholder values with your actual Firebase config.
// Go to: Firebase Console > Project Settings > Your Apps > Web App
// ==========================================

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your Firebase configuration object
// IMPORTANT: Replace these values with your actual Firebase project config!
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

// Initialize Firebase Authentication and export it
// We'll use this 'auth' object throughout our app for login/signup/logout
export const auth = getAuth(app);

// Initialize Google Auth Provider for Google Sign-In
export const googleProvider = new GoogleAuthProvider();

export default app;
