import React from "react";
import { Sparkles, Tag, Check, X, FolderOpen, Brain } from "lucide-react";

function CreateSnippetRight({
    title, topic, tags,
    onChange,
    showReview,
    onSave,
    onCancel,
    saving,
}) {

    // Helper to update specific field
    const updateField = (field, value) => {
        onChange({ [field]: value });
    };

    // If not showing review, show the Empty State
    if (!showReview) {
        return (
            <div className="create-right-empty">
                <div className="empty-state-content">
                    <div className="pulsing-icon">
                        <Brain size={48} className="text-muted-glow" />
                    </div>
                    <h3>Snippet Preview</h3>
                    <p>See how this will appear during recall.</p>
                    <p className="sub-text">Builds your memory graph automatically.</p>
                </div>
            </div>
        );
    }

    // REVIEW MODE
    return (
        <div className="create-right-preview">
            <div className="preview-card-header">
                <div className="preview-label">
                    <Sparkles size={16} className="text-accent" />
                    <span>AI Analysis</span>
                </div>
            </div>

            {/* Editable Fields styled as Preview */}
            <div className="preview-form">
                <div className="input-group">
                    <label className="preview-label-text">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => updateField("title", e.target.value)}
                        className="std-input preview-input title-input"
                        placeholder="Snippet Title"
                    />
                </div>

                <div className="input-group">
                    <label className="preview-label-text">Topic</label>
                    <div className="topic-badge-wrapper">
                        <FolderOpen size={16} />
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => updateField("topic", e.target.value)}
                            className="std-input preview-input-transparent"
                            placeholder="Topic"
                        />
                    </div>
                </div>

                <div className="input-group">
                    <label className="preview-label-text">Tags</label>
                    <div className="tags-container">
                        {tags.map((tag, idx) => (
                            <span key={idx} className="tag-chip">
                                <Tag size={12} /> {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* "Why this matters" Block */}
            <div className="why-matters-block">
                <h4>Why this matters</h4>
                <ul>
                    <li>helps you recall <strong>{topic || "this topic"}</strong></li>
                    {tags.slice(0, 2).map(t => <li key={t}>strengthens memory of <strong>{t}</strong></li>)}
                    <li>builds your daily streak</li>
                </ul>
            </div>

            {/* Actions */}
            <div className="preview-actions">
                <button className="btn-ghost" onClick={onCancel}>
                    <X size={16} /> Cancel
                </button>
                <button className="std-btn-primary btn-save" onClick={onSave} disabled={saving}>
                    {saving ? "Saving..." : <><Check size={16} /> Save to Memory</>}
                </button>
            </div>
        </div>
    );
}

export default CreateSnippetRight;
