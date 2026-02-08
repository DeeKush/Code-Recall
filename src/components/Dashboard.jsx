// ==========================================
// DASHBOARD COMPONENT (Day 3 - Review Flow)
// ==========================================
// Handles snippet management with:
//   - Review-before-save flow (form handles metadata)
//   - Background notes generation
//   - Per-snippet loading states
// ==========================================

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getSnippets, saveSnippet, updateSnippetAI } from "../utils/storage";
import { generateSnippetNotes } from "../utils/groq";
import SnippetForm from "./SnippetForm";
import SnippetList from "./SnippetList";
import SnippetDetail from "./SnippetDetail";

function Dashboard() {
    const { user, logout } = useAuth();

    // Snippets state
    const [snippets, setSnippets] = useState([]);
    const [selectedSnippet, setSelectedSnippet] = useState(null);

    // Loading states
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Per-snippet notes generation tracking
    const [generatingNotesById, setGeneratingNotesById] = useState({});

    // Search and filter
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDate, setFilterDate] = useState("");

    // Load snippets on mount
    useEffect(() => {
        async function loadSnippets() {
            if (user) {
                setLoading(true);
                try {
                    const userSnippets = await getSnippets(user.uid);
                    setSnippets(userSnippets);
                } catch (error) {
                    console.error("Error loading snippets:", error);
                } finally {
                    setLoading(false);
                }
            }
        }
        loadSnippets();
    }, [user]);

    // ==========================================
    // Save snippet (form already has metadata)
    // ==========================================
    async function handleSaveSnippet(snippetData) {
        setSaving(true);
        let savedSnippet = null;

        try {
            // Save snippet with reviewed metadata
            console.log("[DASHBOARD] Saving snippet...");
            savedSnippet = await saveSnippet(user.uid, {
                code: snippetData.code,
                title: snippetData.title,
                topic: snippetData.topic,
                tags: snippetData.tags,      // User-edited tags
                aiTags: snippetData.tags     // Store same as aiTags for now
            });

            console.log("[DASHBOARD] Snippet saved:", savedSnippet.id);

            // Update UI immediately
            setSnippets([savedSnippet, ...snippets]);
            setSelectedSnippet(savedSnippet);

        } catch (error) {
            console.error("[DASHBOARD] Save failed:", error);
            alert("Failed to save snippet. Please try again.");
            setSaving(false);
            return;
        }

        setSaving(false);

        // ----------------------------------------
        // Background: Generate notes
        // ----------------------------------------
        setGeneratingNotesById(prev => ({ ...prev, [savedSnippet.id]: true }));

        try {
            console.log("[DASHBOARD] Generating notes...");
            const notesData = await generateSnippetNotes(snippetData.code);

            await updateSnippetAI(user.uid, savedSnippet.id, notesData, "success");

            const updatedSnippet = {
                ...savedSnippet,
                aiNotes: notesData.aiNotes,
                aiStatus: "success"
            };

            setSnippets(prev => prev.map(s =>
                s.id === savedSnippet.id ? updatedSnippet : s
            ));

            setSelectedSnippet(prev =>
                prev?.id === savedSnippet.id ? updatedSnippet : prev
            );

            console.log("[DASHBOARD] Notes saved!");

        } catch (error) {
            console.error("[DASHBOARD] Notes failed:", error.message);

            try {
                await updateSnippetAI(user.uid, savedSnippet.id, null, "failed");

                const failedSnippet = { ...savedSnippet, aiStatus: "failed" };
                setSnippets(prev => prev.map(s =>
                    s.id === savedSnippet.id ? failedSnippet : s
                ));
                setSelectedSnippet(prev =>
                    prev?.id === savedSnippet.id ? failedSnippet : prev
                );
            } catch (updateError) {
                console.error("[DASHBOARD] Status update failed:", updateError);
            }

        } finally {
            setGeneratingNotesById(prev => {
                const newState = { ...prev };
                delete newState[savedSnippet.id];
                return newState;
            });
        }
    }

    // Select a snippet
    function handleSelectSnippet(snippet) {
        setSelectedSnippet(snippet);
    }

    // Retry notes generation
    async function handleRetryNotes(snippet) {
        if (generatingNotesById[snippet.id]) return;

        setGeneratingNotesById(prev => ({ ...prev, [snippet.id]: true }));

        try {
            const notesData = await generateSnippetNotes(snippet.code);
            await updateSnippetAI(user.uid, snippet.id, notesData, "success");

            const updatedSnippet = {
                ...snippet,
                aiNotes: notesData.aiNotes,
                aiStatus: "success"
            };

            setSnippets(prev => prev.map(s =>
                s.id === snippet.id ? updatedSnippet : s
            ));
            setSelectedSnippet(updatedSnippet);

        } catch (error) {
            console.error("[DASHBOARD] Retry failed:", error.message);
            try {
                await updateSnippetAI(user.uid, snippet.id, null, "failed");
            } catch (updateError) {
                console.error("[DASHBOARD] Status update failed:", updateError);
            }

        } finally {
            setGeneratingNotesById(prev => {
                const newState = { ...prev };
                delete newState[snippet.id];
                return newState;
            });
        }
    }

    // Filter snippets
    const filteredSnippets = snippets.filter((snippet) => {
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            const matchesTitle = snippet.title?.toLowerCase().includes(term);
            const matchesTopic = snippet.topic?.toLowerCase().includes(term);
            const matchesCode = snippet.code?.toLowerCase().includes(term);
            const matchesTags = snippet.tags?.some(tag =>
                tag.toLowerCase().includes(term)
            );
            const matchesAiTags = snippet.aiTags?.some(tag =>
                tag.toLowerCase().includes(term)
            );

            if (!matchesTitle && !matchesTopic && !matchesCode && !matchesTags && !matchesAiTags) {
                return false;
            }
        }

        if (filterDate) {
            const snippetDate = snippet.createdAtReadable?.split(" ")[0];
            if (snippetDate !== filterDate) {
                return false;
            }
        }

        return true;
    });

    // Check if generating notes for a snippet
    function isGeneratingNotes(snippetId) {
        return generatingNotesById[snippetId] === true;
    }

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h1>Code Recall</h1>
                <div className="header-right">
                    <span className="user-email">{user.email}</span>
                    <button onClick={logout} className="btn-secondary">Logout</button>
                </div>
            </header>

            <div className="search-filter-bar">
                <div className="search-input-wrapper">
                    <input
                        type="text"
                        placeholder="Search snippets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="date-filter-wrapper">
                    <label htmlFor="dateFilter">Filter by date:</label>
                    <input
                        type="date"
                        id="dateFilter"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="date-input"
                    />
                    {filterDate && (
                        <button
                            onClick={() => setFilterDate("")}
                            className="btn-clear"
                            title="Clear date filter"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            <main className="dashboard-main">
                <section className="dashboard-form">
                    <SnippetForm onSave={handleSaveSnippet} saving={saving} />
                </section>

                <section className="dashboard-list">
                    {filterDate && (
                        <p className="filter-hint">Showing snippets from: {filterDate}</p>
                    )}
                    <SnippetList
                        snippets={filteredSnippets}
                        selectedId={selectedSnippet?.id}
                        onSelect={handleSelectSnippet}
                        loading={loading}
                    />
                </section>

                <section className="dashboard-detail">
                    <SnippetDetail
                        snippet={selectedSnippet}
                        generatingNotes={selectedSnippet ? isGeneratingNotes(selectedSnippet.id) : false}
                        onRetryNotes={handleRetryNotes}
                    />
                </section>
            </main>
        </div>
    );
}

export default Dashboard;
