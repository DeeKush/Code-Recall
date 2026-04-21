import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

/**
 * ErrorBoundary - Academic standard class component for catching runtime errors.
 * Provides a fallback UI to prevent the entire app from crashing.
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    /**
     * Update state so the next render shows the fallback UI.
     */
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    /**
     * Log the error to the console or an error reporting service.
     */
    componentDidCatch(error, errorInfo) {
        console.group("🛑 React Error Boundary Caught an Error");
        console.error("Error Object:", error);
        console.error("Error Info:", errorInfo);
        console.groupEnd();
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary-ui">
                    <div className="error-card">
                        <AlertCircle size={48} className="error-icon" />
                        <h2>Something went wrong</h2>
                        <p>The dashboard encountered an unexpected error. Please refresh.</p>
                        
                        {/* Technical details shown in development/debug mode */}
                        {this.state.error && (
                            <div className="error-details">
                                {this.state.error.toString()}
                            </div>
                        )}
                        
                        <button onClick={this.handleReload} className="btn-reload">
                            <RefreshCw size={16} />
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
