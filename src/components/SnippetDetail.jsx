// ==========================================
// SNIPPET DETAIL COMPONENT
// ==========================================
// Shows the full details of a selected snippet.
// Displays title, topic, created date, and the code.
// ==========================================

function SnippetDetail({ snippet }) {
    // If no snippet is selected, show a placeholder message
    if (!snippet) {
        return (
            <div className="snippet-detail empty">
                <p>Select a snippet to view its details</p>
            </div>
        );
    }

    // Format the date to be more readable
    // toLocaleDateString gives us something like "2/7/2026"
    const formattedDate = new Date(snippet.createdAt).toLocaleDateString();

    return (
        <div className="snippet-detail">
            <div className="snippet-header">
                <h3>{snippet.title}</h3>
                <span className="snippet-meta">
                    {snippet.topic} • {formattedDate}
                </span>
            </div>

            {/* pre tag preserves whitespace and formatting in code */}
            <pre className="snippet-code">
                <code>{snippet.code}</code>
            </pre>
        </div>
    );
}

export default SnippetDetail;
