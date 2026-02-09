// ==========================================
// SNIPPET FORM COMPONENT (Day 4 - Dark Theme)
// ==========================================
// Two-step flow with dark UI:
//   1. User pastes code, clicks "Generate Details"
//   2. AI generates metadata (with loading skeleton)
//   3. Preview appears - user reviews/edits
//   4. User clicks "Confirm Save" to save
// ==========================================

import { useState } from "react";
import { Code, Sparkles, FileText, Tag, Loader, Check, X, Plus } from "lucide-react";
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
    const [tagsInput, setTagsInput] = useState("");

    // Step 1: Analyze code and show review panel
    async function handleAnalyze(e) {
        e.preventDefault();

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
            const metadata = await generateSnippetMetadata(code);
            setTitle(metadata.title || "");
            setTopic(metadata.topic || "");
            setTagsInput((metadata.aiTags || []).join(", "));
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
        const tagsArray = tagsInput
            .split(",")
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);

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

    // Cancel review
    function handleCancel() {
        setShowReview(false);
        setTitle("");
        setTopic("");
        setTagsInput("");
    }

    // Remove a tag
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

    const canSave = showReview && !saving && title.trim() && topic.trim();

    return (
        <div className="snippet-form-dark">
            <div className="form-header-dark">
                <Plus size={20} className="form-header-icon" />
                <h3>New Snippet</h3>
            </div>

            {/* Code input section */}
            <div className="form-section-dark">
                <label className="form-label-dark">
                    <Code size={16} />
                    <span>Code</span>
                </label>
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Paste your code here..."
                    rows={10}
                    disabled={analyzing || showReview}
                    className="form-textarea-dark"
                />

                {/* Generate button */}
                {!showReview && (
                    <button
                        onClick={handleAnalyze}
                        disabled={analyzing || !code.trim()}
                        className="btn-generate-dark"
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

            {/* Loading skeleton */}
            {analyzing && (
                <div className="form-section-dark skeleton-container">
                    <div className="skeleton-text-dark">Understanding your code...</div>
                    <div className="skeleton-block-dark"></div>
                    <div className="skeleton-block-dark short"></div>
                    <div className="skeleton-block-dark shorter"></div>
                </div>
            )}

            {/* Review section */}
            {showReview && !analyzing && (
                <div className="form-section-dark review-section-dark">
                    <div className="review-header-dark">
                        <Sparkles size={16} />
                        <span>Generated Details</span>
                        <span className="review-badge-dark">Review</span>
                    </div>

                    {/* Title */}
                    <div className="form-field-dark">
                        <label className="form-label-dark">
                            <FileText size={14} />
                            <span>Title</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Snippet title"
                            className="form-input-dark"
                        />
                    </div>

                    {/* Topic */}
                    <div className="form-field-dark">
                        <label className="form-label-dark">
                            <FileText size={14} />
                            <span>Topic</span>
                        </label>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., Binary Search, DP"
                            className="form-input-dark"
                        />
                    </div>

                    {/* Tags */}
                    <div className="form-field-dark">
                        <label className="form-label-dark">
                            <Tag size={14} />
                            <span>Tags</span>
                        </label>

                        {parsedTags.length > 0 && (
                            <div className="tag-editor-dark">
                                {parsedTags.map((tag, index) => (
                                    <span key={index} className="editable-tag-dark">
                                        {tag}
                                        <button
                                            type="button"
                                            className="tag-remove-dark"
                                            onClick={() => handleRemoveTag(tag)}
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        <input
                            type="text"
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                            placeholder="Add tags (comma separated)"
                            className="form-input-dark"
                        />
                    </div>

                    {/* Actions */}
                    <div className="review-actions-dark">
                        <button
                            onClick={handleSave}
                            disabled={!canSave}
                            className="btn-save-dark"
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
                            onClick={handleCancel}
                            disabled={saving}
                            className="btn-cancel-dark"
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
