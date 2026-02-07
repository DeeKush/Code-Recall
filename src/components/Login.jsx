// ==========================================
// LOGIN COMPONENT
// ==========================================
// A simple login form with email and password fields.
// Uses Firebase signInWithEmailAndPassword to authenticate users.
// Also supports Google Sign-In.
// ==========================================

import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

function Login({ onSwitchToSignup }) {
    // Form state - stores what the user types
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Error state - displays any login errors to the user
    const [error, setError] = useState("");

    // Loading state - shows when login is in progress
    const [loading, setLoading] = useState(false);

    // Handle email/password form submission
    async function handleSubmit(e) {
        // Prevent page refresh on form submit
        e.preventDefault();

        // Clear any previous errors
        setError("");
        setLoading(true);

        try {
            // Firebase function to sign in with email/password
            await signInWithEmailAndPassword(auth, email, password);
            // If successful, onAuthStateChanged in AuthContext will detect it
            // and automatically update the app to show Dashboard
        } catch (err) {
            // Show user-friendly error messages
            setError(getErrorMessage(err.code));
        } finally {
            setLoading(false);
        }
    }

    // Handle Google Sign-In
    async function handleGoogleSignIn() {
        setError("");
        setLoading(true);

        try {
            // Opens a popup window for Google authentication
            await signInWithPopup(auth, googleProvider);
            // If successful, user will be automatically logged in
        } catch (err) {
            // Handle common Google sign-in errors
            if (err.code === "auth/popup-closed-by-user") {
                setError("Sign-in cancelled.");
            } else {
                setError("Failed to sign in with Google. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }

    // Convert Firebase error codes to friendly messages
    function getErrorMessage(code) {
        switch (code) {
            case "auth/invalid-email":
                return "Invalid email address.";
            case "auth/user-not-found":
                return "No account found with this email.";
            case "auth/wrong-password":
                return "Incorrect password.";
            case "auth/invalid-credential":
                return "Invalid email or password.";
            default:
                return "Failed to log in. Please try again.";
        }
    }

    return (
        <div className="auth-container">
            <h1 className="auth-title">Code Recall</h1>
            <h2>Login</h2>

            {/* Show error message if there is one */}
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                    />
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>

            {/* Divider between email login and social login */}
            <div className="auth-divider">
                <span>or</span>
            </div>

            {/* Google Sign-In Button */}
            <button
                onClick={handleGoogleSignIn}
                className="btn-google"
                disabled={loading}
            >
                <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
            </button>

            <p className="auth-switch">
                Don't have an account?{" "}
                <button onClick={onSwitchToSignup} className="btn-link">
                    Sign up
                </button>
            </p>
        </div>
    );
}

export default Login;
