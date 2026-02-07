// ==========================================
// LOCAL STORAGE UTILITIES
// ==========================================
// These functions handle saving and loading snippets from localStorage.
// 
// WHY SEPARATE FILE?
// This makes it easy to swap localStorage for Firebase later.
// Just change these functions, and the rest of the app stays the same!
// ==========================================

// Key prefix for localStorage
// Each user has their own snippets stored under their user ID
const STORAGE_KEY_PREFIX = "code_recall_snippets_";

/**
 * Get all snippets for a specific user
 * @param {string} userId - The user's unique ID from Firebase
 * @returns {Array} - Array of snippet objects
 */
export function getSnippets(userId) {
    // Create the storage key for this user
    const key = STORAGE_KEY_PREFIX + userId;

    // Get the data from localStorage (returns null if nothing saved)
    const data = localStorage.getItem(key);

    // If no data exists, return empty array
    // Otherwise, parse the JSON string back into an array
    return data ? JSON.parse(data) : [];
}

/**
 * Save a new snippet for a specific user
 * @param {string} userId - The user's unique ID from Firebase
 * @param {Object} snippet - The snippet object to save
 * @returns {Object} - The saved snippet (with generated ID and timestamp)
 */
export function saveSnippet(userId, snippet) {
    // Get existing snippets for this user
    const snippets = getSnippets(userId);

    // Create the new snippet with auto-generated ID and timestamp
    const newSnippet = {
        id: generateId(),           // Unique identifier
        title: snippet.title,       // User-provided title
        topic: snippet.topic,       // User-provided topic
        code: snippet.code,         // The actual code content
        createdAt: new Date().toISOString()  // When it was created
    };

    // Add new snippet to the beginning of the array (newest first)
    const updatedSnippets = [newSnippet, ...snippets];

    // Save back to localStorage (must convert to JSON string)
    const key = STORAGE_KEY_PREFIX + userId;
    localStorage.setItem(key, JSON.stringify(updatedSnippets));

    // Return the new snippet so the app can use it immediately
    return newSnippet;
}

/**
 * Generate a simple unique ID
 * In production, you might use a library like 'uuid'
 * But for Day 1 MVP, this simple approach works fine
 */
function generateId() {
    // Combine timestamp with random number for uniqueness
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
