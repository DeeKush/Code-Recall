// ==========================================
// SNIPPET FORM COMPONENT (Day 2 Update)
// ==========================================
// Form for creating new code snippets.
// Now includes: title, topic, tags (comma-separated), and code.
// ==========================================

import { useState } from "react";

function SnippetForm({ onSave, saving }) {
    // Form state - each field has its own state
    const [title, setTitle] = useState("");
    const [topic, setTopic] = useState("");
    const [tags, setTags] = useState("");  // NEW: comma-separated tags input
    const [code, setCode] = useState("");

    // Handle form submission
    function handleSubmit(e) {
        e.preventDefault();

        // Basic validation - make sure required fields have content
        if (!title.trim() || !topic.trim() || !code.trim()) {
            alert("Please fill in title, topic, and code.");
            return;
        }

        // Parse tags: split by comma, trim whitespace, filter empty strings
        // Example: "dp, arrays, prefix sum" → ["dp", "arrays", "prefix sum"]
        const tagsArray = tags
            .split(",")
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);

        // Call the onSave function passed from Dashboard
        onSave({
            title: title.trim(),
            topic: topic.trim(),
            code: code.trim(),
            tags: tagsArray  // NEW: pass tags array
        });

        // Clear the form after saving
        setTitle("");
        setTopic("");
        setTags("");
        setCode("");
    }

    return (
        <form onSubmit={handleSubmit} className="snippet-form">
            <h3>Create New Snippet</h3>

            <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Array Map Example"
                />
            </div>

            <div className="form-group">
                <label htmlFor="topic">Topic</label>
                <input
                    type="text"
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., JavaScript Arrays"
                />
            </div>

            {/* NEW: Tags input field */}
            <div className="form-group">
                <label htmlFor="tags">Tags (comma separated)</label>
                <input
                    type="text"
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g., dp, arrays, prefix sum"
                />
            </div>

            <div className="form-group">
                <label htmlFor="code">Code</label>
                <textarea
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Paste your code here..."
                    rows={8}
                />
            </div>

            <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Save Snippet"}
            </button>
        </form>
    );
}

export default SnippetForm;
