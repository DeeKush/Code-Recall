// ==========================================
// HOME PAGE COMPONENT (Day 4 - Landing Page)
// ==========================================
// Public landing page with:
//   - Dark themed hero section
//   - CTA buttons for Get Started / Login
//   - Feature highlights
// ==========================================

import { Code2, Sparkles, BookOpen, ArrowRight, Zap } from "lucide-react";
import logo from "../assets/logo.png";

function Landing({ onGetStarted, onLogin }) {
    const features = [
        // ... (features array remains same)
    ];

    return (
        <div className="home-page">
            {/* Navigation */}
            <nav className="home-nav">
                <div className="home-logo">
                    <img src={logo} alt="CodeRecall" className="home-logo-img" style={{ height: '50px', width: 'auto' }} />
                </div>
                <button onClick={onLogin} className="btn-nav-login">
                    Login
                </button>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Save your code.
                        <br />
                        <span className="hero-highlight">Recall it instantly.</span>
                        <br />
                        Understand it with AI. Visualize it step by step.
                    </h1>
                    <p className="hero-subtitle">
                        CodeRecall helps developers store code snippets, generate
                        AI-powered revision notes, and visualize execution step by step.
                        Built for DSA practice, competitive programming, and interview prep.
                    </p>
                    <div className="hero-buttons">
                        <button onClick={onGetStarted} className="btn-hero-primary">
                            Get Started
                            <ArrowRight size={20} />
                        </button>
                        <button onClick={onLogin} className="btn-hero-secondary">
                            Login
                        </button>
                    </div>
                </div>

                {/* Code preview mockup */}
                <div className="hero-preview">
                    <div className="preview-window">
                        <div className="preview-header">
                            <div className="preview-dots">
                                <span className="dot red"></span>
                                <span className="dot yellow"></span>
                                <span className="dot green"></span>
                            </div>
                            <span className="preview-title">binary_search.py</span>
                        </div>
                        <pre className="preview-code">
                            {`def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
            
    return -1`}
                        </pre>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <h2 className="features-title">Built for developers who learn</h2>
                <div className="features-grid">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div key={index} className="feature-card">
                                <div className="feature-icon">
                                    <Icon size={24} />
                                </div>
                                <h3 className="feature-name">{feature.title}</h3>
                                <p className="feature-desc">{feature.description}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Footer */}
            <footer className="home-footer">
                <p>Built for learners, by learners.</p>
            </footer>
        </div>
    );
}

export default Landing;
