// ==========================================
// SNIPPET DETAIL COMPONENT (Day 4 - Tabbed Layout)
// ==========================================
// Split view with:
//   - Top: Code editor panel
//   - Bottom: Tabs (Details | AI Notes)
// ==========================================

import { useState } from "react";
import {
    Copy,
    Check,
    FileCode,
    Tag,
    Sparkles,
    RefreshCw,
    ChevronDown,
    ChevronRight,
    Target,
    Lightbulb,
    Wrench,
    ListOrdered,
    Clock,
    HardDrive,
    AlertTriangle,
    Key,
    Calendar,
    Info,
    BookOpen
} from "lucide-react";

// Collapsible accordion component with description
function AccordionSection({ title, description, icon: Icon, children, defaultOpen = false }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={`accordion-card ${isOpen ? "open" : ""}`}>
            <button
                className="accordion-header"
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                aria-expanded={isOpen}
            >
                <div className="accordion-title-group">
                    <Icon size={18} className="accordion-icon" />
                    <div className="accordion-text">
                        <span className="accordion-title">{title}</span>
                        {description && !isOpen && (
                            <span className="accordion-desc">{description}</span>
                        )}
                    </div>
                </div>
                {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
            {isOpen && (
                <div className="accordion-content">
                    {children}
                </div>
            )}
        </div>
    );
}

function SnippetDetail({ snippet, generatingNotes, onRetryNotes }) {
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState("details");

    function handleCopyCode() {
        if (snippet?.code) {
            navigator.clipboard.writeText(snippet.code)
                .then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                })
                .catch((err) => console.error("Failed to copy:", err));
        }
    }

    // Empty state - no snippet selected
    if (!snippet) {
        return (
            <div className="detail-empty">
                <FileCode size={56} className="empty-icon" />
                <p className="empty-title">No snippet selected</p>
                <p className="empty-subtitle">Select a snippet from the list to view its code and AI notes</p>
            </div>
        );
    }

    // AI notes sections config
    const noteSections = [
        { key: "problem", title: "Problem", desc: "What is being solved", icon: Target, open: true },
        { key: "intuition", title: "Intuition", desc: "The key insight", icon: Lightbulb, open: true },
        { key: "approach", title: "Approach", desc: "Strategy used", icon: Wrench },
        { key: "algorithmSteps", title: "Algorithm Steps", desc: "Step-by-step breakdown", icon: ListOrdered },
        { key: "timeComplexity", title: "Time Complexity", desc: "Big O analysis", icon: Clock },
        { key: "spaceComplexity", title: "Space Complexity", desc: "Memory usage", icon: HardDrive },
        { key: "edgeCases", title: "Edge Cases", desc: "Corner cases to consider", icon: AlertTriangle },
        { key: "whenToUse", title: "When To Use", desc: "Applicable scenarios", icon: Key }
    ];

    return (
        <div className="snippet-detail-tabbed">
            {/* Top section - Code panel */}
            <section className="detail-code-section">
                <div className="code-panel-header">
                    <div className="code-title-row">
                        <FileCode size={18} className="code-title-icon" />
                        <h2 className="code-title">{snippet.title || "Untitled"}</h2>
                    </div>
                    <button
                        className="btn-copy"
                        onClick={handleCopyCode}
                        title="Copy code"
                    >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                </div>
                <pre className="code-display">
                    <code>{snippet.code}</code>
                </pre>
            </section>

            {/* Bottom section - Tabs */}
            <section className="detail-tabs-section">
                {/* Tab headers */}
                <div className="tabs-header" role="tablist">
                    <button
                        className={`tab-btn ${activeTab === "details" ? "active" : ""}`}
                        onClick={() => setActiveTab("details")}
                        role="tab"
                        aria-selected={activeTab === "details"}
                    >
                        <Info size={16} />
                        <span>Details</span>
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "notes" ? "active" : ""}`}
                        onClick={() => setActiveTab("notes")}
                        role="tab"
                        aria-selected={activeTab === "notes"}
                    >
                        <BookOpen size={16} />
                        <span>AI Notes</span>
                        {generatingNotes && <span className="tab-badge">...</span>}
                    </button>
                </div>

                {/* Tab content */}
                <div className="tab-content" role="tabpanel">
                    {/* Details Tab */}
                    {activeTab === "details" && (
                        <div className="details-tab">
                            {/* Topic */}
                            <div className="detail-field">
                                <label className="field-label">Topic</label>
                                <div className="field-value topic-badge">
                                    {snippet.topic || "No topic"}
                                </div>
                            </div>

                            {/* Date */}
                            <div className="detail-field">
                                <label className="field-label">Created</label>
                                <div className="field-value">
                                    <Calendar size={14} />
                                    <span>{snippet.createdAtReadable || "Unknown"}</span>
                                </div>
                            </div>

                            {/* AI Tags */}
                            {snippet.aiTags && snippet.aiTags.length > 0 && (
                                <div className="detail-field">
                                    <label className="field-label">
                                        <Sparkles size={12} />
                                        AI Tags
                                    </label>
                                    <div className="tags-display">
                                        {snippet.aiTags.map((tag, i) => (
                                            <span key={i} className="tag-ai">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* User Tags */}
                            {snippet.tags && snippet.tags.length > 0 && (
                                <div className="detail-field">
                                    <label className="field-label">
                                        <Tag size={12} />
                                        Tags
                                    </label>
                                    <div className="tags-display">
                                        {snippet.tags
                                            .filter(t => !snippet.aiTags?.includes(t))
                                            .map((tag, i) => (
                                                <span key={i} className="tag-user">{tag}</span>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* AI Notes Tab */}
                    {activeTab === "notes" && (
                        <div className="notes-tab">
                            {/* Loading state */}
                            {generatingNotes && (
                                <div className="notes-loading">
                                    <div className="loading-spinner-small"></div>
                                    <span>Generating AI notes...</span>
                                </div>
                            )}

                            {/* Failed state */}
                            {!generatingNotes && snippet.aiStatus === "failed" && (
                                <div className="notes-failed">
                                    <AlertTriangle size={20} />
                                    <div className="notes-failed-text">
                                        <span>AI notes generation failed</span>
                                        <p>There was an error generating notes for this snippet.</p>
                                    </div>
                                    {onRetryNotes && (
                                        <button
                                            className="btn-retry"
                                            onClick={() => onRetryNotes(snippet)}
                                        >
                                            <RefreshCw size={14} />
                                            Retry
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Success - Accordion sections */}
                            {!generatingNotes && snippet.aiNotes && typeof snippet.aiNotes === "object" && (
                                <div className="notes-accordion-list">
                                    {noteSections.map((section) => {
                                        const content = snippet.aiNotes[section.key];
                                        if (!content) return null;

                                        return (
                                            <AccordionSection
                                                key={section.key}
                                                title={section.title}
                                                description={section.desc}
                                                icon={section.icon}
                                                defaultOpen={section.open}
                                            >
                                                <p>{content}</p>
                                            </AccordionSection>
                                        );
                                    })}
                                </div>
                            )}

                            {/* No notes yet */}
                            {!generatingNotes && !snippet.aiStatus && !snippet.aiNotes && (
                                <div className="notes-pending">
                                    <Sparkles size={24} className="pending-icon" />
                                    <span>AI notes not generated yet</span>
                                    {onRetryNotes && (
                                        <button
                                            className="btn-generate"
                                            onClick={() => onRetryNotes(snippet)}
                                        >
                                            <Sparkles size={14} />
                                            Generate Notes
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Fallback for string notes */}
                            {!generatingNotes && snippet.aiNotes && typeof snippet.aiNotes === "string" && (
                                <div className="notes-text">
                                    <p>{snippet.aiNotes}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

export default SnippetDetail;
