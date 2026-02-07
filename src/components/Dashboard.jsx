// ==========================================
// DASHBOARD COMPONENT
// ==========================================
// The main screen users see after logging in.
// Contains:
// - Header with logout button
// - Form to create new snippets
// - List of saved snippets
// - Detail view for selected snippet
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

    // Load snippets when the component mounts (first renders)
    useEffect(() => {
        if (user) {
            // Get this user's snippets from localStorage
            const userSnippets = getSnippets(user.uid);
            setSnippets(userSnippets);
        }
    }, [user]); // Re-run if user changes

    // Handle saving a new snippet
    function handleSaveSnippet(snippetData) {
        // Save to localStorage and get the new snippet with ID
        const newSnippet = saveSnippet(user.uid, snippetData);

        // Update our state to include the new snippet
        // We add it at the beginning so it appears first in the list
        setSnippets([newSnippet, ...snippets]);

        // Automatically select the new snippet to show it
        setSelectedSnippet(newSnippet);
    }

    // Handle clicking on a snippet in the list
    function handleSelectSnippet(snippet) {
        setSelectedSnippet(snippet);
    }

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

            {/* Main content area with 3 sections */}
            <main className="dashboard-main">
                {/* Left section: Create new snippet form */}
                <section className="dashboard-form">
                    <SnippetForm onSave={handleSaveSnippet} />
                </section>

                {/* Middle section: List of all snippets */}
                <section className="dashboard-list">
                    <SnippetList
                        snippets={snippets}
                        selectedId={selectedSnippet?.id}
                        onSelect={handleSelectSnippet}
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
