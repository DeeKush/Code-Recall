import { useState } from "react";
import SnippetForm from "./SnippetForm";
import { saveSnippet } from "../utils/storage";
import { useAuth } from "../context/AuthContext";

function DashboardHome({ onSnippetCreated }) {
    const { user } = useAuth();
    const [saving, setSaving] = useState(false);

    // Hoisted State for Form
    const [snippetData, setSnippetData] = useState({
        code: "",
        title: "",
        topic: "",
        tags: []
    });

    // Handle updates from SnippetForm
    const handleFormChange = (updates) => {
        setSnippetData(prev => ({ ...prev, ...updates }));
    };

    // Handle Save
    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            // Save to DB
            const newSnippet = await saveSnippet(user.uid, snippetData);

            // Optimistic / Post-save handling
            onSnippetCreated(newSnippet);

            // Reset form
            setSnippetData({ code: "", title: "", topic: "", tags: [] });
        } catch (error) {
            console.error("Failed to save snippet:", error);
            alert("Failed to save. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="home-create-page">
            <div className="home-create-container">
                <div className="panel-card" style={{ height: 'auto', minHeight: '100%' }}>
                    <SnippetForm
                        code={snippetData.code}
                        title={snippetData.title}
                        topic={snippetData.topic}
                        tags={snippetData.tags}
                        onChange={handleFormChange}
                        onSave={handleSave}
                        saving={saving}
                    />
                </div>
            </div>
        </div>
    );
}

export default DashboardHome;
