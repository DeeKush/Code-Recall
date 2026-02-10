// ==========================================
// DASHBOARD COMPONENT (Day 4 - Dark Dashboard)
// ==========================================
// Main dashboard with:
//   - Sidebar navigation
//   - TopBar with search
//   - 3-pane layout: list | detail | form
// ==========================================

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getSnippets, saveSnippet, updateSnippetAI } from "../utils/storage";
import { generateSnippetNotes } from "../utils/groq";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
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


    // Per-snippet notes state (transient)
    // { [snippetId]: "idle" | "generating" | "done" | "error" }
    const [notesStatus, setNotesStatus] = useState({});

    // Search and filter
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDate, setFilterDate] = useState("");

    // Sidebar state
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("dashboard");

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
                tags: snippetData.tags,
                aiTags: snippetData.tags
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
        // ----------------------------------------
        // Background: Generate notes
        // ----------------------------------------
        setNotesStatus(prev => ({ ...prev, [savedSnippet.id]: "generating" }));

        try {
            console.log("[DASHBOARD] Generating notes...");
            const notesData = await generateSnippetNotes(
                snippetData.code,
                snippetData.title,
                snippetData.topic
            );

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

            setNotesStatus(prev => ({ ...prev, [savedSnippet.id]: "done" }));
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

            setNotesStatus(prev => ({ ...prev, [savedSnippet.id]: "error" }));

        }
    }

    // Select a snippet
    function handleSelectSnippet(snippet) {
        setSelectedSnippet(snippet);
    }

    // Retry notes generation
    async function handleRetryNotes(snippet) {
        if (notesStatus[snippet.id] === "generating") return;

        setNotesStatus(prev => ({ ...prev, [snippet.id]: "generating" }));

        try {
            const notesData = await generateSnippetNotes(
                snippet.code,
                snippet.title,
                snippet.topic
            );
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

            setNotesStatus(prev => ({ ...prev, [snippet.id]: "done" }));

        } catch (error) {
            console.error("[DASHBOARD] Retry failed:", error.message);
            try {
                await updateSnippetAI(user.uid, snippet.id, null, "failed");

                // Update local state to reflect failure
                const failedSnippet = { ...snippet, aiStatus: "failed" };
                setSnippets(prev => prev.map(s =>
                    s.id === snippet.id ? failedSnippet : s
                ));
                setSelectedSnippet(failedSnippet);

            } catch (updateError) {
                console.error("[DASHBOARD] Status update failed:", updateError);
            }

            setNotesStatus(prev => ({ ...prev, [snippet.id]: "error" }));
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



    // Toggle sidebar
    function toggleSidebar() {
        setSidebarOpen(!sidebarOpen);
    }

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <Sidebar
                activeSection={activeSection}
                onSectionChange={setActiveSection}
                isOpen={sidebarOpen}
                onToggle={toggleSidebar}
            />

            {/* Main content area */}
            <div className="main-content">
                {/* Top bar */}
                <TopBar
                    user={user}
                    onLogout={logout}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    filterDate={filterDate}
                    onFilterDateChange={setFilterDate}
                    onMenuToggle={toggleSidebar}
                />

                {/* Dashboard content - 3 pane layout */}
                <main className="dashboard-content">
                    {/* Left pane - Snippet list */}
                    <section className="pane pane-list">
                        <div className="pane-header">
                            <h2>Snippets</h2>
                            <span className="snippet-count">{filteredSnippets.length}</span>
                        </div>
                        {filterDate && (
                            <p className="filter-hint-dark">Filtering: {filterDate}</p>
                        )}
                        <SnippetList
                            snippets={filteredSnippets}
                            selectedId={selectedSnippet?.id}
                            onSelect={handleSelectSnippet}
                            loading={loading}
                        />
                    </section>

                    {/* Center pane - Snippet detail */}
                    <section className="pane pane-detail">
                        <SnippetDetail
                            snippet={selectedSnippet}
                            notesStatus={selectedSnippet ? (notesStatus[selectedSnippet.id] || "idle") : "idle"}
                            onRetryNotes={handleRetryNotes}
                        />
                    </section>

                    {/* Right pane - Snippet form */}
                    <section className="pane pane-form">
                        <SnippetForm onSave={handleSaveSnippet} saving={saving} />
                    </section>
                </main>
            </div>
        </div>
    );
}

export default Dashboard;
