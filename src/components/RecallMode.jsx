import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Info, CheckCircle } from "lucide-react";
import { updateSnippetRecall, updateSnippetAI } from "../utils/storage";
import { generateSnippetNotes } from "../services/groqService";
import { useAuth } from "../context/AuthContext";
import RecallQueue from "./RecallQueue";
import RecallWorkspace from "./RecallWorkspace";

/**
 * RecallMode Component - Refactored for decomposition and optimization.
 * Manages the Spaced Repetition logic and orchestrates sub-components.
 */
function RecallMode({ snippets = [], onNavigate, onUpdate }) {
    const { user } = useAuth();

    // -- State --
    const [recallQueue, setRecallQueue] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [isCodeRevealed, setIsCodeRevealed] = useState(false);
    const [statsSaving, setStatsSaving] = useState(false);
    const [generatingNotes, setGeneratingNotes] = useState(false);

    // -- Derived: Current Active Snippet (Optimized with useMemo) --
    const currentSnippet = useMemo(() =>
        recallQueue.find(s => s.id === selectedId),
        [recallQueue, selectedId]);

    // -- Derived: Session Stats (Optimized with useMemo) --
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

    // -- Effect: Build Queue on Mount --
    useEffect(() => {
        if (!snippets || snippets.length === 0) return;

        const now = new Date();
        const todayStr = now.toDateString();

        // 1. Exclude reviewed TODAY
        const eligible = snippets.filter(s => {
            if (!s.lastRecalledAt?.seconds) return true;
            const lastDate = new Date(s.lastRecalledAt.seconds * 1000);
            const lastDateStr = lastDate.toDateString();
            return lastDateStr !== todayStr;
        });

        // 2. Prioritize Logic
        const scored = eligible.map(s => {
            let daysSince = 0;
            if (!s.lastRecalledAt?.seconds) {
                daysSince = 999;
            } else {
                const lastDate = new Date(s.lastRecalledAt.seconds * 1000);
                const diffTime = Math.abs(now - lastDate);
                daysSince = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            }
            const priority = (daysSince * 2) + (s.revisitCount || 0) * 2 - (s.understoodCount || 0);
            return { ...s, selectionPriority: priority };
        });

        // Sort and select top 10
        scored.sort((a, b) => b.selectionPriority - a.selectionPriority);
        const selected = scored.slice(0, 10);

        setRecallQueue(selected);
        if (selected.length > 0) {
            setSelectedId(selected[0].id);
        }
    }, [snippets]);

    // -- Handlers (Optimized with useCallback) --
    
    const handleSelect = useCallback((id) => {
        setSelectedId(id);
        setIsCodeRevealed(false);
    }, []);

    const handleToggleReveal = useCallback((reveal) => {
        setIsCodeRevealed(reveal);
    }, []);

    const handleFeedback = useCallback(async (isUnderstood) => {
        if (!currentSnippet || !user) return;

        setStatsSaving(true);
        const snippetId = currentSnippet.id;

        try {
            await updateSnippetRecall(user.uid, snippetId, isUnderstood);

            const nowSeconds = Math.floor(Date.now() / 1000);
            const optimisticSnippet = {
                ...currentSnippet,
                lastRecalledAt: { seconds: nowSeconds },
                lastFeedback: isUnderstood ? "understood" : "revisit",
                recallStreak: isUnderstood ? (currentSnippet.recallStreak || 0) + 1 : 0,
                recallCount: (currentSnippet.recallCount || 0) + 1
            };

            if (onUpdate) onUpdate(optimisticSnippet);

            // Update local state queue
            setRecallQueue(prev => {
                const nextQueue = prev.filter(s => s.id !== snippetId);
                // Auto-select next item if available
                if (nextQueue.length > 0 && selectedId === snippetId) {
                    setSelectedId(nextQueue[0].id);
                } else if (nextQueue.length === 0) {
                    setSelectedId(null);
                }
                return nextQueue;
            });

            setIsCodeRevealed(false);

        } catch (error) {
            console.error("[Recall Feedback Error]", error);
            alert("Failed to save progress. Please try again.");
        } finally {
            setStatsSaving(false);
        }
    }, [currentSnippet, user, onUpdate, selectedId]);

    const handleGenerateNotes = useCallback(async () => {
        if (!currentSnippet || !user) return;
        setGeneratingNotes(true);

        try {
            const notesData = await generateSnippetNotes(
                currentSnippet.code,
                currentSnippet.title,
                currentSnippet.topic
            );

            await updateSnippetAI(user.uid, currentSnippet.id, notesData, "success");

            const updatedSnippet = { 
                ...currentSnippet, 
                aiNotes: notesData.aiNotes, 
                aiStatus: "success" 
            };

            setRecallQueue(prev => 
                prev.map(s => s.id === currentSnippet.id ? updatedSnippet : s)
            );

        } catch (error) {
            console.error("[Recall Notes Error]", error);
            alert("Failed to generate notes: " + error.message);
        } finally {
            setGeneratingNotes(false);
        }
    }, [currentSnippet, user]);

    // -- Completion View --
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
                        onClick={() => onNavigate("snippets")}
                    >
                        Return to Snippets
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="recall-page">
            <RecallQueue 
                queue={recallQueue} 
                selectedId={selectedId} 
                onSelect={handleSelect} 
            />
            
            <RecallWorkspace 
                snippet={currentSnippet}
                isCodeRevealed={isCodeRevealed}
                onToggleReveal={handleToggleReveal}
                onFeedback={handleFeedback}
                onGenerateNotes={handleGenerateNotes}
                generatingNotes={generatingNotes}
                statsSaving={statsSaving}
            />
        </div>
    );
}

export default RecallMode;

