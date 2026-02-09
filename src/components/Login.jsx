// ==========================================
// LOGIN COMPONENT (Day 4 - Dark Theme)
// ==========================================
// Dark themed login form with:
//   - Email/password login
//   - Google Sign-In
//   - Back to home link
// ==========================================

import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { Brain, Mail, Lock, ArrowLeft } from "lucide-react";

function Login({ onSwitchToSignup, onBackToHome }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            setError(getErrorMessage(err.code));
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleSignIn() {
        setError("");
        setLoading(true);

        try {
            await signInWithPopup(auth, googleProvider);
        } catch (err) {
            if (err.code === "auth/popup-closed-by-user") {
                setError("Sign-in cancelled.");
            } else {
                setError("Failed to sign in with Google. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }

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
        <div className="auth-page-dark">
            <div className="auth-container-dark">
                {/* Back button */}
                {onBackToHome && (
                    <button onClick={onBackToHome} className="auth-back-btn">
                        <ArrowLeft size={18} />
                        <span>Back</span>
                    </button>
                )}

                {/* Logo */}
                <div className="auth-logo-dark">
                    <Brain size={36} className="auth-logo-icon" />
                    <span>Code Recall</span>
                </div>

                <h2 className="auth-heading-dark">Welcome back</h2>
                <p className="auth-subheading-dark">Sign in to your account</p>

                {error && <div className="error-message-dark">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form-dark">
                    <div className="form-field-dark">
                        <label className="form-label-dark">
                            <Mail size={14} />
                            <span>Email</span>
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            className="form-input-dark"
                        />
                    </div>

                    <div className="form-field-dark">
                        <label className="form-label-dark">
                            <Lock size={14} />
                            <span>Password</span>
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            className="form-input-dark"
                        />
                    </div>

                    <button type="submit" className="btn-auth-primary" disabled={loading}>
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <div className="auth-divider-dark">
                    <span>or</span>
                </div>

                <button onClick={handleGoogleSignIn} className="btn-google-dark" disabled={loading}>
                    <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                </button>

                <p className="auth-switch-dark">
                    Don't have an account?{" "}
                    <button onClick={onSwitchToSignup} className="btn-link-dark">
                        Sign up
                    </button>
                </p>
            </div>
        </div>
    );
}

export default Login;
