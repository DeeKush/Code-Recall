// ==========================================
// SNIPPET DETAIL COMPONENT (Day 2 Update)
// ==========================================
// Shows the full details of a selected snippet.
// NEW: Displays tags as chips with full date/time.
// NEW: Copy code button at top right
// ==========================================

import { useState } from "react";

function SnippetDetail({ snippet }) {
    // State to show "Copied!" feedback
    const [copied, setCopied] = useState(false);

    // Copy code to clipboard
    function handleCopyCode() {
        if (snippet?.code) {
            navigator.clipboard.writeText(snippet.code)
                .then(() => {
                    // Show "Copied!" feedback for 2 seconds
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                })
                .catch((err) => {
                    console.error("Failed to copy:", err);
                    alert("Failed to copy code.");
                });
        }
    }

    // If no snippet is selected, show a placeholder message
    if (!snippet) {
        return (
            <div className="snippet-detail empty">
                <p>Select a snippet to view its details</p>
            </div>
        );
    }

    return (
        <div className="snippet-detail">
            <div className="snippet-header">
                <h3>{snippet.title}</h3>
                <span className="snippet-meta">
                    {snippet.topic}
                    {/* Show readable time if available */}
                    {snippet.createdAtReadable && (
                        <span> • Saved at {snippet.createdAtReadable.split(" ")[1]}</span>
                    )}
                </span>

                {/* Tags as chips */}
                {snippet.tags && snippet.tags.length > 0 && (
                    <div className="snippet-tags detail-tags">
                        {snippet.tags.map((tag, index) => (
                            <span key={index} className="tag-chip">{tag}</span>
                        ))}
                    </div>
                )}
            </div>

            {/* Code block with copy button at top right */}
            <div className="code-container">
                <button
                    className="btn-copy"
                    onClick={handleCopyCode}
                    title="Copy code to clipboard"
                >
                    {copied ? "Copied!" : "Copy"}
                </button>
                <pre className="snippet-code">
                    <code>{snippet.code}</code>
                </pre>
            </div>
        </div>
    );
}

export default SnippetDetail;
