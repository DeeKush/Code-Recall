import React, { useState } from "react";
import { Code, Sparkles, Loader, Terminal } from "lucide-react";

function CreateSnippetLeft({ code, onChange, onAnalyze, analyzing, showReview }) {
    const [isFocused, setIsFocused] = useState(false);

    const handlePasteClipboard = async () => {
        try {
            const text = await navigator.clipboard.readText();
            onChange(text);
        } catch (err) {
            console.error("Failed to read clipboard", err);
        }
    };

    const showPlaceholder = !code && !isFocused;

    return (
        <div className="create-left-panel">
            <div className="panel-header-small">
                <Code size={16} className="text-accent" />
                <span>Code Source</span>
            </div>

            <div className="code-input-wrapper" style={{ position: 'relative' }}>
                <textarea
                    value={code}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="std-textarea code-font input-expanded"
                    disabled={analyzing || showReview}
                    spellCheck="false"
                />

                {/* Visual Placeholder Overlay */}
                {showPlaceholder && (
                    <div className="code-input-placeholder">
                        <span className="placeholder-text">
                            Paste a function or snippet you solved today.<br />
                            This will be scheduled for recall automatically.
                        </span>
                    </div>
                )}
            </div>

            <div className="create-actions-row">
                <button
                    className="btn-text-action"
                    onClick={handlePasteClipboard}
                    disabled={analyzing || showReview}
                    title="Paste from Clipboard"
                >
                    <Terminal size={14} /> Import from clipboard
                </button>

                <div className="spacer" />

                <button
                    onClick={onAnalyze}
                    disabled={analyzing || !code.trim() || showReview}
                    className="std-btn-primary btn-generate"
                >
                    {analyzing ? (
                        <>
                            <Loader size={16} className="spinning" /> Processing...
                        </>
                    ) : (
                        <>
                            <Sparkles size={16} /> Generate Details
                        </>
                    )}
                </button>
            </div>
            {!analyzing && !showReview && (
                <div className="keyboard-hint">Tip: Press Ctrl + Enter to generate</div>
            )}
        </div>
    );
}

export default CreateSnippetLeft;
