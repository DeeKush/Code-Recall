// ==========================================
// SNIPPET LIST COMPONENT (Day 4 - Dark Theme)
// ==========================================
// Displays snippet cards with:
//   - Dark card styling
//   - Title, topic, date, tags
//   - Selected state highlight
//   - Skeleton loader
//   - Empty state
// ==========================================

import { FileCode, Calendar, Tag, Inbox } from "lucide-react";

function SnippetList({ snippets, selectedId, onSelect, loading }) {
    // Loading state - show skeleton
    if (loading) {
        return (
            <div className="snippet-list-dark">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="snippet-card-skeleton">
                        <div className="skeleton-line title"></div>
                        <div className="skeleton-line topic"></div>
                        <div className="skeleton-line tags"></div>
                    </div>
                ))}
            </div>
        );
    }

    // Empty state
    if (!snippets || snippets.length === 0) {
        return (
            <div className="snippet-list-empty">
                <Inbox size={48} className="empty-icon" />
                <p className="empty-title">No snippets yet</p>
                <p className="empty-subtitle">Save your first code snippet to get started</p>
            </div>
        );
    }

    return (
        <div className="snippet-list-dark">
            {snippets.map((snippet) => {
                const isSelected = selectedId === snippet.id;

                return (
                    <button
                        key={snippet.id}
                        className={`snippet-card-dark ${isSelected ? "selected" : ""}`}
                        onClick={() => onSelect(snippet)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                onSelect(snippet);
                            }
                        }}
                        tabIndex={0}
                        aria-selected={isSelected}
                    >
                        {/* Title row */}
                        <div className="card-title-row">
                            <FileCode size={16} className="card-icon" />
                            <span className="card-title">
                                {snippet.title || "Untitled Snippet"}
                            </span>
                        </div>

                        {/* Topic row */}
                        <div className="card-topic">
                            {snippet.topic || "No topic"}
                        </div>

                        {/* Meta row - date */}
                        <div className="card-meta">
                            <Calendar size={12} />
                            <span>
                                {snippet.createdAtReadable?.split(" ")[0] || "Unknown date"}
                            </span>
                        </div>

                        {/* Tags */}
                        {snippet.tags && snippet.tags.length > 0 && (
                            <div className="card-tags">
                                <Tag size={12} className="tag-icon" />
                                {snippet.tags.slice(0, 3).map((tag, index) => (
                                    <span key={index} className="tag-chip-dark">
                                        {tag}
                                    </span>
                                ))}
                                {snippet.tags.length > 3 && (
                                    <span className="tag-more">+{snippet.tags.length - 3}</span>
                                )}
                            </div>
                        )}

                        {/* Code preview */}
                        <div className="card-preview">
                            <code>
                                {snippet.code?.slice(0, 80)}
                                {snippet.code?.length > 80 ? "..." : ""}
                            </code>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}

export default SnippetList;
