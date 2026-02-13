import React from "react";
import { Brain, ArrowRight } from "lucide-react";

function RecallCTA({ snippets, onNavigate }) {
    // Calculate due count
    const getDueCount = () => {
        if (!snippets) return 0;
        const now = new Date();
        const todayStr = now.toDateString();

        const eligible = snippets.filter(s => {
            if (!s.lastRecalledAt?.seconds) return true;
            const d = new Date(s.lastRecalledAt.seconds * 1000);
            return d.toDateString() !== todayStr;
        });

        return eligible.length;
    };

    const dueCount = getDueCount();

    return (
        <div className="recall-cta-panel-hero">
            <div className="recall-cta-content">
                <div className="recall-icon-badge-hero">
                    <Brain size={24} />
                </div>
                <div className="recall-text-group">
                    <h4>Ready to recall?</h4>
                    <span className="recall-subtext-hero">{dueCount} snippets waiting for today</span>
                </div>
            </div>
            <button
                className="std-btn-primary btn-recall-hero"
                onClick={() => onNavigate("recall")}
            >
                Start Recall <ArrowRight size={16} />
            </button>
        </div>
    );
}

export default RecallCTA;
