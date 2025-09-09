// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBgM3eLJszKy5A0NnVwiWBbVCB03ktb2WQ",
  authDomain: "biteme-9738c.firebaseapp.com",
  projectId: "biteme-9738c",
  storageBucket: "biteme-9738c.firebasestorage.app",
  messagingSenderId: "347611043813",
  appId: "1:347611043813:web:69ead6d1e59dee684ec10c",
  measurementId: "G-VCKGY2EWBP",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

export default app;
