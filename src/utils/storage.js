// ==========================================
// FIRESTORE STORAGE UTILITIES (Day 2 Update)
// ==========================================
// These functions handle saving and loading snippets from Firestore.
// Migrated from localStorage to cloud storage for better persistence.
// ==========================================

import { db } from "../firebase";
import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    Timestamp,
    doc,
    updateDoc,
    deleteDoc,
    getDoc,
    increment,
    serverTimestamp
} from "firebase/firestore";

/**
 * Helper function to add a timeout to any promise
 * Prevents operations from hanging forever
 * @param {Promise} promise - The promise to wrap
 * @param {number} ms - Timeout in milliseconds
 * @returns {Promise} - Rejects if timeout exceeded
 */
function withTimeout(promise, ms) {
    const timeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Operation timed out")), ms);
    });
    return Promise.race([promise, timeout]);
}

/**
 * Get all snippets for a specific user from Firestore
 * @param {string} userId - The user's unique ID from Firebase
 * @returns {Promise<Array>} - Array of snippet objects
 */
export async function getSnippets(userId) {
    // DEBUG: Log the user ID


    try {
        // Reference to this user's snippets collection
        // Path: users/{userId}/snippets
        const snippetsRef = collection(db, "users", userId, "snippets");

        // Query snippets, ordered by creation date (newest first)
        const q = query(snippetsRef, orderBy("createdAt", "desc"));

        // Fetch the documents
        // Fetch the documents
        const querySnapshot = await getDocs(q);

        // Convert Firestore documents to plain JavaScript objects
        const snippets = [];
        querySnapshot.forEach((doc) => {
            snippets.push({
                id: doc.id,  // Firestore document ID
                ...doc.data()  // All the snippet data
            });
        });


        return snippets;
    } catch (error) {
        console.error("[ERROR] Error fetching snippets:", error);
        console.error("[ERROR] Error code:", error.code);
        console.error("[ERROR] Error message:", error.message);
        return [];
    }
}

/**
 * Save a new snippet for a specific user to Firestore
 * @param {string} userId - The user's unique ID from Firebase
 * @param {Object} snippet - The snippet object to save
 * @returns {Promise<Object>} - The saved snippet with generated ID
 */
export async function saveSnippet(userId, snippet) {
    // DEBUG: Log save attempt

    try {
        // Create a readable date string like "2026-02-08 19:42"
        const now = new Date();
        const readableDate = formatDate(now);

        // Prepare the snippet data
        // Now supports AI-generated title, topic, aiTags from Day 3
        const snippetData = {
            title: snippet.title,                    // AI-generated title
            topic: snippet.topic,                    // AI-generated topic
            code: snippet.code,
            tags: snippet.tags || [],                // User tags (empty for Day 3)
            aiTags: snippet.aiTags || [],            // AI-generated tags
            createdAt: Timestamp.fromDate(now),      // Firestore Timestamp
            createdAtReadable: readableDate          // Human-readable string
        };

        // Reference to this user's snippets collection
        const snippetsRef = collection(db, "users", userId, "snippets");

        // Add the document to Firestore WITH TIMEOUT (10 seconds max)
        // This prevents the save button from staying locked forever
        const docRef = await withTimeout(addDoc(snippetsRef, snippetData), 10000);

        // Return the complete snippet with ID for immediate use
        return {
            id: docRef.id,
            ...snippetData
        };
    } catch (error) {
        console.error("[ERROR] Error saving snippet:", error);
        console.error("[ERROR] Error code:", error.code);
        console.error("[ERROR] Error message:", error.message);

        // If it's a timeout, give a more helpful message
        if (error.message === "Operation timed out") {
            throw new Error("Save timed out. Please check your Firestore security rules in Firebase Console.");
        }
        throw error;
    }
}

/**
 * Format a date as "YYYY-MM-DD HH:MM"
 * @param {Date} date - The date to format
 * @returns {string} - Formatted date string
 */
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * Update a snippet with AI-generated data (Day 3)
 * Called after snippet is saved and Gemini returns data
 * @param {string} userId - The user's unique ID
 * @param {string} snippetId - The Firestore document ID
 * @param {Object} aiData - The AI-generated data { aiTags, aiNotes }
 * @param {string} status - "success" or "failed"
 * @returns {Promise<Object>} - The AI data that was saved
 */
export async function updateSnippetAI(userId, snippetId, aiData, status) {


    try {
        // Reference to the specific snippet document
        const snippetRef = doc(db, "users", userId, "snippets", snippetId);

        // Prepare the AI notes data to update
        // Day 3: Only updates notes (aiTags saved in initial save)
        const updateData = {
            aiNotes: aiData?.aiNotes || null,
            aiGeneratedAt: Timestamp.fromDate(new Date()),
            aiStatus: status,  // "success" or "failed"
            aiProvider: "groq",
            aiModel: "llama3-70b-8192"
        };



        // Update the document with timeout
        await withTimeout(updateDoc(snippetRef, updateData), 10000);



        return updateData;
    } catch (error) {
        console.error("[ERROR] Failed to update snippet with AI data:", error);
        throw error;
    }
}

/**
 * Update a snippet's user-editable fields
 * @param {string} userId
 * @param {string} snippetId
 * @param {Object} data - { title, topic, tags, code }
 */
export async function updateSnippet(userId, snippetId, data) {
    try {
        const snippetRef = doc(db, "users", userId, "snippets", snippetId);
        await updateDoc(snippetRef, {
            ...data,
            updatedAt: Timestamp.now()
        });
        return { id: snippetId, ...data };
    } catch (error) {
        console.error("Error updating snippet:", error);
        throw error;
    }
}

/**
 * Delete a snippet
 * @param {string} userId
 * @param {string} snippetId
 */
export async function deleteSnippet(userId, snippetId) {
    try {
        const snippetRef = doc(db, "users", userId, "snippets", snippetId);
        await deleteDoc(snippetRef);
        return snippetId;
    } catch (error) {
        console.error("Error deleting snippet:", error);
        throw error;
    }
}

/**
 * Update snippet recall stats (Spaced Repetition V2)
 * @param {string} userId
 * @param {string} snippetId
 * @param {boolean} isUnderstood - True = "I understood", False = "Revisit later"
 */
export async function updateSnippetRecall(userId, snippetId, isUnderstood) {
    if (!userId || !snippetId) return;
    const snippetRef = doc(db, "users", userId, "snippets", snippetId);

    try {
        // 1. Read current stats for streak calculation
        const snap = await getDoc(snippetRef);
        if (!snap.exists()) return;

        const currentData = snap.data();
        const currentStreak = currentData.recallStreak || 0;

        // 2. Calculate new values
        const newStreak = isUnderstood ? currentStreak + 1 : 0;
        const feedbackType = isUnderstood ? "understood" : "revisit";

        const updatePayload = {
            lastRecalledAt: serverTimestamp(),
            lastFeedback: feedbackType,
            recallStreak: newStreak,
            recallCount: increment(1)
        };

        if (isUnderstood) {
            updatePayload.understoodCount = increment(1);
        } else {
            updatePayload.revisitCount = increment(1);
        }

        // 3. Update
        await updateDoc(snippetRef, updatePayload);


    } catch (error) {
        console.error("Error updating recall stats:", error);
        throw error;
    }
}
