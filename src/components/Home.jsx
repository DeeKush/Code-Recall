// ==========================================
// LANDING PAGE (Public)
// ==========================================
// The public face of Code Recall.
// ==========================================

import { Brain, Code2, Sparkles, Zap, ArrowRight, CheckCircle } from "lucide-react";

function Home({ onGetStarted, onLogin }) {
    return (
        <div className="landing-page">
            {/* Navbar */}
            <nav className="landing-nav">
                <div className="nav-logo">
                    <Brain size={28} className="text-accent" />
                    <span>Code Recall</span>
                </div>
                <div className="nav-actions">
                    <button onClick={onLogin} className="btn-nav-login">
                        Log In
                    </button>
                    <button onClick={onGetStarted} className="btn-nav-cta">
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="landing-hero">
                <div className="hero-content">
                    <div className="hero-badge">
                        <Sparkles size={14} className="text-accent" />
                        <span>AI-Powered Learning</span>
                    </div>
                    <h1>
                        Master your code <br />
                        with <span className="text-gradient">Active Recall</span>
                    </h1>
                    <p className="hero-sub">
                        Don't just copy-paste. Understand, visualize, and retain your coding patterns using our AI-driven spaced repetition engine.
                    </p>
                    <div className="hero-cta-group">
                        <button onClick={onGetStarted} className="btn-hero-primary">
                            Start Recalling Free <ArrowRight size={18} />
                        </button>
                        <button onClick={onLogin} className="btn-hero-secondary">
                            Existing User?
                        </button>
                    </div>
                </div>
                {/* Visual / Abstract Graphic */}
                <div className="hero-visual">
                    <div className="code-card-mockup">
                        <div className="mockup-header">
                            <span className="dot red"></span>
                            <span className="dot yellow"></span>
                            <span className="dot green"></span>
                        </div>
                        <div className="mockup-body">
                            <div className="code-line"><span className="k">function</span> <span className="f">sortColors</span>(nums) {'{'}</div>
                            <div className="code-line indent">  <span className="c">// 1. Dutch Partitioning Flag</span></div>
                            <div className="code-line indent">  <span className="k">let</span> low = 0, mid = 0, high = n-1;</div>
                            <div className="code-line indent">  <span className="k">while</span>(mid {'<='} high) {'{'}</div>
                            <div className="code-line indent-2">    <span className="k">if</span>(nums[mid] === 0) swap(low++, mid++);</div>
                            <div className="code-line indent">  {'}'}</div>
                            <div className="code-line">{'}'}</div>
                        </div>
                        <div className="mockup-ai-badge">
                            <Sparkles size={14} /> AI Analysis Ready
                        </div>
                    </div>
                </div>
            </header>

            {/* Features Grid */}
            <section className="landing-features">
                <h2>Why Developers Love Code Recall</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon"><Zap size={24} /></div>
                        <h3>Instant AI Notes</h3>
                        <p>Paste any snippet. We generate the intuition, time complexity, and edge cases instantly.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><Code2 size={24} /></div>
                        <h3>Code Visualizer</h3>
                        <p>Watch your code execute step-by-step. Perfect for understanding complex algorithms.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><Brain size={24} /></div>
                        <h3>Spaced Repetition</h3>
                        <p>Our Recall Mode prompts you to review patterns just as you're about to forget them.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <p>&copy; 2026 Code Recall. Built for developers.</p>
            </footer>
        </div>
    );
}

export default Home;
