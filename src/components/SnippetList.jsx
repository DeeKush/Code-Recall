// ==========================================
// SNIPPET LIST COMPONENT
// ==========================================
// Displays a list of all saved snippets.
// Each snippet shows title and topic.
// Click on a snippet to view its full content.
// ==========================================

function SnippetList({ snippets, selectedId, onSelect }) {
    // If there are no snippets, show a helpful message
    if (snippets.length === 0) {
        return (
            <div className="snippet-list empty">
                <p>No snippets yet. Create your first one!</p>
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
                        <span className="snippet-title">{snippet.title}</span>
                        <span className="snippet-topic">{snippet.topic}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default SnippetList;
