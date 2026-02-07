// ==========================================
// SNIPPET FORM COMPONENT
// ==========================================
// A simple form for creating new code snippets.
// Has three fields: title, topic, and code.
// ==========================================

import { useState } from "react";

function SnippetForm({ onSave }) {
    // Form state - each field has its own state
    const [title, setTitle] = useState("");
    const [topic, setTopic] = useState("");
    const [code, setCode] = useState("");

    // Handle form submission
    function handleSubmit(e) {
        e.preventDefault();

        // Basic validation - make sure all fields have content
        if (!title.trim() || !topic.trim() || !code.trim()) {
            alert("Please fill in all fields.");
            return;
        }

        // Call the onSave function passed from Dashboard
        // This will save the snippet to localStorage
        onSave({
            title: title.trim(),
            topic: topic.trim(),
            code: code.trim()
        });

        // Clear the form after saving
        setTitle("");
        setTopic("");
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

            <button type="submit" className="btn-primary">
                Save Snippet
            </button>
        </form>
    );
}

export default SnippetForm;
