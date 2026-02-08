// ==========================================
// SNIPPET DETAIL COMPONENT (Collapsible Notes)
// ==========================================
// Shows snippet details with:
//   - AI tags with badge
//   - User tags (separate)
//   - Collapsible AI notes sections
// ==========================================

import { useState } from "react";

// Collapsible section component
function CollapsibleSection({ title, icon, children, defaultOpen = false }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={`collapsible-section ${isOpen ? "open" : ""}`}>
            <button
                className="collapsible-header"
                onClick={() => setIsOpen(!isOpen)}
                type="button"
            >
                <span className="collapsible-title">
                    {icon} {title}
                </span>
                <span className="collapsible-arrow">
                    {isOpen ? "▼" : "▶"}
                </span>
            </button>
            {isOpen && (
                <div className="collapsible-content">
                    {children}
                </div>
            )}
        </div>
    );
}

function SnippetDetail({ snippet, generatingNotes, onRetryNotes }) {
    const [copied, setCopied] = useState(false);

    function handleCopyCode() {
        if (snippet?.code) {
            navigator.clipboard.writeText(snippet.code)
                .then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                })
                .catch((err) => {
                    console.error("Failed to copy:", err);
                    alert("Failed to copy code.");
                });
        }
    }

    if (!snippet) {
        return (
            <div className="snippet-detail empty">
                <p>Select a snippet to view its details</p>
            </div>
        );
    }

    return (
        <div className="snippet-detail">
            {/* Header */}
            <div className="snippet-header">
                <h3>{snippet.title}</h3>
                <span className="snippet-meta">
                    {snippet.topic}
                    {snippet.createdAtReadable && (
                        <span> • {snippet.createdAtReadable.split(" ")[1]}</span>
                    )}
                </span>

                {/* AI Tags with badge */}
                {snippet.aiTags && snippet.aiTags.length > 0 && (
                    <div className="snippet-tags detail-tags">
                        {snippet.aiTags.map((tag, index) => (
                            <span key={`ai-${index}`} className="ai-tag-chip">
                                <span className="ai-badge">AI</span>
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* User tags (if different from AI tags) */}
                {snippet.tags && snippet.tags.length > 0 && (
                    <div className="snippet-tags detail-tags user-tags">
                        {snippet.tags
                            .filter(tag => !snippet.aiTags?.includes(tag))
                            .map((tag, index) => (
                                <span key={`user-${index}`} className="tag-chip">
                                    {tag}
                                </span>
                            ))}
                    </div>
                )}
            </div>

            {/* Code block */}
            <div className="code-container">
                <button
                    className="btn-copy"
                    onClick={handleCopyCode}
                    title="Copy code"
                >
                    {copied ? "Copied!" : "Copy"}
                </button>
                <pre className="snippet-code">
                    <code>{snippet.code}</code>
                </pre>
            </div>

            {/* AI Notes Section */}
            <div className="ai-section">
                <h4 className="ai-section-title">🤖 AI Notes</h4>

                {/* Loading state */}
                {generatingNotes && (
                    <div className="ai-loading">
                        <span className="ai-spinner"></span>
                        <span>Generating AI notes...</span>
                    </div>
                )}

                {/* Failed state */}
                {!generatingNotes && snippet.aiStatus === "failed" && (
                    <div className="ai-failed">
                        <span>⚠️ AI notes generation failed</span>
                        {onRetryNotes && (
                            <button
                                className="btn-retry"
                                onClick={() => onRetryNotes(snippet)}
                            >
                                🔄 Retry
                            </button>
                        )}
                    </div>
                )}

                {/* Success - Collapsible sections */}
                {!generatingNotes && snippet.aiNotes && typeof snippet.aiNotes === "object" && (
                    <div className="ai-notes-structured">
                        {snippet.aiNotes.problem && (
                            <CollapsibleSection title="Problem" icon="🎯" defaultOpen={true}>
                                <p>{snippet.aiNotes.problem}</p>
                            </CollapsibleSection>
                        )}

                        {snippet.aiNotes.intuition && (
                            <CollapsibleSection title="Intuition" icon="💡" defaultOpen={true}>
                                <p>{snippet.aiNotes.intuition}</p>
                            </CollapsibleSection>
                        )}

                        {snippet.aiNotes.approach && (
                            <CollapsibleSection title="Approach" icon="🛠️">
                                <p>{snippet.aiNotes.approach}</p>
                            </CollapsibleSection>
                        )}

                        {snippet.aiNotes.algorithmSteps && (
                            <CollapsibleSection title="Algorithm Steps" icon="📋">
                                <p>{snippet.aiNotes.algorithmSteps}</p>
                            </CollapsibleSection>
                        )}

                        {snippet.aiNotes.timeComplexity && (
                            <CollapsibleSection title="Time Complexity" icon="⏱️">
                                <p>{snippet.aiNotes.timeComplexity}</p>
                            </CollapsibleSection>
                        )}

                        {snippet.aiNotes.spaceComplexity && (
                            <CollapsibleSection title="Space Complexity" icon="💾">
                                <p>{snippet.aiNotes.spaceComplexity}</p>
                            </CollapsibleSection>
                        )}

                        {snippet.aiNotes.edgeCases && (
                            <CollapsibleSection title="Edge Cases" icon="⚠️">
                                <p>{snippet.aiNotes.edgeCases}</p>
                            </CollapsibleSection>
                        )}

                        {snippet.aiNotes.whenToUse && (
                            <CollapsibleSection title="When To Use" icon="🔑">
                                <p>{snippet.aiNotes.whenToUse}</p>
                            </CollapsibleSection>
                        )}
                    </div>
                )}

                {/* No notes yet */}
                {!generatingNotes && !snippet.aiStatus && !snippet.aiNotes && (
                    <div className="ai-pending">
                        <span>AI notes not generated yet.</span>
                        {onRetryNotes && (
                            <button
                                className="btn-retry"
                                onClick={() => onRetryNotes(snippet)}
                            >
                                ✨ Generate Notes
                            </button>
                        )}
                    </div>
                )}

                {/* Fallback for string notes */}
                {!generatingNotes && snippet.aiNotes && typeof snippet.aiNotes === "string" && (
                    <div className="ai-notes">
                        <p className="ai-notes-text">{snippet.aiNotes}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SnippetDetail;
