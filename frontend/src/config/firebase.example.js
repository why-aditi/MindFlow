import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Replace these with your actual Firebase configuration
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

// Instructions:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project or select existing project
// 3. Go to Project Settings > General > Your apps
// 4. Add a web app and copy the configuration
// 5. Replace the values above with your actual config
// 6. Rename this file to firebase.js
