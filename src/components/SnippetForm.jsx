// ==========================================
// SNIPPET FORM COMPONENT (Refactored for Dashboard Home)
// ==========================================
// Controlled component.
// Props:
//  - code, title, topic, tags (values)
//  - onChange (function to update parent state)
//  - onSave (function to trigger save)
//  - saving (boolean)
// ==========================================

import { useState } from "react";
import { Code, Sparkles, FileText, Tag, Loader, Check, X, Plus, AlertCircle } from "lucide-react";
import { generateSnippetMetadata } from "../utils/groq";

function SnippetForm({
    code,
    title,
    topic,
    tags,
    onChange,
    onSave,
    saving
}) {
    // Internal UI state
    const [analyzing, setAnalyzing] = useState(false);
    const [showReview, setShowReview] = useState(false);
    const [tagsInput, setTagsInput] = useState("");

    // Helper to update specific field
    const updateField = (field, value) => {
        onChange({ [field]: value });
    };

    // Analyze Code
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

            // Batch update parent state
            onChange({
                title: metadata.title || "",
                topic: metadata.topic || "",
                tags: metadata.aiTags || []
            });

            // Reset local tags input since tags are now in parent state
            setTagsInput("");
            setShowReview(true);
        } catch (error) {
            console.error("Analysis failed:", error);
            // Fallback: let user fill in details manually
            onChange({
                title: "",
                topic: "",
                tags: []
            });
            setShowReview(true);
        } finally {
            setAnalyzing(false);
        }
    }

    // Add Tag
    const handleAddTag = () => {
        if (!tagsInput.trim()) return;
        const newTag = tagsInput.trim();
        if (!tags.includes(newTag)) {
            updateField("tags", [...tags, newTag]);
        }
        setTagsInput("");
    };

    // Remove Tag
    const handleRemoveTag = (tagToRemove) => {
        updateField("tags", tags.filter(t => t !== tagToRemove));
    };

    // Confirm Save
    const handleConfirmSave = () => {
        onSave(); // Parent handles the actual object construction and saving
        // Reset internal UI state
        setShowReview(false);
        setTagsInput("");
    };

    const handleCancel = () => {
        setShowReview(false);
        // We do NOT clear the form data here, allowing user to edit code again if they want
        // If we want to clear, parent should handle it on "Cancel" or we just hide review
    };

    const isFormValid = title.trim() && topic.trim();

    return (
        <div className="snippet-form-dark">
            <div className="form-header-dark">
                <Plus size={20} className="form-header-icon" />
                <h3>New Snippet</h3>
            </div>

            {/* Code Input */}
            <div className="section-gap">
                <label className="std-label">
                    <Code size={14} />
                    <span>Code</span>
                </label>
                <textarea
                    value={code}
                    onChange={(e) => updateField("code", e.target.value)}
                    placeholder="Paste your code here..."
                    rows={12}
                    disabled={analyzing || showReview}
                    className="std-textarea code-font"
                    spellCheck="false"
                />

                {!showReview && (
                    <button
                        onClick={handleAnalyze}
                        disabled={analyzing || !code.trim()}
                        className="std-btn-primary"
                        style={{ marginTop: "16px" }}
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

            {/* Loading Skeleton */}
            {analyzing && (
                <div className="form-section-dark skeleton-container">
                    <div className="skeleton-text-dark">Understanding your code...</div>
                    <div className="skeleton-block-dark"></div>
                    <div className="skeleton-block-dark short"></div>
                </div>
            )}

            {/* Review & Edit Section */}
            {showReview && !analyzing && (
                <div className="review-section-dark">
                    <div className="review-header-dark" style={{ marginBottom: "1.5rem" }}>
                        <Sparkles size={16} />
                        <span>Snippet Details</span>
                    </div>

                    {/* Title */}
                    <div className="input-group">
                        <label className="std-label">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => updateField("title", e.target.value)}
                            className="std-input"
                            placeholder="Snippet Title"
                        />
                    </div>

                    {/* Topic */}
                    <div className="input-group">
                        <label className="std-label">Topic</label>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => updateField("topic", e.target.value)}
                            className="std-input"
                            placeholder="e.g. Algorithms"
                        />
                    </div>

                    {/* Tags */}
                    <div className="input-group">
                        <label className="std-label">Tags</label>
                        <div className="tag-input-row" style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="text"
                                value={tagsInput}
                                onChange={(e) => setTagsInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                                className="std-input"
                                placeholder="Add tag + Enter"
                            />
                            <button onClick={handleAddTag} className="std-btn-outline" style={{ width: 'auto' }}>
                                <Plus size={16} />
                            </button>
                        </div>
                        <div className="tag-list mt-2" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                            {tags.map(tag => (
                                <span key={tag} className="tag-chip-dark">
                                    {tag}
                                    <button onClick={() => handleRemoveTag(tag)} style={{ marginLeft: '6px', cursor: 'pointer', background: 'none', border: 'none', color: 'inherit', padding: 0, display: 'flex' }}>
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="review-actions-dark" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
                        <button onClick={handleCancel} disabled={saving} className="std-btn-outline" style={{ justifyContent: 'center' }}>
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmSave}
                            disabled={!isFormValid || saving}
                            className="std-btn-primary"
                        >
                            {saving ? <Loader size={16} className="spinning" /> : <Check size={16} />}
                            <span>{saving ? "Saving..." : "Save Snippet"}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SnippetForm;
