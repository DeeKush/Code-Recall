// ==========================================
// SNIPPET LIST COMPONENT (Day 2 Update)
// ==========================================
// Displays a list of all saved snippets.
// NEW: Shows tags, code preview, loading state, and empty filter message.
// ==========================================

/**
 * Get the first N lines of code for preview
 * @param {string} code - The full code string
 * @param {number} lines - Number of lines to show
 * @returns {string} - First N lines of code
 */
function getCodePreview(code, lines = 2) {
    if (!code) return "";
    const codeLines = code.split("\n");
    const previewLines = codeLines.slice(0, lines);
    // Add "..." if there are more lines
    if (codeLines.length > lines) {
        return previewLines.join("\n") + "\n...";
    }
    return previewLines.join("\n");
}

function SnippetList({ snippets, selectedId, onSelect, loading }) {
    // NEW: Show loading state while fetching
    if (loading) {
        return (
            <div className="snippet-list loading">
                <p>Loading snippets...</p>
            </div>
        );
    }

    // Show message when no snippets exist at all
    if (snippets.length === 0) {
        return (
            <div className="snippet-list empty">
                <p>No snippets found.</p>
                <p className="empty-hint">Create your first snippet or adjust your search filters.</p>
            </div>
        );
    }

    return (
        <div className="snippet-list">
            <h3>Your Snippets ({snippets.length})</h3>

            <ul>
                {/* Loop through each snippet and create a list item */}
                {snippets.map((snippet) => (
                    <li
                        key={snippet.id}
                        // Add 'selected' class if this snippet is currently selected
                        className={`snippet-item ${selectedId === snippet.id ? "selected" : ""}`}
                        // When clicked, call onSelect with this snippet
                        onClick={() => onSelect(snippet)}
                    >
                        {/* Title */}
                        <span className="snippet-title">{snippet.title}</span>

                        {/* Topic and time */}
                        <span className="snippet-topic">
                            {snippet.topic}
                            {snippet.createdAtReadable && (
                                <span className="snippet-date"> • Saved at {snippet.createdAtReadable.split(" ")[1]}</span>
                            )}
                        </span>

                        {/* NEW: Tags as chips */}
                        {snippet.tags && snippet.tags.length > 0 && (
                            <div className="snippet-tags">
                                {snippet.tags.map((tag, index) => (
                                    <span key={index} className="tag-chip">{tag}</span>
                                ))}
                            </div>
                        )}

                        {/* NEW: Code preview (first 2 lines) */}
                        <pre className="snippet-preview">
                            <code>{getCodePreview(snippet.code, 2)}</code>
                        </pre>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default SnippetList;
