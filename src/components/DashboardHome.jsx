import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { generateSnippetMetadata } from "../utils/groq";
import HomeHeader from "./HomeHeader";
import RecentSnippetsStrip from "./RecentSnippetsStrip";
import RecallCTA from "./RecallCTA";
import CreateSnippetLeft from "./CreateSnippetLeft";
import CreateSnippetRight from "./CreateSnippetRight";

function DashboardHome({ onSnippetCreated, snippets, onNavigate }) {
    const { user } = useAuth();
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

    const updateData = (updates) => {
        setSnippetData(prev => ({ ...prev, ...updates }));
    };

    const handleCodeChange = (newCode) => {
        updateData({ code: newCode });
    };

    const handleMetadataChange = (updates) => {
        updateData(updates);
    };

    const handleAnalyze = async () => {
        if (!snippetData.code.trim()) {
            alert("Please paste some code.");
            return;
        }

        if (snippetData.code.trim().length < 20) {
            alert("Please enter more code (at least 20 characters).");
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
            updateData({ title: "", topic: "", tags: [] });
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
            setSnippetData({ code: "", title: "", topic: "", tags: [] });
            setShowReview(false);

            if (newId) {
                window.history.pushState(null, "", `/snippets?id=${newId}`);
                onNavigate("snippets");
            }
        } catch (error) {
            console.error("Failed to save snippet:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setShowReview(false);
    };

    const handleRecentSelect = (snippet) => {
        window.history.pushState(null, "", `/snippets?id=${snippet.id}`);
        onNavigate("snippets");
    };

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
