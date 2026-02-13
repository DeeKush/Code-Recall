// ==========================================
// AI CLIENT (Day 5 - Multi-Key Fallback)
// ==========================================
// Handles AI calls for:
//   1. Generating snippet metadata (title, topic, tags)
//   2. Generating detailed notes (explanation, complexity, etc.)
//
// Cascading fallback:
//   Groq Key 1 → Groq Key 2 → Groq Key 3 → OpenRouter → Error
//
// Features:
//   - 15s Timeout on all calls
//   - Automatic key rotation on failure
//   - Clean error handling
// ==========================================

// --- API Configuration ---
const GROQ_KEYS = [
    import.meta.env.VITE_GROQ_API_KEY,
    import.meta.env.VITE_GROQ_API_KEY_2,
    import.meta.env.VITE_GROQ_API_KEY_3,
].filter(Boolean); // Remove undefined/empty keys

const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "meta-llama/llama-3.3-70b-instruct";

const TIMEOUT_MS = 15000;


// --- Helpers ---

function timeout(ms) {
    return new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms);
    });
}

/**
 * Make a single API call to Groq with a specific key.
 */
async function callGroqWithKey(messages, apiKey) {
    const fetchPromise = fetch(GROQ_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages,
            temperature: 0.5,
            response_format: { type: "json_object" }
        })
    });

    const response = await Promise.race([fetchPromise, timeout(TIMEOUT_MS)]);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    if (!content) throw new Error("Groq returned empty response");

    return JSON.parse(content);
}

/**
 * Make a single API call to OpenRouter.
 */
async function callOpenRouter(messages) {
    if (!OPENROUTER_KEY) throw new Error("No OpenRouter API key configured");

    const fetchPromise = fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENROUTER_KEY}`,
            "HTTP-Referer": window.location.origin,
            "X-Title": "Code Recall"
        },
        body: JSON.stringify({
            model: OPENROUTER_MODEL,
            messages,
            temperature: 0.5,
            response_format: { type: "json_object" }
        })
    });

    const response = await Promise.race([fetchPromise, timeout(TIMEOUT_MS)]);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    if (!content) throw new Error("OpenRouter returned empty response");

    return JSON.parse(content);
}

/**
 * Cascading AI call: tries each Groq key, then OpenRouter, then throws.
 */
async function callAI(messages) {
    const errors = [];

    // 1. Try each Groq key
    for (let i = 0; i < GROQ_KEYS.length; i++) {
        try {
            // console.log(`[AI] Trying Groq key ${i + 1}/${GROQ_KEYS.length}...`);
            return await callGroqWithKey(messages, GROQ_KEYS[i]);
        } catch (err) {
            console.warn(`[AI] Groq key ${i + 1} failed: ${err.message}`);
            errors.push(`Groq[${i + 1}]: ${err.message}`);
        }
    }

    // 2. Try OpenRouter
    if (OPENROUTER_KEY) {
        try {
            console.log("[AI] All Groq keys failed. Trying OpenRouter...");
            return await callOpenRouter(messages);
        } catch (err) {
            console.warn(`[AI] OpenRouter failed: ${err.message}`);
            errors.push(`OpenRouter: ${err.message}`);
        }
    }

    // 3. All providers failed
    throw new Error(`All AI providers failed.\n${errors.join("\n")}`);
}


// --- Public API ---

/**
 * 1. Generate Snippet Metadata (Step 1)
 * Returns: { title, topic, aiTags: [] }
 */
export async function generateSnippetMetadata(code) {
    if (GROQ_KEYS.length === 0 && !OPENROUTER_KEY) {
        throw new Error("No API keys configured. Add VITE_GROQ_API_KEY or VITE_OPENROUTER_API_KEY to .env");
    }

    const prompt = `
    Analyze this code snippet.
    Return a strictly valid JSON object (no markdown, no extra text) with:
    - title: A short, descriptive title (max 6 words)
    - topic: The main programming concept or algorithm (e.g., "Binary Search", "React Hooks")
    - aiTags: Array of 3-5 relevant keywords/tags

    Code:
    ${code.slice(0, 2000)}
    `;

    return callAI([
        { role: "system", content: "You are a helpful coding assistant. You strictly output JSON." },
        { role: "user", content: prompt }
    ]);
}

/**
 * 2. Generate Snippet Notes (Step 2 / Background)
 * Returns: { aiNotes: { ... } }
 */
export async function generateSnippetNotes(code, title = "", topic = "") {
    if (GROQ_KEYS.length === 0 && !OPENROUTER_KEY) {
        throw new Error("No API keys configured. Add VITE_GROQ_API_KEY or VITE_OPENROUTER_API_KEY to .env");
    }

    const prompt = `
    Explain this code snippet titled "${title}" (Topic: ${topic}).
    Return a strictly valid JSON object (no markdown) with a key "aiNotes" containing an object with these exact keys:
    - problem: What problem does this solve?
    - intuition: The core idea/insight.
    - approach: High-level strategy.
    - algorithmSteps: Step-by-step logic.
    - timeComplexity: Big O analysis.
    - spaceComplexity: Memory usage analysis.
    - edgeCases: What to watch out for.
    - whenToUse: Best scenarios for this pattern.

    Code:
    ${code.slice(0, 2000)}
    `;

    return callAI([
        { role: "system", content: "You are an expert developer. You explain code clearly. You strictly output JSON." },
        { role: "user", content: prompt }
    ]);
}
/**
 * 3. Generate Visualizer Inputs (Day 6 Extension)
 * Returns: { inputs: { varName: value, ... } }
 */
export async function generateVisualizerInputs(code, language = "java") {
    if (GROQ_KEYS.length === 0 && !OPENROUTER_KEY) return null;

    const prompt = `
    Analyze this ${language} code.
    Identify the entry function and its parameters.
    Generate a SINGLE best test case to demonstrate the logic (e.g., an interesting edge case or typical usage).
    Return a strictly valid JSON object (no markdown) with a key "inputs" containing parameter names and values.

    Example:
    Code: int binarySearch(int[] arr, int target)
    Output: { "inputs": { "arr": [1, 3, 5, 7, 9], "target": 5 } }

    Code:
    ${code.slice(0, 2000)}
    `;

    try {
        const result = await callAI([
            { role: "system", content: "You are a QA engineer. You generate meaningful test cases. You strictly output JSON." },
            { role: "user", content: prompt }
        ]);
        return result.inputs || null;
    } catch (err) {
        console.warn("[AI] Failed to generate inputs:", err);
        return null;
    }
}

/**
 * 4. Ask a question about a snippet (Day 7 - AI Insights Chat)
 * Returns: plain text answer (not JSON)
 */
export async function askSnippetQuestion(snippet, question) {
    if (GROQ_KEYS.length === 0 && !OPENROUTER_KEY) {
        throw new Error("No API keys configured.");
    }

    const context = [
        `Title: ${snippet.title || "Untitled"}`,
        `Topic: ${snippet.topic || "Unknown"}`,
        `Code:\n${(snippet.code || "").slice(0, 2000)}`,
        snippet.aiNotes ? `AI Notes:\n${JSON.stringify(snippet.aiNotes, null, 2).slice(0, 1000)}` : ""
    ].filter(Boolean).join("\n\n");

    const systemPrompt = `You are a competitive programming tutor and code mentor.
You help students understand code, verify approaches, explain logic, identify edge cases, and suggest optimizations.
Be concise but thorough. Use examples when helpful. Format with markdown.`;

    const userPrompt = `Here is the snippet context:\n\n${context}\n\nStudent question: ${question}`;

    // For chat we need plain text, not JSON — call Groq directly
    const errors = [];

    for (let i = 0; i < GROQ_KEYS.length; i++) {
        try {
            const res = await Promise.race([
                fetch(GROQ_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${GROQ_KEYS[i]}`
                    },
                    body: JSON.stringify({
                        model: GROQ_MODEL,
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: userPrompt }
                        ],
                        temperature: 0.7
                    })
                }),
                timeout(TIMEOUT_MS)
            ]);
            if (!res.ok) throw new Error(`Groq ${res.status}`);
            const data = await res.json();
            return data.choices[0]?.message?.content || "No response.";
        } catch (err) {
            errors.push(err.message);
        }
    }

    if (OPENROUTER_KEY) {
        try {
            const res = await Promise.race([
                fetch(OPENROUTER_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${OPENROUTER_KEY}`,
                        "HTTP-Referer": window.location.origin,
                        "X-Title": "Code Recall"
                    },
                    body: JSON.stringify({
                        model: OPENROUTER_MODEL,
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: userPrompt }
                        ],
                        temperature: 0.7
                    })
                }),
                timeout(TIMEOUT_MS)
            ]);
            if (!res.ok) throw new Error(`OpenRouter ${res.status}`);
            const data = await res.json();
            return data.choices[0]?.message?.content || "No response.";
        } catch (err) {
            errors.push(err.message);
        }
    }

    throw new Error(`All AI providers failed.\n${errors.join("\n")}`);
}
