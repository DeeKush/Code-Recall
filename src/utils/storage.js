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
    Timestamp
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
    console.log("[DEBUG] getSnippets called with userId:", userId);

    try {
        // Reference to this user's snippets collection
        // Path: users/{userId}/snippets
        const snippetsRef = collection(db, "users", userId, "snippets");

        // Query snippets, ordered by creation date (newest first)
        const q = query(snippetsRef, orderBy("createdAt", "desc"));

        // Fetch the documents
        console.log("[DEBUG] Fetching documents from Firestore...");
        const querySnapshot = await getDocs(q);
        console.log("[DEBUG] Documents fetched, count:", querySnapshot.size);

        // Convert Firestore documents to plain JavaScript objects
        const snippets = [];
        querySnapshot.forEach((doc) => {
            snippets.push({
                id: doc.id,  // Firestore document ID
                ...doc.data()  // All the snippet data
            });
        });

        console.log("[DEBUG] Snippets loaded:", snippets);
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
    console.log("[DEBUG] saveSnippet called with userId:", userId);
    console.log("[DEBUG] Snippet data to save:", snippet);

    try {
        // Create a readable date string like "2026-02-08 19:42"
        const now = new Date();
        const readableDate = formatDate(now);

        // Prepare the snippet data
        const snippetData = {
            title: snippet.title,
            topic: snippet.topic,
            code: snippet.code,
            tags: snippet.tags || [],  // NEW: tags array
            createdAt: Timestamp.fromDate(now),  // Firestore Timestamp
            createdAtReadable: readableDate  // Human-readable string
        };

        console.log("[DEBUG] Prepared snippetData:", snippetData);

        // Reference to this user's snippets collection
        const snippetsRef = collection(db, "users", userId, "snippets");

        // Add the document to Firestore WITH TIMEOUT (10 seconds max)
        // This prevents the save button from staying locked forever
        console.log("[DEBUG] Adding document to Firestore (10s timeout)...");
        const docRef = await withTimeout(addDoc(snippetsRef, snippetData), 10000);
        console.log("[DEBUG] Document added successfully! ID:", docRef.id);

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
