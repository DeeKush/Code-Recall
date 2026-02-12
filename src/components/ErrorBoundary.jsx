import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
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
                        <p>We encountered an unexpected error. Please try refreshing the page.</p>
                        {this.state.error && (
                            <div className="error-details">
                                {this.state.error.toString()}
                            </div>
                        )}
                        <button onClick={this.handleReload} className="btn-reload">
                            <RefreshCw size={16} />
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
