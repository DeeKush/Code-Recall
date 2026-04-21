import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { generateSnippetMetadata } from "../services/groqService";
import HomeHeader from "./HomeHeader";
import RecentSnippetsStrip from "./RecentSnippetsStrip";
import RecallCTA from "./RecallCTA";
import CreateSnippetLeft from "./CreateSnippetLeft";
import CreateSnippetRight from "./CreateSnippetRight";

/**
 * DashboardHome Component - The 'Create' area of the dashboard.
 * Refactored for clean routing and better state management.
 */
function DashboardHome({ onSnippetCreated, snippets, onNavigate }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [showReview, setShowReview] = useState(false);

    // State for Form
    const [snippetData, setSnippetData] = useState({
        code: "",
        title: "",
        topic: "",
        tags: []
    });

    const updateData = useCallback((updates) => {
        setSnippetData(prev => ({ ...prev, ...updates }));
    }, []);

    const handleCodeChange = useCallback((newCode) => {
        updateData({ code: newCode });
    }, [updateData]);

    const handleMetadataChange = useCallback((updates) => {
        updateData(updates);
    }, [updateData]);

    const handleAnalyze = async () => {
        if (!snippetData.code.trim() || snippetData.code.trim().length < 20) {
            alert("Please enter more code (at least 20 characters) for better analysis.");
            return;
        }

        setAnalyzing(true);
        try {
            const metadata = await generateSnippetMetadata(snippetData.code);
            updateData({
                title: metadata.title || "",
                topic: metadata.topic || "",
                tags: metadata.aiTags || []
            });
            setShowReview(true);
        } catch (error) {
            console.error("Analysis failed:", error);
            setShowReview(true);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            const newId = await onSnippetCreated(snippetData);
            if (newId) {
                // Navigate to snippets view with the new snippet selected
                navigate(`/dashboard/snippets?id=${newId}`);
            }
            setSnippetData({ code: "", title: "", topic: "", tags: [] });
            setShowReview(false);
        } catch (error) {
            console.error("Save Error:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = useCallback(() => {
        setShowReview(false);
    }, []);

    const handleRecentSelect = useCallback((snippet) => {
        navigate(`/dashboard/snippets?id=${snippet.id}`);
    }, [navigate]);

    return (
        <div className="home-dashboard-container">
            {/* 1. Header (Welcome + Streak) */}
            <HomeHeader user={user} snippets={snippets} />

            {/* 2. Creation Area (2 Columns) */}
            <div className="home-main-layout">
                {/* Left: Code Input (40%) */}
                <div className="home-left-pane">
                    <CreateSnippetLeft
                        code={snippetData.code}
                        onChange={handleCodeChange}
                        onAnalyze={handleAnalyze}
                        analyzing={analyzing}
                        showReview={showReview}
                    />
                </div>

                {/* Right: Preview (60%) - NOTE: RecallCTA removed from here */}
                <div className="home-right-pane">
                    <CreateSnippetRight
                        title={snippetData.title}
                        topic={snippetData.topic}
                        tags={snippetData.tags}
                        onChange={handleMetadataChange}
                        showReview={showReview}
                        onSave={handleSave}
                        onCancel={handleCancel}
                        saving={saving}
                    // recallCTA prop removed as it's now separate
                    />
                </div>
            </div>

            {/* 3. Hero Recall CTA (Full Width) */}
            <RecallCTA snippets={snippets} onNavigate={onNavigate} />

            {/* 4. Recent Strip */}
            <RecentSnippetsStrip snippets={snippets} onSelect={handleRecentSelect} />
        </div>
    );
}

export default DashboardHome;
