// ==========================================
// SNIPPET PREVIEW CARD (Dashboard Home)
// ==========================================
// A read-only preview that mirrors SnippetDetail.
// Updates in real-time as user types in the form.
// ==========================================

import { Tag, Code2, Hash, FileText } from "lucide-react";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/prism";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

function SnippetPreviewCard({ title, topic, tags, code, language = "javascript" }) {

    const isEmpty = !title && !topic && (!tags || tags.length === 0) && !code;

    if (isEmpty) {
        return (
            <div className="preview-card-empty">
                <div className="preview-empty-content">
                    <FileText size={48} className="text-muted mb-4" />
                    <h3>Snippet Preview</h3>
                    <p>Start writing on the left to see how your snippet will look.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="snippet-card-dark" style={{ cursor: 'default', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Title Row */}
            <div className="card-title-row" style={{ marginBottom: '0.5rem' }}>
                <Code2 size={18} className="card-icon" />
                <span className="card-title" style={{ fontSize: '1.1rem' }}>
                    {title || "Untitled Snippet"}
                </span>
            </div>

            {/* Topic Badge */}
            <div className="card-topic" style={{ marginBottom: '1rem' }}>
                {topic || "No topic"}
            </div>

            {/* Tags */}
            {tags && tags.length > 0 && (
                <div className="card-tags" style={{ marginBottom: '1rem' }}>
                    <Tag size={12} className="tag-icon" />
                    {tags.map((tag, index) => (
                        <span key={index} className="tag-chip-dark">
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Code Block */}
            <div className="card-preview" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    {language}
                </div>
                <div style={{ flex: 1, overflow: 'auto', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <SyntaxHighlighter
                        language={language.toLowerCase()}
                        style={vscDarkPlus}
                        customStyle={{ margin: 0, padding: '1rem', fontSize: "13px", minHeight: "100%" }}
                    >
                        {code || "// Code will appear here..."}
                    </SyntaxHighlighter>
                </div>
            </div>
        </div>
    );
}

export default SnippetPreviewCard;
