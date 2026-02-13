// ==========================================
// RECALL MODE COMPONENT (Day 7 - Spaced Repetition V2)
// ==========================================
// The primary learning engine with Spaced Repetition Logic.
// V2 Features: Strict Layout, Date-Aware Algo, Session Boundary.
// ==========================================

import { useState, useMemo, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Sparkles, BookOpen, ChevronDown, ChevronRight, Info, Eye, EyeOff, CheckCircle, RotateCcw, Lock, Trophy, Clock, AlertCircle, Zap, Target, AlertTriangle, Monitor, HardDrive, RefreshCw } from "lucide-react";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/prism";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { updateSnippetRecall, updateSnippetAI } from "../utils/storage";
import { generateSnippetNotes } from "../utils/groq";
import { useAuth } from "../context/AuthContext";

// Local Component: Read-Only Queue Card (Lightweight)
function RecallQueueCard({ snippet, isActive, onClick }) {
    const dateStr = snippet.createdAtReadable ? snippet.createdAtReadable.split(" ")[0] : "New";

    return (
        <div
            className={`recall-queue-card ${isActive ? "active" : ""}`}
            onClick={onClick}
        >
            <div className="recall-card-header">
                <span className="recall-card-topic">{snippet.topic || "No Topic"}</span>
                <span className="recall-card-date">{dateStr}</span>
            </div>
            <h4 className="recall-card-title">{snippet.title || "Untitled Snippet"}</h4>

            <div className="recall-card-footer">
                {snippet.recallStreak > 0 && (
                    <span className="recall-streak-badge">
                        <Trophy size={12} /> {snippet.recallStreak}
                    </span>
                )}
                {snippet.lastFeedback === "revisit" && (
                    <span className="recall-status-revisit">
                        <RotateCcw size={12} /> Revisit
                    </span>
                )}
            </div>
        </div>
    );
}

// Local Component: Accordion for AI Notes
function NoteAccordion({ title, content, icon: Icon, defaultOpen = false }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    // If content is missing, don't render
    if (!content) return null;

    return (
        <div className={`note-accordion ai-note-block`}>
            <button
                className={`accordion-header ${isOpen ? "open" : ""}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="accordion-title-row">
                    {Icon && <Icon size={18} className="accordion-icon" />}
                    <span>{title}</span>
                </div>
                {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {isOpen && (
                <div className="accordion-content">
                    <div className="markdown-body">
                        <ReactMarkdown>
                            {Array.isArray(content) ? content.join('\n') : (typeof content === 'string' ? content : String(content || ''))}
                        </ReactMarkdown>
                    </div>
                </div>
            )}
        </div>
    );
}

function RecallMode({ snippets = [], onNavigate }) {
    const { user } = useAuth();

    // State
    const [recallQueue, setRecallQueue] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [isCodeRevealed, setIsCodeRevealed] = useState(false);
    const [statsSaving, setStatsSaving] = useState(false);
    const [generatingNotes, setGeneratingNotes] = useState(false);

    // Derived: Current Active Snippet
    const currentSnippet = useMemo(() =>
        recallQueue.find(s => s.id === selectedId),
        [recallQueue, selectedId]);

    // Derived: Session Stats (Persisted via Snippets)
    const reviewedTodayCount = useMemo(() => {
        if (!snippets.length) return 0;
        const now = new Date();
        const todayStr = now.toDateString();
        return snippets.filter(s => {
            if (!s.lastRecalledAt?.seconds) return false;
            const d = new Date(s.lastRecalledAt.seconds * 1000);
            return d.toDateString() === todayStr;
        }).length;
    }, [snippets]);

    // -------------------------------------------
    // 1. ALGORITHM: Build Queue on Mount
    // -------------------------------------------
    useEffect(() => {
        if (!snippets || snippets.length === 0) return;

        const now = new Date();
        const todayStr = now.toDateString();

        // 1. Exclude reviewed TODAY
        const eligible = snippets.filter(s => {
            if (!s.lastRecalledAt?.seconds) return true; // Never recalled = Eligible

            const lastDate = new Date(s.lastRecalledAt.seconds * 1000);
            const lastDateStr = lastDate.toDateString();

            return lastDateStr !== todayStr;
        });

        // 2. Prioritize (Calculate Scores)
        const scored = eligible.map(s => {
            let daysSince = 0;

            // A. Days Since Last Review
            if (!s.lastRecalledAt?.seconds) {
                // NEVER reviewed -> Treat as very old (High Priority)
                daysSince = 999;
            } else {
                const lastDate = new Date(s.lastRecalledAt.seconds * 1000);
                const diffTime = Math.abs(now - lastDate);
                daysSince = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            }

            // B. Stats
            const revisitCount = s.revisitCount || 0;
            const understoodCount = s.understoodCount || 0;

            // C. FORMULA
            // Score = (daysSince * 2) + (revisitCount * 2) - understoodCount
            // Logic: 
            // - Old items (high days) -> Boost
            // - Hard items (high revisit) -> Boost
            // - Mastered items (high understood) -> Penalty
            let priority = (daysSince * 2) + (revisitCount * 2) - understoodCount;

            return { ...s, selectionPriority: priority };
        });

        // Sort by Priority Descending
        scored.sort((a, b) => b.selectionPriority - a.selectionPriority);

        // 3. Select Top 10
        // We pick top 10 regardless of topic diversity for now to ensure "hardest" come first
        // But we can add a slight diversity check if needed later.
        const selected = scored.slice(0, 10);

        setRecallQueue(selected);

        if (selected.length > 0) {
            setSelectedId(selected[0].id);
        }

    }, [snippets]);

    // -------------------------------------------
    // 2. ACTIONS
    // -------------------------------------------
    const handleSelect = (id) => {
        setSelectedId(id);
        setIsCodeRevealed(false);
    };

    const handleFeedback = async (isUnderstood) => {
        if (!currentSnippet || !user) return;

        setStatsSaving(true);
        const snippetId = currentSnippet.id;

        try {
            // 1. Persist to DB
            await updateSnippetRecall(user.uid, snippetId, isUnderstood);

            // 2. Remove from Local Queue
            setRecallQueue(prev => prev.filter(s => s.id !== snippetId));

            // 3. Select Next
            const nextQueue = recallQueue.filter(s => s.id !== snippetId);
            if (nextQueue.length > 0) {
                setSelectedId(nextQueue[0].id);
            } else {
                setSelectedId(null);
            }

            setIsCodeRevealed(false);

        } catch (error) {
            console.error("Feedback failed:", error);
            alert("Failed to save progress. Please try again.");
        } finally {
            setStatsSaving(false);
        }
    };

    const handleGenerateNotes = async () => {
        if (!currentSnippet || !user) return;
        setGeneratingNotes(true);

        try {
            const notesData = await generateSnippetNotes(
                currentSnippet.code,
                currentSnippet.title,
                currentSnippet.topic
            );

            // Save to DB
            await updateSnippetAI(user.uid, currentSnippet.id, notesData, "success");

            // Update local state by forcing a re-render or updating current object
            // Ideally parent updates snippets, but for now we hack it locally?
            // Actually, `snippets` prop will update if Dashboard updates.
            // But we need to update `recallQueue` too.
            const updatedSnippet = { ...currentSnippet, aiNotes: notesData.aiNotes, aiStatus: "success" };

            setRecallQueue(prev => prev.map(s => s.id === currentSnippet.id ? updatedSnippet : s));

        } catch (error) {
            console.error("Failed to generate notes:", error);
            alert("Failed to generate notes. " + error.message);
        } finally {
            setGeneratingNotes(false);
        }
    };

    // -------------------------------------------
    // 3. HELPER: Note Sections Configuration
    // -------------------------------------------
    const NOTE_SECTIONS = [
        { key: "problem", title: "Problem Statement", icon: AlertCircle, defaultOpen: true },
        { key: "intuition", title: "Intuition", icon: Zap, defaultOpen: true },
        { key: "approach", title: "Approach", icon: Target, defaultOpen: true },
        { key: "timeComplexity", title: "Time Complexity", icon: Clock },
        { key: "spaceComplexity", title: "Space Complexity", icon: HardDrive },
        { key: "edgeCases", title: "Edge Cases", icon: AlertTriangle }
    ];

    // -------------------------------------------
    // 4. RENDER: COMPLETION VIEW
    // -------------------------------------------
    if (recallQueue.length === 0) {
        if (snippets.length === 0) {
            return (
                <div className="recall-completion-view">
                    <div className="completion-card">
                        <Info size={48} className="completion-icon" />
                        <h2>No Snippets Yet</h2>
                        <p>Create some snippets to start recalling.</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="recall-completion-view">
                <div className="completion-card">
                    <CheckCircle size={64} className="completion-icon" />
                    <h2>You are done for today!</h2>
                    <p>You've reviewed your active recall queue.</p>

                    <div className="completion-stats">
                        <div className="stat-box">
                            <span className="stat-val">{reviewedTodayCount}</span>
                            <span className="stat-label">Reviewed Today</span>
                        </div>
                    </div>

                    <button
                        className="std-btn-primary"
                        onClick={() => onNavigate ? onNavigate("snippets") : window.history.back()}
                    >
                        Return to Snippets
                    </button>
                </div>
            </div>
        );
    }

    // CHECK FOR NOTES EXISTENCE
    const hasNotes = currentSnippet && currentSnippet.aiNotes && (
        currentSnippet.aiNotes.problem ||
        currentSnippet.aiNotes.intuition ||
        currentSnippet.aiNotes.approach ||
        currentSnippet.aiNotes.explanation
    );

    // -------------------------------------------
    // 5. RENDER: MAIN LAYOUT
    // -------------------------------------------
    return (
        <div className="recall-page">
            {/* Left Panel: Queue */}
            <div className="recall-queue-panel">
                <div className="panel-header">
                    <h3>Recall Queue</h3>
                    <span className="queue-count">{recallQueue.length}</span>
                </div>
                <div className="queue-list">
                    {recallQueue.map(item => (
                        <RecallQueueCard
                            key={item.id}
                            snippet={item}
                            isActive={item.id === selectedId}
                            onClick={() => handleSelect(item.id)}
                        />
                    ))}
                </div>
            </div>

            {/* Right Panel: Workspace */}
            <div className="recall-workspace">
                {currentSnippet ? (
                    <div className="workspace-container">
                        {/* Header */}
                        <div className="recall-header">
                            <div className="recall-meta-row">
                                <span className="recall-topic-badge">{currentSnippet.topic}</span>
                                <span className="recall-date">
                                    <Clock size={12} /> {currentSnippet.createdAtReadable}
                                </span>
                            </div>
                            <h1 className="recall-title">{currentSnippet.title}</h1>

                            {/* Tags */}
                            <div className="tag-row" style={{ marginTop: '0.5rem' }}>
                                {currentSnippet.tags?.map(t => (
                                    <span key={t} className="snippet-tag tag-user">{t}</span>
                                ))}
                                {currentSnippet.aiTags?.map(t => (
                                    <span key={t} className="snippet-tag tag-ai"><Sparkles size={10} />{t}</span>
                                ))}
                            </div>
                        </div>

                        {/* Content: AI Notes or CTA */}
                        <div className="recall-notes-section">
                            {hasNotes ? (
                                <>
                                    {NOTE_SECTIONS.map(section => {
                                        const content = currentSnippet.aiNotes[section.key];
                                        if (content) {
                                            return (
                                                <NoteAccordion
                                                    key={section.key}
                                                    title={section.title}
                                                    content={content}
                                                    icon={section.icon}
                                                    defaultOpen={section.defaultOpen}
                                                />
                                            );
                                        }
                                        return null;
                                    })}

                                    {/* Legacy Fallback */}
                                    {!currentSnippet.aiNotes.problem && currentSnippet.aiNotes.explanation && (
                                        <NoteAccordion
                                            title="Explanation"
                                            content={currentSnippet.aiNotes.explanation}
                                            icon={BookOpen}
                                            defaultOpen={true}
                                        />
                                    )}
                                </>
                            ) : (
                                <div className="no-notes-cta">
                                    <div className="cta-content">
                                        <Sparkles size={32} className="cta-icon" />
                                        <h3>Missing AI Notes</h3>
                                        <p>This snippet doesn't have AI notes yet. Generate them to enable effective recall.</p>
                                        <button
                                            className="std-btn-primary"
                                            onClick={handleGenerateNotes}
                                            disabled={generatingNotes}
                                        >
                                            {generatingNotes ? (
                                                <><RefreshCw className="spinning" size={16} /> Generating...</>
                                            ) : (
                                                <><Sparkles size={16} /> Generate Notes</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Code Section (Hidden by Default) */}
                        <div className="recall-code-section">
                            {!isCodeRevealed ? (
                                <div className="code-blur-overlay">
                                    <div className="blur-content">
                                        <Lock size={32} className="lock-icon" />
                                        <p>Try to recall the code implementation.</p>
                                        <button
                                            className="std-btn-primary reveal-btn"
                                            onClick={() => setIsCodeRevealed(true)}
                                            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                                        >
                                            <Eye size={16} /> Reveal Code
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="code-revealed-container">
                                    <div className="code-actions-bar">
                                        <span className="label">Implementation</span>
                                        <button
                                            className="std-btn-outline"
                                            onClick={() => setIsCodeRevealed(false)}
                                        >
                                            <EyeOff size={14} /> Hide
                                        </button>
                                    </div>
                                    <SyntaxHighlighter
                                        language="javascript"
                                        style={vscDarkPlus}
                                        showLineNumbers={true}
                                        customStyle={{ margin: 0, borderRadius: '8px', fontSize: '0.9rem' }}
                                    >
                                        {currentSnippet.code}
                                    </SyntaxHighlighter>
                                </div>
                            )}
                        </div>

                        {/* Feedback Actions */}
                        <div className="recall-actions-footer">
                            <p className="feedback-prompt">How well did you recall this?</p>
                            <div className="feedback-buttons">
                                <button
                                    className="recall-btn btn-revisit"
                                    onClick={() => handleFeedback(false)}
                                    disabled={statsSaving}
                                >
                                    <RotateCcw size={18} /> Revisit Later
                                </button>
                                <button
                                    className="recall-btn btn-understood"
                                    onClick={() => handleFeedback(true)}
                                    disabled={statsSaving}
                                >
                                    <CheckCircle size={18} /> I Understood
                                </button>
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="empty-selection">
                        <p>Select a snippet to start recalling.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RecallMode;
