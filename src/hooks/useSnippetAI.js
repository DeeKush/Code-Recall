import { useState, useCallback, useRef, useEffect } from 'react';
import { generateSnippetNotes } from '../services/groqService';

/**
 * Custom hook for AI-powered snippet note generation.
 * Handles loading states, errors, and prevents memory leaks on unmount.
 */
const useSnippetAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Use a ref to track the unmounted state for safe async updates
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Generates AI notes for a given code snippet.
   * @param {string} code - The code to analyze.
   * @param {string} title - The title of the snippet.
   * @param {string} topic - The topic/category.
   * @returns {Promise<Object|null>} - The generated notes or null on failure.
   */
  const generateNote = useCallback(async (code, title = "", topic = "") => {
    if (!code) {
      setError("No code provided for analysis.");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await generateSnippetNotes(code, title, topic);
      
      if (!isMounted.current) return null;

      if (response && response.aiNotes) {
        return response.aiNotes;
      } else {
        throw new Error("AI provider returned an invalid response format.");
      }
    } catch (err) {
      if (!isMounted.current) return null;
      
      console.error("[useSnippetAI Error]", err);
      const errorMessage = err.message || "Failed to generate AI notes. Please check your API keys or try again later.";
      setError(errorMessage);
      return null;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  return {
    generateNote,
    loading,
    error,
    resetError
  };
};

export default useSnippetAI;
