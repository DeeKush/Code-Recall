// ==========================================
// AUTH CONTEXT
// ==========================================
// This file creates a React Context for authentication.
// Context allows us to share the user's login state across all components
// without passing props down manually at every level.
// ==========================================

import { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";

// Create the context - this is like a "container" for our auth data
const AuthContext = createContext();

// Custom hook to easily access auth data from any component
// Usage: const { user, loading, logout } = useAuth();
export function useAuth() {
    return useContext(AuthContext);
}

// AuthProvider component - wraps our entire app to provide auth state
export function AuthProvider({ children }) {
    // State to store the currently logged-in user (null if not logged in)
    const [user, setUser] = useState(null);

    // State to track if we're still checking the user's login status
    const [loading, setLoading] = useState(true);

    // useEffect runs once when the app loads
    // It sets up a "listener" that watches for login/logout changes
    useEffect(() => {
        // onAuthStateChanged is a Firebase function that:
        // - Runs immediately with current user (or null)
        // - Runs again whenever user logs in or out
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false); // We're done checking
        });

        // Cleanup: remove the listener when component unmounts
        return unsubscribe;
    }, []);

    // Logout function - signs the user out of Firebase
    async function logout() {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error logging out:", error);
        }
    }

    // The value object contains everything we want to share
    const value = {
        user,      // The current user object (or null)
        loading,   // Boolean: are we still checking auth status?
        logout     // Function to log out
    };

    // Render the provider with our value
    // {children} means all components wrapped by AuthProvider can access this data
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
