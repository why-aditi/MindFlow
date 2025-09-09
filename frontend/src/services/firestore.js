import { db } from "../config/firebase";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";

// Journal entries collection
export const journalEntriesRef = collection(db, "journalEntries");

export const addJournalEntry = async (entryData) => {
  try {
    const docRef = await addDoc(journalEntriesRef, {
      ...entryData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding journal entry:", error);
    throw error;
  }
};

export const getJournalEntries = async (userId) => {
  try {
    const q = query(
      journalEntriesRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting journal entries:", error);
    throw error;
  }
};

// AI conversations collection
export const conversationsRef = collection(db, "conversations");

export const addConversation = async (conversationData) => {
  try {
    const docRef = await addDoc(conversationsRef, {
      ...conversationData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding conversation:", error);
    throw error;
  }
};

export const getConversations = async (userId) => {
  try {
    const q = query(
      conversationsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting conversations:", error);
    throw error;
  }
};

// VR sessions collection
export const vrSessionsRef = collection(db, "vrSessions");

export const addVRSession = async (sessionData) => {
  try {
    const docRef = await addDoc(vrSessionsRef, {
      ...sessionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding VR session:", error);
    throw error;
  }
};

export const getVRSessions = async (userId) => {
  try {
    const q = query(
      vrSessionsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(20)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting VR sessions:", error);
    throw error;
  }
};

// User preferences collection
export const userPreferencesRef = collection(db, "userPreferences");

export const updateUserPreferences = async (userId, preferences) => {
  try {
    const userPrefDoc = doc(userPreferencesRef, userId);
    await updateDoc(userPrefDoc, {
      ...preferences,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    // If document doesn't exist, create it
    if (error.code === "not-found") {
      await addDoc(userPreferencesRef, {
        userId,
        ...preferences,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      console.error("Error updating user preferences:", error);
      throw error;
    }
  }
};

export const getUserPreferences = async (userId) => {
  try {
    const userPrefDoc = doc(userPreferencesRef, userId);
    const docSnap = await getDoc(userPrefDoc);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting user preferences:", error);
    throw error;
  }
};

// Wellness goals collection
export const wellnessGoalsRef = collection(db, "wellnessGoals");

export const updateWellnessGoals = async (userId, goals) => {
  try {
    const goalsDoc = doc(wellnessGoalsRef, userId);
    await updateDoc(goalsDoc, {
      goals,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    // If document doesn't exist, create it
    if (error.code === "not-found") {
      await addDoc(wellnessGoalsRef, {
        userId,
        goals,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      console.error("Error updating wellness goals:", error);
      throw error;
    }
  }
};

export const getWellnessGoals = async (userId) => {
  try {
    const goalsDoc = doc(wellnessGoalsRef, userId);
    const docSnap = await getDoc(goalsDoc);

    if (docSnap.exists()) {
      return docSnap.data().goals;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error getting wellness goals:", error);
    throw error;
  }
};
