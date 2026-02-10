// ==========================================
// GROQ AI CLIENT (Day 5 - Reliability Update)
// ==========================================
// Handles interactions with Groq API for:
//   1. Generating snippet metadata (title, topic, tags)
//   2. Generating detailed notes (explanation, complexity, etc.)
//
// Updates:
//   - 15s Timeout on all calls
//   - 1 Retry logic for transient failures
//   - Clean error handling (no silent failures)
// ==========================================

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama3-70b-8192";

/**
 * Helper: Timeout Promise
 * Rejects if the operation takes longer than ms
 */
function timeout(ms) {
    return new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms);
    });
}

/**
 * Helper: Retry Logic
 * Retries the async operation once if it fails
 */
async function withRetry(fn, retries = 1) {
    try {
        return await fn();
    } catch (error) {
        if (retries > 0) {
            console.warn(`[Groq] Call failed, retrying... (${retries} left). Error: ${error.message}`);
            return await withRetry(fn, retries - 1);
        }
        throw error;
    }
}

/**
 * Helper: Make Groq API Call
 * Wraps fetch with timeout and standard headers
 */
async function callGroq(messages) {
    // 15 seconds strict timeout
    const TIMEOUT_MS = 15000;

    const fetchPromise = fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: MODEL,
            messages: messages,
            temperature: 0.5,
            response_format: { type: "json_object" }
        })
    });

    const response = await Promise.race([
        fetchPromise,
        timeout(TIMEOUT_MS)
    ]);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
        throw new Error("Groq returned empty response");
    }

    return JSON.parse(content);
}

/**
 * 1. Generate Snippet Metadata (Step 1 of Flow)
 * Returns: { title, topic, aiTags: [] }
 */
export async function generateSnippetMetadata(code) {
    if (!API_KEY) throw new Error("Missing VITE_GROQ_API_KEY");

    const prompt = `
    Analyze this code snippet.
    Return a strictly valid JSON object (no markdown, no extra text) with:
    - title: A short, descriptive title (max 6 words)
    - topic: The main programming concept or algorithm (e.g., "Binary Search", "React Hooks")
    - aiTags: Array of 3-5 relevant keywords/tags

    Code:
    ${code.slice(0, 2000)}
    `;

    return withRetry(async () => {
        return await callGroq([
            { role: "system", content: "You are a helpful coding assistant. You strictly output JSON." },
            { role: "user", content: prompt }
        ]);
    }, 1);
}

/**
 * 2. Generate Snippet Notes (Step 2 of Flow / Background)
 * Returns: { aiNotes: { ... } }
 */
export async function generateSnippetNotes(code, title = "", topic = "") {
    if (!API_KEY) throw new Error("Missing VITE_GROQ_API_KEY");

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

    return withRetry(async () => {
        return await callGroq([
            { role: "system", content: "You are an expert developer. You explain code clearly. You strictly output JSON." },
            { role: "user", content: prompt }
        ]);
    }, 1);
}
