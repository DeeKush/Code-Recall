// ==========================================
// SNIPPET DETAIL COMPONENT (Day 4 + Day 6)
// ==========================================
// Split view with:
//   - Top: Code editor panel
//   - Bottom: Tabs (Details | AI Notes)
//   - Visualize opens in a fullscreen modal
// ==========================================

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { visualizeSnippet } from "../utils/visualizer";
import { generateVisualizerInputs } from "../utils/groq";
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
    BookOpen,
    Play,
    SkipBack,
    SkipForward,
    RotateCcw,
    Monitor,
    AlertCircle,
    Terminal,
    X
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

function SnippetDetail({ snippet, notesStatus, onRetryNotes }) {
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState("details");

    // === Visualizer state ===
    const [steps, setSteps] = useState([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [vizError, setVizError] = useState("");
    const [vizRunning, setVizRunning] = useState(false);
    const [dryRunInputs, setDryRunInputs] = useState(null);
    const [detectedLang, setDetectedLang] = useState("");
    const [vizModalOpen, setVizModalOpen] = useState(false);
    const [aiInputsFetched, setAiInputsFetched] = useState(false);

    // Reset AI inputs state when snippet changes
    useEffect(() => {
        setAiInputsFetched(false);
        setSteps([]);
        setVizError("");
        setDryRunInputs(null);
    }, [snippet?.id]);

    // Close modal with Escape key
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === "Escape") setVizModalOpen(false); };
        if (vizModalOpen) document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [vizModalOpen]);

    // Run visualization (unified)
    const handleRunVisualization = useCallback(() => {
        if (!snippet?.code) return;
        setVizError("");
        setVizRunning(true);
        setDryRunInputs(null);
        setDetectedLang("");
        try {
            const result = visualizeSnippet(snippet.code);
            setDetectedLang(result.language || "");
            if (result.dryRunInputs) {
                setDryRunInputs(result.dryRunInputs);
            }
            if (result.error) {
                setVizError(result.error === "__unsupported__"
                    ? "Only Java and C++ are supported for visualization right now. More languages are coming soon."
                    : "This snippet cannot be visualized yet.");
                setSteps([]);
            } else {
                setSteps(result.steps);
                setCurrentStepIndex(0);
            }
        } catch (err) {
            console.error("[VISUALIZER]", err.message);
            setVizError("This snippet cannot be visualized yet.");
            setSteps([]);
        } finally {
            setVizRunning(false);
        }
    }, [snippet?.code, aiInputsFetched]);

    // Enhanced visualization with AI inputs
    const handleRunVisualizationWithAI = useCallback(async () => {
        if (!snippet?.code) return;

        // 1. Run immediate visualization with defaults
        handleRunVisualization();

        // 2. If we haven't fetched AI inputs yet, try to get them
        if (!aiInputsFetched) {
            setAiInputsFetched(true); // Mark as fetched to prevent double-call
            try {
                // Determine language first (fast)
                const tempResult = visualizeSnippet(snippet.code);
                if (tempResult.error || tempResult.language === "unsupported") return;

                // Fetch smart inputs
                const smartInputs = await generateVisualizerInputs(snippet.code, tempResult.language);

                if (smartInputs) {
                    // Re-run with smart inputs
                    setVizRunning(true);
                    const result = visualizeSnippet(snippet.code, smartInputs);

                    if (!result.error) {
                        setSteps(result.steps);
                        setCurrentStepIndex(0);
                        if (result.dryRunInputs) {
                            setDryRunInputs(result.dryRunInputs);
                        }
                    }
                    setVizRunning(false);
                }
            } catch (err) {
                console.error("Failed to fetch smart inputs:", err);
            }
        }
    }, [snippet?.code, aiInputsFetched, handleRunVisualization]);

    // Open modal and auto-run
    const openVizModal = useCallback(() => {
        setVizModalOpen(true);
        if (snippet?.code) {
            // Use the enhanced runner
            setTimeout(() => handleRunVisualizationWithAI(), 100);
        }
    }, [snippet?.code, handleRunVisualizationWithAI]);

    // Step controls
    const handlePrevStep = () => setCurrentStepIndex(i => Math.max(0, i - 1));
    const handleNextStep = () => setCurrentStepIndex(i => Math.min(steps.length - 1, i + 1));
    const handleReset = () => setCurrentStepIndex(0);

    // Current step data
    const currentStep = steps[currentStepIndex] || null;

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

    const isGenerating = notesStatus === "generating";
    const isError = notesStatus === "error" || snippet.aiStatus === "failed";
    const hasNotes = notesStatus === "done" || (snippet.aiNotes && !isGenerating && !isError);

    return (
        <>
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
                            {isGenerating && <span className="tab-badge">...</span>}
                        </button>
                        <button
                            className="tab-btn tab-btn-viz"
                            onClick={openVizModal}
                            role="tab"
                        >
                            <Monitor size={16} />
                            <span>Visualize</span>
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
                                {isGenerating && (
                                    <div className="notes-loading">
                                        <div className="loading-spinner-small"></div>
                                        <span>Generating AI notes...</span>
                                    </div>
                                )}

                                {/* Failed state */}
                                {!isGenerating && isError && (
                                    <div className="notes-failed">
                                        <AlertTriangle size={20} />
                                        <div className="notes-failed-text">
                                            <span>AI notes failed to generate.</span>
                                            <p>There was an error generating notes for this snippet.</p>
                                        </div>
                                        {onRetryNotes && (
                                            <button
                                                className="btn-retry"
                                                onClick={() => onRetryNotes(snippet)}
                                            >
                                                <RefreshCw size={14} />
                                                Retry AI notes
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Success - Accordion sections */}
                                {!isGenerating && !isError && snippet.aiNotes && typeof snippet.aiNotes === "object" && (
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
                                {!isGenerating && !isError && !snippet.aiNotes && (
                                    <div className="notes-pending">
                                        <Sparkles size={24} className="pending-icon" />
                                        <span>AI notes not generated yet</span>
                                        {onRetryNotes && (
                                            <button
                                                className="btn-generate"
                                                onClick={() => onRetryNotes(snippet)}
                                            >
                                                <Sparkles size={14} />
                                                Generate AI notes
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Fallback for string notes */}
                                {!isGenerating && !isError && snippet.aiNotes && typeof snippet.aiNotes === "string" && (
                                    <div className="notes-text">
                                        <p>{snippet.aiNotes}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* ===== Visualizer Modal (portalled to body) ===== */}
            {vizModalOpen && createPortal(
                <div className="viz-modal-overlay" onClick={() => setVizModalOpen(false)}>
                    <div className="viz-modal" onClick={(e) => e.stopPropagation()}>
                        {/* Modal header */}
                        <div className="viz-modal-header">
                            <div className="viz-modal-title-row">
                                <Monitor size={20} />
                                <h2>Code Visualizer</h2>
                                {detectedLang && (
                                    <span className="viz-detected-lang">
                                        {detectedLang === "java" ? "Java" : "C++"}
                                    </span>
                                )}
                            </div>
                            <div className="viz-modal-actions">
                                <button
                                    className="btn-run-viz"
                                    onClick={handleRunVisualizationWithAI}
                                    disabled={vizRunning}
                                >
                                    <Play size={14} />
                                    {vizRunning ? "Running..." : "Re-run"}
                                </button>
                                <button className="viz-modal-close" onClick={() => setVizModalOpen(false)}>
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Dry-run inputs */}
                        {dryRunInputs && Object.keys(dryRunInputs).length > 0 && (
                            <div className="viz-dryrun-panel">
                                <span className="viz-dryrun-label">Dry-run inputs:</span>
                                <div className="viz-dryrun-values">
                                    {Object.entries(dryRunInputs).map(([name, display]) => (
                                        <span key={name} className="viz-var-chip">
                                            <span className="viz-var-name">{name}</span>
                                            <span className="viz-var-eq">=</span>
                                            <span className="viz-var-value">{display}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Error state */}
                        {vizError && (
                            <div className="viz-error">
                                <AlertCircle size={18} />
                                <span>{vizError}</span>
                            </div>
                        )}

                        {/* Modal body — two-column layout */}
                        {steps.length > 0 && !vizError && (
                            <div className="viz-modal-body">
                                {/* Left column: Code */}
                                <div className="viz-modal-code-col">
                                    <div className="viz-step-bar">
                                        <span className="viz-step-counter">
                                            Step {currentStepIndex + 1} / {steps.length}
                                        </span>
                                        <div className="viz-step-buttons">
                                            <button className="btn-step" onClick={handleReset} disabled={currentStepIndex === 0} title="Reset">
                                                <RotateCcw size={14} />
                                            </button>
                                            <button className="btn-step" onClick={handlePrevStep} disabled={currentStepIndex === 0} title="Previous">
                                                <SkipBack size={14} />
                                            </button>
                                            <button className="btn-step" onClick={handleNextStep} disabled={currentStepIndex === steps.length - 1} title="Next">
                                                <SkipForward size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="viz-code-panel">
                                        {snippet.code.split("\n").map((line, idx) => (
                                            <div
                                                key={idx}
                                                className={`viz-code-line ${currentStep && currentStep.line === idx + 1 ? "viz-line-active" : ""}`}
                                            >
                                                <span className="viz-line-num">{idx + 1}</span>
                                                <span className="viz-line-text">{line || " "}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right column: Execution State */}
                                <div className="viz-modal-state-col">
                                    {currentStep && (
                                        <>
                                            <h4 className="viz-state-title">Execution State</h4>

                                            {/* Variables */}
                                            {Object.keys(currentStep.variables).length > 0 && (
                                                <div className="viz-state-section">
                                                    <span className="viz-state-label">Variables</span>
                                                    <div className="viz-var-grid">
                                                        {Object.entries(currentStep.variables).map(([name, val]) => (
                                                            <div key={name} className="viz-var-chip">
                                                                <span className="viz-var-name">{name}</span>
                                                                <span className="viz-var-eq">=</span>
                                                                <span className="viz-var-value">
                                                                    {val && typeof val === "object" && val.value !== undefined ? val.value : val}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Arrays */}
                                            {Object.keys(currentStep.arrays).length > 0 && (
                                                <div className="viz-state-section">
                                                    <span className="viz-state-label">Arrays</span>
                                                    {Object.entries(currentStep.arrays).map(([name, values]) => (
                                                        <div key={name} className="viz-array-row">
                                                            <span className="viz-var-name">{name}</span>
                                                            <span className="viz-var-eq">=</span>
                                                            <div className="viz-array-cells">
                                                                {values.map((v, i) => (
                                                                    <span key={i} className="viz-array-cell">{v}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Output */}
                                            {currentStep.output && currentStep.output.length > 0 && (
                                                <div className="viz-state-section">
                                                    <span className="viz-state-label">
                                                        <Terminal size={14} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />
                                                        Output
                                                    </span>
                                                    <div className="viz-output-panel">
                                                        {currentStep.output.map((line, i) => (
                                                            <div key={i} className="viz-output-line">{line}</div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {!currentStep && (
                                        <div className="viz-empty" style={{ padding: '2rem' }}>
                                            <Monitor size={28} className="viz-empty-icon" />
                                            <p>Loading visualization...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Empty / initial state inside modal */}
                        {steps.length === 0 && !vizError && (
                            <div className="viz-empty" style={{ padding: '3rem' }}>
                                <Monitor size={40} className="viz-empty-icon" />
                                <p>Click <strong>Re-run</strong> to step through your code.</p>
                                <p className="viz-empty-hint">
                                    Learning visualizer — supports variables, loops, if/else, and simple arrays.
                                </p>
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

export default SnippetDetail;
