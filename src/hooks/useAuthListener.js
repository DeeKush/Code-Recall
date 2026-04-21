import { useState, useEffect, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";

/**
 * useAuthListener - Specialized hook for tracking Firebase authentication state.
 * Encapsulates the observer logic and provides clean subscription management.
 */
const useAuthListener = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;

        // Firebase observer for auth state changes
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (isMounted.current) {
                setUser(currentUser);
                setLoading(false);
            }
        });

        // Cleanup subscription on unmount
        return () => {
            isMounted.current = false;
            unsubscribe();
        };
    }, []);

    return {
        user,
        loading
    };
};

export default useAuthListener;
