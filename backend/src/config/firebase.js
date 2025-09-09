import admin from "firebase-admin";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

let db = null;
let auth = null;

export const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (getApps().length === 0) {
      // Check if required environment variables are present
      if (!process.env.FIREBASE_PROJECT_ID) {
        throw new Error(
          "FIREBASE_PROJECT_ID is required in environment variables"
        );
      }

      if (
        !process.env.FIREBASE_CLIENT_EMAIL ||
        !process.env.FIREBASE_PRIVATE_KEY
      ) {
        console.warn(
          "⚠️  Firebase Admin SDK credentials not found. Using default credentials."
        );
        console.warn(
          "   To use Firebase Admin SDK, set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in .env file"
        );
        console.warn(
          "   For now, the server will start without Firebase Admin SDK"
        );
        return { db: null, auth: null };
      }

      // Initialize Firebase Admin SDK
      initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });

      console.log("✅ Firebase Admin SDK initialized successfully");
    }

    // Initialize Firestore
    db = getFirestore();

    // Initialize Auth
    auth = getAuth();

    return { db, auth };
  } catch (error) {
    console.error("❌ Firebase initialization error:", error);
    console.error("   Please check your Firebase configuration in .env file");
    throw error;
  }
};

export const getFirestoreInstance = () => {
  if (!db) {
    throw new Error(
      "Firestore not initialized. Call initializeFirebase() first."
    );
  }
  return db;
};

export const getAuthInstance = () => {
  if (!auth) {
    throw new Error("Auth not initialized. Call initializeFirebase() first.");
  }
  return auth;
};
