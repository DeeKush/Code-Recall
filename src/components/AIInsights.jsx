// ==========================================
// AI INSIGHTS COMPONENT (Day 7)
// ==========================================
// Lightweight AI chat page where users can
// ask questions about a selected snippet.
// ==========================================

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, MessageSquare, ChevronDown, Loader2 } from "lucide-react";
import { askSnippetQuestion } from "../utils/groq";

function AIInsights({ snippets = [] }) {
    const [selectedSnippetId, setSelectedSnippetId] = useState("");
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const selectedSnippet = snippets.find(s => s.id === selectedSnippetId) || null;

    async function handleSend() {
        const question = input.trim();
        if (!question || !selectedSnippet || loading) return;

        // Add user message
        const userMsg = { role: "user", text: question };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const answer = await askSnippetQuestion(selectedSnippet, question);
            setMessages(prev => [...prev, { role: "assistant", text: answer }]);
        } catch (err) {
            setMessages(prev => [...prev, {
                role: "assistant",
                text: "Sorry, I couldn't process that request. Please try again.",
                isError: true
            }]);
        } finally {
            setLoading(false);
        }
    }

    function handleKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    return (
        <div className="ai-insights-page">
            {/* Header */}
            <div className="insights-header">
                <div className="insights-title-row">
                    <MessageSquare size={24} />
                    <h2>AI Insights</h2>
                </div>
                <p className="insights-subtitle">
                    Ask questions about your code snippets. Get explanations, optimization tips, and approach verification.
                </p>
            </div>

            {/* Snippet selector */}
            <div className="insights-selector">
                <label htmlFor="snippet-select">Select a snippet</label>
                <div className="select-wrapper">
                    <select
                        id="snippet-select"
                        value={selectedSnippetId}
                        onChange={(e) => {
                            setSelectedSnippetId(e.target.value);
                            setMessages([]);
                        }}
                    >
                        <option value="">— Choose a snippet —</option>
                        {snippets.map(s => (
                            <option key={s.id} value={s.id}>
                                {s.title || "Untitled"} — {s.topic || "No topic"}
                            </option>
                        ))}
                    </select>
                    <ChevronDown size={16} className="select-chevron" />
                </div>
            </div>

            {/* Chat area */}
            <div className="insights-chat">
                {!selectedSnippet ? (
                    <div className="insights-empty">
                        <Bot size={48} />
                        <p>Select a snippet above to start asking questions</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="insights-empty">
                        <Bot size={48} />
                        <p>Ask anything about <strong>{selectedSnippet.title || "this snippet"}</strong></p>
                        <div className="suggestion-chips">
                            {["Explain the approach", "What's the time complexity?", "How can I optimize this?", "What edge cases should I handle?"].map((q, i) => (
                                <button
                                    key={i}
                                    className="suggestion-chip"
                                    onClick={() => setInput(q)}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="insights-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`chat-message ${msg.role}`}>
                                <div className="message-avatar">
                                    {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                <div className={`message-bubble ${msg.isError ? "error" : ""}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="chat-message assistant">
                                <div className="message-avatar">
                                    <Bot size={16} />
                                </div>
                                <div className="message-bubble thinking">
                                    <Loader2 size={16} className="spin" />
                                    <span>Thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                )}
            </div>

            {/* Input area */}
            {selectedSnippet && (
                <div className="insights-input-area">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about this snippet..."
                        rows={1}
                        disabled={loading}
                    />
                    <button
                        className="send-btn"
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        aria-label="Send message"
                    >
                        <Send size={18} />
                    </button>
                </div>
            )}
        </div>
    );
}

export default AIInsights;
