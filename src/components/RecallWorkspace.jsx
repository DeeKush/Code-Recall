import React, { useState } from 'react';
import ReactMarkdown from "react-markdown";
import { 
  Sparkles, 
  BookOpen, 
  ChevronDown, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  RotateCcw, 
  Lock, 
  Clock, 
  AlertCircle, 
  Zap, 
  Target, 
  AlertTriangle, 
  HardDrive, 
  RefreshCw 
} from "lucide-react";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/prism";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

/**
 * Accordion component for AI notes within the workspace.
 */
const NoteAccordion = ({ title, content, icon: Icon, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!content) return null;

  return (
    <div className={`note-accordion ai-note-block`}>
      <button
        className={`accordion-header ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
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
};

const NOTE_SECTIONS = [
  { key: "problem", title: "Problem Statement", icon: AlertCircle, defaultOpen: true },
  { key: "intuition", title: "Intuition", icon: Zap, defaultOpen: true },
  { key: "approach", title: "Approach", icon: Target, defaultOpen: true },
  { key: "timeComplexity", title: "Time Complexity", icon: Clock },
  { key: "spaceComplexity", title: "Space Complexity", icon: HardDrive },
  { key: "edgeCases", title: "Edge Cases", icon: AlertTriangle }
];

/**
 * The main interactive area for Recall Mode.
 */
const RecallWorkspace = ({ 
  snippet, 
  isCodeRevealed, 
  onToggleReveal, 
  onFeedback, 
  onGenerateNotes, 
  generatingNotes, 
  statsSaving 
}) => {
  if (!snippet) {
    return (
      <div className="empty-selection">
        <p>Select a snippet to start recalling.</p>
      </div>
    );
  }

  const hasNotes = snippet.aiNotes && (
    snippet.aiNotes.problem ||
    snippet.aiNotes.intuition ||
    snippet.aiNotes.approach ||
    snippet.aiNotes.explanation
  );

  return (
    <div className="recall-workspace">
      <div className="workspace-container">
        {/* Header */}
        <div className="recall-header">
          <div className="recall-meta-row">
            <span className="recall-topic-badge">{snippet.topic}</span>
            <span className="recall-date">
              <Clock size={12} /> {snippet.createdAtReadable}
            </span>
          </div>
          <h1 className="recall-title">{snippet.title}</h1>

          {/* Tags */}
          <div className="tag-row" style={{ marginTop: '0.5rem' }}>
            {snippet.tags?.map(t => (
              <span key={t} className="snippet-tag tag-user">{t}</span>
            ))}
            {snippet.aiTags?.map(t => (
              <span key={t} className="snippet-tag tag-ai"><Sparkles size={10} />{t}</span>
            ))}
          </div>
        </div>

        {/* Content: AI Notes or CTA */}
        <div className="recall-notes-section">
          {hasNotes ? (
            <>
              {NOTE_SECTIONS.map(section => {
                const content = snippet.aiNotes[section.key];
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
              {!snippet.aiNotes.problem && snippet.aiNotes.explanation && (
                <NoteAccordion
                  title="Explanation"
                  content={snippet.aiNotes.explanation}
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
                  onClick={onGenerateNotes}
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
                  onClick={() => onToggleReveal(true)}
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
                  onClick={() => onToggleReveal(false)}
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
                {snippet.code}
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
              onClick={() => onFeedback(false)}
              disabled={statsSaving}
            >
              <RotateCcw size={18} /> Revisit Later
            </button>
            <button
              className="recall-btn btn-understood"
              onClick={() => onFeedback(true)}
              disabled={statsSaving}
            >
              <CheckCircle size={18} /> I Understood
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecallWorkspace;
