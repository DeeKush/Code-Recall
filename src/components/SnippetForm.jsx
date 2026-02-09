// ==========================================
// SNIPPET FORM COMPONENT (Day 4 - Enhanced UX)
// ==========================================
// Two-step flow with improved UI:
//   1. User pastes code, clicks "Generate Details"
//   2. AI generates metadata (with loading skeleton)
//   3. Preview appears - user reviews/edits
//   4. User clicks "Confirm Save" to save
// ==========================================

import { useState } from "react";
import { Code, Sparkles, FileText, Tag, Loader, Check, X } from "lucide-react";
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
    const [tagsInput, setTagsInput] = useState("");  // Comma-separated string

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
            setTitle(metadata.title || "");
            setTopic(metadata.topic || "");
            setTagsInput((metadata.aiTags || []).join(", "));

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
        const tagsArray = tagsInput
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
        setTagsInput("");
        setShowReview(false);
    }

    // Cancel review and go back to code input
    function handleCancel() {
        setShowReview(false);
        setTitle("");
        setTopic("");
        setTagsInput("");
    }

    // Remove a single tag
    function handleRemoveTag(tagToRemove) {
        const currentTags = tagsInput
            .split(",")
            .map(t => t.trim())
            .filter(t => t.length > 0 && t !== tagToRemove);
        setTagsInput(currentTags.join(", "));
    }

    // Parse tags for display
    const parsedTags = tagsInput
        .split(",")
        .map(t => t.trim())
        .filter(t => t.length > 0);

    // Check if save should be disabled
    const canSave = showReview && !saving && title.trim() && topic.trim();

    return (
        <div className="snippet-form">
            <h3>Save Code Snippet</h3>

            {/* ======== SECTION 1: CODE INPUT ======== */}
            <div className="form-section">
                <div className="section-header">
                    <Code size={18} className="section-icon" />
                    <span>Code</span>
                </div>

                <div className="section-content">
                    <div className="form-group">
                        <textarea
                            id="code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Paste your DSA / competitive programming code here..."
                            rows={8}
                            disabled={analyzing || showReview}
                        />
                    </div>

                    {/* Generate Details button - only show if not in review mode */}
                    {!showReview && (
                        <button
                            type="button"
                            className="btn-primary btn-generate"
                            onClick={handleAnalyze}
                            disabled={analyzing || !code.trim()}
                        >
                            {analyzing ? (
                                <>
                                    <Loader size={16} className="spinning" />
                                    <span>Analyzing...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles size={16} />
                                    <span>Generate Details</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* ======== LOADING SKELETON ======== */}
            {analyzing && (
                <div className="form-section skeleton-section">
                    <div className="section-header">
                        <Sparkles size={18} className="section-icon" />
                        <span>Generated Details</span>
                    </div>
                    <div className="section-content">
                        <div className="skeleton-loading">
                            <div className="skeleton-text">Understanding your code...</div>
                            <div className="skeleton-block"></div>
                            <div className="skeleton-block short"></div>
                            <div className="skeleton-block shorter"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* ======== SECTION 2: GENERATED DETAILS (Review Panel) ======== */}
            {showReview && !analyzing && (
                <div className="form-section review-section">
                    <div className="section-header">
                        <Sparkles size={18} className="section-icon" />
                        <span>Generated Details</span>
                        <span className="review-badge">Review & Edit</span>
                    </div>

                    <div className="section-content">
                        <p className="review-hint">
                            AI-generated metadata. Edit if needed before saving.
                        </p>

                        {/* Title Input */}
                        <div className="form-group">
                            <label htmlFor="title">
                                <FileText size={14} className="label-icon" />
                                Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Snippet title"
                            />
                        </div>

                        {/* Topic Input */}
                        <div className="form-group">
                            <label htmlFor="topic">
                                <FileText size={14} className="label-icon" />
                                Topic
                            </label>
                            <input
                                type="text"
                                id="topic"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g., Binary Search, DP"
                            />
                        </div>

                        {/* Tags Editor */}
                        <div className="form-group">
                            <label htmlFor="tags">
                                <Tag size={14} className="label-icon" />
                                Tags
                            </label>

                            {/* Tag chips display */}
                            {parsedTags.length > 0 && (
                                <div className="tag-editor">
                                    {parsedTags.map((tag, index) => (
                                        <span key={index} className="editable-tag">
                                            {tag}
                                            <button
                                                type="button"
                                                className="tag-remove"
                                                onClick={() => handleRemoveTag(tag)}
                                                title="Remove tag"
                                            >
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            <input
                                type="text"
                                id="tags"
                                value={tagsInput}
                                onChange={(e) => setTagsInput(e.target.value)}
                                placeholder="Add tags separated by commas"
                                className="tag-input"
                            />
                        </div>

                        {/* Action buttons */}
                        <div className="review-actions">
                            <button
                                type="button"
                                className="btn-primary btn-confirm"
                                onClick={handleSave}
                                disabled={!canSave}
                            >
                                {saving ? (
                                    <>
                                        <Loader size={16} className="spinning" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check size={16} />
                                        <span>Confirm Save</span>
                                    </>
                                )}
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
                </div>
            )}
        </div>
    );
}

export default SnippetForm;
