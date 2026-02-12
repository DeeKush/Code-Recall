// ==========================================
// ANALYTICS DASHBOARD (Day 7 - Monitor View)
// ==========================================
// Read-only overview of snippet stats.
// ==========================================

import { BarChart2, CheckCircle, Clock } from "lucide-react";

function AnalyticsDashboard({ snippets }) {
    const totalSnippets = snippets.length;
    const aiAnalyzedCount = snippets.filter(s => s.aiNotes).length;

    // Calculate last activity (most recent createdAt)
    const sortedSnippets = [...snippets].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    const lastCreated = sortedSnippets.length > 0
        ? new Date(sortedSnippets[0].createdAt?.seconds * 1000).toLocaleDateString()
        : "N/A";

    const recentSnippets = sortedSnippets.slice(0, 5);

    return (
        <div className="analytics-dashboard">
            <div className="dashboard-header">
                <h2>Overview</h2>
                <p>Monitor your learning progress</p>
            </div>

            {/* Stats Grid */}
            <div className="dashboard-stats-grid">
                <div className="stat-card">
                    <div className="stat-info">
                        <span className="stat-label">Total Snippets</span>
                        <span className="stat-value">{totalSnippets}</span>
                    </div>
                    <div className="stat-icon-wrapper blue">
                        <BarChart2 size={24} />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-info">
                        <span className="stat-label">AI Analyzed</span>
                        <span className="stat-value">{aiAnalyzedCount}</span>
                    </div>
                    <div className="stat-icon-wrapper green">
                        <CheckCircle size={24} />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-info">
                        <span className="stat-label">Last Activity</span>
                        <span className="stat-value">{lastCreated}</span>
                    </div>
                    <div className="stat-icon-wrapper purple">
                        <Clock size={24} />
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="recent-activity-section">
                <h3>Recent Activity</h3>
                <div className="recent-list">
                    {recentSnippets.length === 0 ? (
                        <div className="empty-recent">No activity yet.</div>
                    ) : (
                        recentSnippets.map(snippet => {
                            const isAiReady = !!snippet.aiNotes;
                            const dateStr = snippet.createdAt?.seconds
                                ? new Date(snippet.createdAt.seconds * 1000).toLocaleDateString()
                                : "Just now";

                            return (
                                <div key={snippet.id} className="recent-item-row">
                                    <div className="recent-icon-col">
                                        <div className="recent-dot"></div>
                                    </div>
                                    <div className="recent-info-col">
                                        <span className="recent-title">{snippet.title || "Untitled"}</span>
                                        <span className="recent-topic">{snippet.topic || "No topic"}</span>
                                    </div>
                                    <div className="recent-meta-col">
                                        <span className="recent-date">{dateStr}</span>
                                        <span className={`badge-${isAiReady ? "ai-ready" : "pending"}`}>
                                            {isAiReady ? "AI Ready" : "Pending"}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

export default AnalyticsDashboard;
