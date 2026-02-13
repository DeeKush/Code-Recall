import React from "react";
import { Zap, Clock } from "lucide-react";

function HomeHeader({ user, snippets }) {
    // 1. Calculate Streak
    const calculateStreak = () => {
        if (!snippets || snippets.length === 0) return 0;
        const toDay = (date) => date.toISOString().split('T')[0];
        const recallDates = new Set();
        const lastRecallTimes = [];

        snippets.forEach(s => {
            if (s.lastRecalledAt?.seconds) {
                const d = new Date(s.lastRecalledAt.seconds * 1000);
                recallDates.add(toDay(d));
                lastRecallTimes.push(d.getTime());
            }
        });

        const today = new Date();
        let streak = 0;
        for (let i = 0; i < 365; i++) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = toDay(d);
            if (recallDates.has(dateStr)) {
                streak++;
            } else {
                if (i === 0) continue;
                break;
            }
        }

        // Last recall metric
        let lastRecallText = "No sessions yet";
        if (lastRecallTimes.length > 0) {
            const last = Math.max(...lastRecallTimes);
            const diff = Date.now() - last;
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const days = Math.floor(hours / 24);

            if (days === 0 && new Date(last).getDate() === today.getDate()) {
                lastRecallText = "Today";
            } else if (hours < 1) {
                lastRecallText = "Just now";
            } else if (hours < 24) {
                lastRecallText = `${hours}h ago`;
            } else {
                lastRecallText = `${days}d ago`;
            }
        }

        return { streak, lastRecallText };
    };

    const { streak, lastRecallText } = calculateStreak();
    const firstName = user?.displayName?.split(" ")[0] || "Deepak";

    return (
        <div className="home-welcome-header">
            <div className="welcome-identity">
                <h1>Let’s lock today’s concepts into memory.</h1>
                <p className="welcome-subtext">Your recall queue is ready.</p>

                <div className="header-stats-row">
                    <div className="streak-badge">
                        <Zap size={14} className={streak > 0 ? "fill-current" : ""} />
                        <span>Today’s recall streak: {streak} days</span>
                    </div>
                    <div className="streak-badge-secondary">
                        <Clock size={13} />
                        <span>Last recall: {lastRecallText}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomeHeader;
