// ==========================================
// GROQ API UTILITY (Day 3 - Two-Step Version)
// ==========================================
// Two separate functions for fast metadata and background notes.
// Uses Groq's fast LLM inference with Llama models.
// ==========================================

/**
 * Generate snippet metadata (title, topic, aiTags) - FAST CALL
 * This is called first and blocks until done.
 * @param {string} code - The code snippet to analyze
 * @returns {Promise<Object>} - { title, topic, aiTags }
 */
export async function generateSnippetMetadata(code) {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;

    if (!apiKey) {
        console.error("[GROQ] No API key found. Set VITE_GROQ_API_KEY in .env file.");
        throw new Error("Groq API key not configured");
    }

    const url = "https://api.groq.com/openai/v1/chat/completions";

    // System prompt for metadata generation
    const systemPrompt = `You are an expert competitive programming tutor.
Return only valid JSON strictly in the given schema.
Do not add any text outside JSON.`;

    // User prompt for metadata
    const userPrompt = `Analyze the following code and generate:

- a short clear title (max 8 words)
- the main topic (e.g. "Binary Search", "Dynamic Programming", "Graph Traversal")
- useful short skill-based tags (4-6 tags)

Return ONLY this JSON format:
{
  "title": "string",
  "topic": "string",
  "aiTags": ["string"]
}

Code:
${code}`;

    // 15 second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
        console.log("[GROQ] Generating metadata...");

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                temperature: 0.3,
                max_tokens: 200
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[GROQ] Metadata API error:", response.status, errorText);
            throw new Error(`Groq API error: ${response.status}`);
        }

        const data = await response.json();
        const textContent = data.choices?.[0]?.message?.content;

        if (!textContent) {
            throw new Error("Empty response from Groq");
        }

        // Clean markdown wrappers if present
        const cleanedText = textContent
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();

        console.log("[GROQ] Metadata raw:", cleanedText);

        const metadata = JSON.parse(cleanedText);

        // Validate structure
        if (!metadata.title || !metadata.topic || !Array.isArray(metadata.aiTags)) {
            throw new Error("Invalid metadata structure");
        }

        console.log("[GROQ] Metadata parsed:", metadata);

        return {
            title: metadata.title,
            topic: metadata.topic,
            aiTags: metadata.aiTags
        };

    } catch (error) {
        clearTimeout(timeoutId);

        if (error.name === "AbortError") {
            console.error("[GROQ] Metadata request timed out");
            throw new Error("Metadata generation timed out");
        }

        console.error("[GROQ] Metadata error:", error.message);
        throw error;
    }
}

/**
 * Generate structured AI notes - BACKGROUND CALL
 * Called after snippet is saved. Does not block UI.
 * @param {string} code - The code snippet to analyze
 * @returns {Promise<Object>} - { aiNotes: {...} }
 */
export async function generateSnippetNotes(code) {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;

    if (!apiKey) {
        console.error("[GROQ] No API key found.");
        throw new Error("Groq API key not configured");
    }

    const url = "https://api.groq.com/openai/v1/chat/completions";

    // System prompt for notes generation
    const systemPrompt = `You are an expert competitive programming and DSA tutor.
Return only valid JSON strictly in the given schema.
Do not add any text outside JSON.`;

    // User prompt for structured notes
    const userPrompt = `Generate structured learning notes for the following code.

Target audience: DSA / competitive programming student
Be beginner-friendly but technically correct.
Assume the student may revisit this months later.
Keep explanations concise but complete.

Return ONLY this JSON format:
{
  "aiNotes": {
    "problem": "string - one clear sentence describing what the problem is solving",
    "intuition": "string - the core idea behind the solution",
    "approach": "string - high-level strategy without implementation details",
    "algorithmSteps": "string - step-by-step logical flow (can use numbered steps)",
    "timeComplexity": "string - Big-O with short explanation",
    "spaceComplexity": "string - Big-O with short explanation",
    "edgeCases": "string - important corner cases to remember",
    "whenToUse": "string - when this pattern is applicable"
  }
}

Code:
${code}`;

    // 15 second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
        console.log("[GROQ] Generating notes...");

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                temperature: 0.3,
                max_tokens: 800
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[GROQ] Notes API error:", response.status, errorText);
            throw new Error(`Groq API error: ${response.status}`);
        }

        const data = await response.json();
        const textContent = data.choices?.[0]?.message?.content;

        if (!textContent) {
            throw new Error("Empty response from Groq");
        }

        // Clean markdown wrappers if present
        const cleanedText = textContent
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();

        console.log("[GROQ] Notes raw:", cleanedText);

        const notesData = JSON.parse(cleanedText);

        // Validate structure
        if (!notesData.aiNotes || typeof notesData.aiNotes !== "object") {
            throw new Error("Invalid notes structure");
        }

        console.log("[GROQ] Notes parsed:", notesData);

        return {
            aiNotes: notesData.aiNotes
        };

    } catch (error) {
        clearTimeout(timeoutId);

        if (error.name === "AbortError") {
            console.error("[GROQ] Notes request timed out");
            throw new Error("Notes generation timed out");
        }

        console.error("[GROQ] Notes error:", error.message);
        throw error;
    }
}
