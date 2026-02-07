// ==========================================
// DASHBOARD COMPONENT (Day 2 Update)
// ==========================================
// Main screen with search, date filtering, and snippets management.
// NEW: Search by text, filter by date, loading states
// ==========================================

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getSnippets, saveSnippet } from "../utils/storage";
import SnippetForm from "./SnippetForm";
import SnippetList from "./SnippetList";
import SnippetDetail from "./SnippetDetail";

function Dashboard() {
    // Get auth data from our AuthContext
    const { user, logout } = useAuth();

    // State for managing snippets
    const [snippets, setSnippets] = useState([]);
    const [selectedSnippet, setSelectedSnippet] = useState(null);

    // NEW: Loading and saving states
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // NEW: Search and filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDate, setFilterDate] = useState("");

    // Load snippets when the component mounts
    useEffect(() => {
        async function loadSnippets() {
            if (user) {
                setLoading(true);
                try {
                    // Fetch snippets from Firestore (now async)
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

    // Handle saving a new snippet
    async function handleSaveSnippet(snippetData) {
        setSaving(true);
        try {
            // Save to Firestore and get the new snippet with ID
            const newSnippet = await saveSnippet(user.uid, snippetData);

            // Update our state to include the new snippet (newest first)
            setSnippets([newSnippet, ...snippets]);

            // Automatically select the new snippet
            setSelectedSnippet(newSnippet);
        } catch (error) {
            console.error("Error saving snippet:", error);
            alert("Failed to save snippet. Please try again.");
        } finally {
            setSaving(false);
        }
    }

    // Handle clicking on a snippet in the list
    function handleSelectSnippet(snippet) {
        setSelectedSnippet(snippet);
    }

    // ==========================================
    // NEW: Filter snippets based on search and date
    // ==========================================
    const filteredSnippets = snippets.filter((snippet) => {
        // --- Text search filter ---
        // Check if search term matches title, topic, code, or tags
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            const matchesTitle = snippet.title.toLowerCase().includes(term);
            const matchesTopic = snippet.topic.toLowerCase().includes(term);
            const matchesCode = snippet.code.toLowerCase().includes(term);
            // Check if any tag matches
            const matchesTags = snippet.tags?.some(tag =>
                tag.toLowerCase().includes(term)
            );

            // If none match, exclude this snippet
            if (!matchesTitle && !matchesTopic && !matchesCode && !matchesTags) {
                return false;
            }
        }

        // --- Date filter ---
        // Check if snippet was created on the selected date
        if (filterDate) {
            // Get the date portion from createdAtReadable (format: "YYYY-MM-DD HH:MM")
            const snippetDate = snippet.createdAtReadable?.split(" ")[0];
            if (snippetDate !== filterDate) {
                return false;
            }
        }

        return true;
    });

    return (
        <div className="dashboard">
            {/* Header with app title and logout button */}
            <header className="dashboard-header">
                <h1>Code Recall</h1>
                <div className="header-right">
                    <span className="user-email">{user.email}</span>
                    <button onClick={logout} className="btn-secondary">
                        Logout
                    </button>
                </div>
            </header>

            {/* NEW: Search and Filter Bar */}
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
                    {/* Clear date filter button */}
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

            {/* Main content area with 3 sections */}
            <main className="dashboard-main">
                {/* Left section: Create new snippet form */}
                <section className="dashboard-form">
                    <SnippetForm onSave={handleSaveSnippet} saving={saving} />
                </section>

                {/* Middle section: List of all snippets */}
                <section className="dashboard-list">
                    {/* Show hint when date filter is applied */}
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

                {/* Right section: Detail view of selected snippet */}
                <section className="dashboard-detail">
                    <SnippetDetail snippet={selectedSnippet} />
                </section>
            </main>
        </div>
    );
}

export default Dashboard;
