import React from "react";
import { Clock, Code } from "lucide-react";

function RecentSnippetsStrip({ snippets, onSelect }) {
    // Top 3 recent
    const recent = [...snippets]
        .sort((a, b) => {
            // Timestamp comparison
            const tA = a.createdAt?.seconds || 0;
            const tB = b.createdAt?.seconds || 0;
            return tB - tA;
        })
        .slice(0, 3);

    if (recent.length === 0) return null;

    return (
        <div className="recent-snippets-strip">
            <div className="recent-label">
                <Clock size={14} />
                <span>Jump back to what you just saved</span>
            </div>
            <div className="recent-list">
                {recent.map(snippet => (
                    <div
                        key={snippet.id}
                        className="recent-chip"
                        onClick={() => onSelect(snippet)}
                        role="button"
                    >
                        <Code size={12} />
                        <span className="truncate">{snippet.title || "Untitled Snippet"}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RecentSnippetsStrip;
