// ==========================================
// SNIPPET FORM COMPONENT (Review-Before-Save)
// ==========================================
// Two-step flow:
//   1. User pastes code, clicks "Analyze"
//   2. AI generates metadata, user reviews/edits
//   3. User clicks "Save" to confirm
// ==========================================

import { useState } from "react";
import { generateSnippetMetadata } from "../utils/groq";

function SnippetForm({ onSave, saving }) {
    // Form state
    const [code, setCode] = useState("");

    // Review panel state (shown after AI generates metadata)
    const [showReview, setShowReview] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    // Editable metadata fields
    const [title, setTitle] = useState("");
    const [topic, setTopic] = useState("");
    const [tags, setTags] = useState("");  // Comma-separated string

    // Step 1: Analyze code and show review panel
    async function handleAnalyze(e) {
        e.preventDefault();

        // Validation
        if (!code.trim()) {
            alert("Please paste some code.");
            return;
        }

        if (code.trim().length < 20) {
            alert("Please enter more code (at least 20 characters).");
            return;
        }

        setAnalyzing(true);

        try {
            // Call AI to generate metadata
            const metadata = await generateSnippetMetadata(code);

            // Pre-fill the review fields
            setTitle(metadata.title);
            setTopic(metadata.topic);
            setTags(metadata.aiTags.join(", "));

            // Show the review panel
            setShowReview(true);

        } catch (error) {
            console.error("Analysis failed:", error);
            alert("Failed to analyze code. Please try again.");
        } finally {
            setAnalyzing(false);
        }
    }

    // Step 2: Save the snippet with reviewed metadata
    function handleSave() {
        // Parse tags from comma-separated string
        const tagsArray = tags
            .split(",")
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);

        // Call onSave with the reviewed data
        onSave({
            code: code.trim(),
            title: title.trim(),
            topic: topic.trim(),
            tags: tagsArray
        });

        // Reset form
        setCode("");
        setTitle("");
        setTopic("");
        setTags("");
        setShowReview(false);
    }

    // Cancel review and go back to code input
    function handleCancel() {
        setShowReview(false);
        setTitle("");
        setTopic("");
        setTags("");
    }

    return (
        <div className="snippet-form">
            <h3>Save Code Snippet</h3>

            {/* Step 1: Code input */}
            {!showReview && (
                <form onSubmit={handleAnalyze}>
                    <div className="form-group">
                        <label htmlFor="code">Paste your code</label>
                        <textarea
                            id="code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Paste your DSA / competitive programming code here..."
                            rows={10}
                            disabled={analyzing}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={analyzing || !code.trim()}
                    >
                        {analyzing ? "Analyzing..." : "Analyze Code"}
                    </button>
                </form>
            )}

            {/* Step 2: Review and edit metadata */}
            {showReview && (
                <div className="review-panel">
                    <p className="review-hint">Review AI-generated metadata before saving:</p>

                    <div className="form-group">
                        <label htmlFor="title">Title</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Snippet title"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="topic">Topic</label>
                        <input
                            type="text"
                            id="topic"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., Binary Search, DP"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="tags">Tags (comma separated)</label>
                        <input
                            type="text"
                            id="tags"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="e.g., arrays, sorting, O(n)"
                        />
                    </div>

                    <div className="review-actions">
                        <button
                            type="button"
                            className="btn-primary"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "Save Snippet"}
                        </button>
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={handleCancel}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SnippetForm;
