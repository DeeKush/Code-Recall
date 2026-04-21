import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getSnippets, saveSnippet, updateSnippetRecall, updateSnippetAI, updateSnippet, deleteSnippet } from "../utils/storage";
import { generateSnippetMetadata } from "../services/groqService";
import useSnippetAI from "../hooks/useSnippetAI";

import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import Loading from "../components/common/Loading";

// Components for different routes
import DashboardHome from "../components/DashboardHome";
import SnippetWorkspace from "../components/SnippetWorkspace";
import RecallMode from "../components/RecallMode";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import Settings from "../components/Settings";

/**
 * Main Dashboard Component.
 * Refactored to use React Router v6 for navigation.
 * Implements advanced hooks: useMemo, useCallback, and custom useSnippetAI.
 */
function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Custom hook for AI operations
    const { generateNote } = useSnippetAI();

    // -- State --
    const [snippets, setSnippets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDate, setFilterDate] = useState(null);
    const [notesStatus, setNotesStatus] = useState({}); // { [id]: "idle" | "generating" | "done" | "error" }

    // -- Section Mapping Logic (URL to UI) --
    const activeSection = useMemo(() => {
        const path = location.pathname.split("/").pop();
        // Handle variations like /analytics vs /dashboard
        if (path === "analytics") return "dashboard";
        return ["home", "snippets", "recall", "settings", "dashboard"].includes(path) ? path : "home";
    }, [location.pathname]);

    // -- Memoized Filter Logic --
    const filteredSnippets = useMemo(() => {
        let result = [...snippets];

        if (searchTerm) {
            const query = searchTerm.toLowerCase();
            result = result.filter(s => 
                (s.title || "").toLowerCase().includes(query) ||
                (s.topic || "").toLowerCase().includes(query) ||
                (s.tags || []).some(t => t.toLowerCase().includes(query)) ||
                (s.aiTags || []).some(t => t.toLowerCase().includes(query)) ||
                (s.code || "").toLowerCase().includes(query)
            );
        }

        if (filterDate) {
            result = result.filter(s => s.createdAtReadable?.includes(filterDate));
        }

        return result.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    }, [snippets, searchTerm, filterDate]);

    // -- Selected Snippet (from URL ID) --
    const selectedSnippet = useMemo(() => {
        const params = new URLSearchParams(location.search);
        const id = params.get("id");
        return snippets.find(s => s.id === id) || null;
    }, [snippets, location.search]);

    const showMobileDetail = useMemo(() => !!selectedSnippet, [selectedSnippet]);

    // -- Data Loading --
    useEffect(() => {
        if (!user) return;
        
        async function loadData() {
            setLoading(true);
            try {
                const data = await getSnippets(user.uid);
                setSnippets(data);
            } catch (err) {
                console.error("Dashboard Load Error:", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [user]);

    // -- Background AI Generation Logic --
    const triggerBackgroundAI = useCallback(async (snippet) => {
        setNotesStatus(prev => ({ ...prev, [snippet.id]: "generating" }));
        try {
            const notes = await generateNote(snippet.code, snippet.title, snippet.topic);
            if (notes) {
                await updateSnippetAI(user.uid, snippet.id, { aiNotes: notes }, "success");
                setSnippets(prev => prev.map(s => 
                    s.id === snippet.id ? { ...s, aiNotes: notes, aiStatus: "success" } : s
                ));
                setNotesStatus(prev => ({ ...prev, [snippet.id]: "done" }));
            }
        } catch (err) {
            console.error("AI Auto-gen Error:", err);
            setNotesStatus(prev => ({ ...prev, [snippet.id]: "error" }));
        }
    }, [user, generateNote]);

    // -- Interactive Handlers (Optimized) --

    const handleSectionChange = useCallback((section) => {
        // Map 'dashboard' back to 'analytics' if that's what the UI expects
        const path = section === "dashboard" ? "analytics" : section;
        navigate(`/dashboard/${path}`);
    }, [navigate]);

    const handleSelectSnippet = useCallback((id) => {
        navigate(`/dashboard/snippets?id=${id}`);
    }, [navigate]);

    const handleBackToMobileList = useCallback(() => {
        navigate('/dashboard/snippets');
    }, [navigate]);

    const handleSearch = useCallback((term) => {
        setSearchTerm(term);
        // If not on snippets/home, auto-switch to snippets for search results
        if (term && !["snippets", "home"].includes(activeSection)) {
            navigate("/dashboard/snippets");
        }
    }, [activeSection, navigate]);

    const toggleSidebar = useCallback(() => {
        setSidebarOpen(prev => !prev);
    }, []);

    const handleSnippetCreated = useCallback(async (data) => {
        if (!user) return null;
        try {
            const newSnippet = {
                ...data,
                userId: user.uid,
                createdAt: new Date(),
                recallCount: 0,
                understoodCount: 0,
                revisitCount: 0,
                recallStreak: 0,
                lastFeedback: null,
                aiStatus: "pending"
            };

            const docId = await saveSnippet(user.uid, newSnippet);
            const fullSnippet = { 
                ...newSnippet, 
                id: docId, 
                createdAtReadable: new Date().toLocaleDateString() + " (Today)" 
            };
            
            setSnippets(prev => [fullSnippet, ...prev]);
            triggerBackgroundAI(fullSnippet);
            return docId;
        } catch (err) {
            console.error("Create Error:", err);
            return null;
        }
    }, [user, triggerBackgroundAI]);

    const handleSnippetUpdate = useCallback(async (updatedSnippet) => {
        if (!user) return;
        try {
            const { id, ...data } = updatedSnippet;
            await updateSnippet(user.uid, id, data);
            setSnippets(prev => prev.map(s => s.id === id ? updatedSnippet : s));
        } catch (err) {
            console.error("Update Error:", err);
            throw err;
        }
    }, [user]);

    const handleSnippetDelete = useCallback(async (id) => {
        if (!user) return;
        try {
            await deleteSnippet(user.uid, id);
            setSnippets(prev => prev.filter(s => s.id !== id));
            navigate('/dashboard/snippets');
        } catch (err) {
            console.error("Delete Error:", err);
        }
    }, [user, navigate]);

    const handleOptimisticUpdate = useCallback((snippet) => {
        setSnippets(prev => prev.map(s => s.id === snippet.id ? snippet : s));
    }, []);

    return (
        <div className="app-layout">
            <Sidebar
                activeSection={activeSection}
                onSectionChange={handleSectionChange}
                isOpen={sidebarOpen}
                onToggle={toggleSidebar}
            />

            <div className="main-content">
                <TopBar
                    user={user}
                    onLogout={logout}
                    onMenuToggle={toggleSidebar}
                    searchTerm={searchTerm}
                    onSearchChange={handleSearch}
                    filterDate={filterDate || ""}
                    onFilterDateChange={setFilterDate}
                    hideSearch={activeSection !== "snippets" && activeSection !== "home"}
                />

                <Suspense fallback={<Loading />}>
                    <Routes>
                        <Route index element={<Navigate to="home" replace />} />
                        
                        <Route path="home" element={
                            <DashboardHome
                                snippets={snippets}
                                onSnippetCreated={handleSnippetCreated}
                                onNavigate={handleSectionChange}
                            />
                        } />
                        
                        <Route path="snippets" element={
                            <SnippetWorkspace
                                snippets={snippets}
                                filteredSnippets={filteredSnippets}
                                selectedSnippet={selectedSnippet}
                                loading={loading}
                                notesStatus={notesStatus}
                                showMobileDetail={showMobileDetail}
                                filterDate={filterDate}
                                onSelect={(s) => handleSelectSnippet(s.id)}
                                onRetryNotes={() => triggerBackgroundAI(selectedSnippet)}
                                onUpdate={handleSnippetUpdate}
                                onDelete={handleSnippetDelete}
                                onBackToMobileList={handleBackToMobileList}
                            />
                        } />
                        
                        <Route path="recall" element={
                            <RecallMode
                                snippets={snippets}
                                onNavigate={(target) => navigate(`/dashboard/${target}`)}
                                onUpdate={handleOptimisticUpdate}
                            />
                        } />
                        
                        <Route path="analytics" element={
                            <div className="section-content">
                                <AnalyticsDashboard snippets={snippets} />
                            </div>
                        } />
                        
                        <Route path="settings" element={
                            <div className="section-content">
                                <Settings user={user} onLogout={logout} />
                            </div>
                        } />
                        
                        {/* Legacy path support */}
                        <Route path="dashboard" element={<Navigate to="../analytics" replace />} />
                        <Route path="*" element={<Navigate to="home" replace />} />
                    </Routes>
                </Suspense>
            </div>
        </div>
    );
}

export default Dashboard;
