# CodeRecall - AI-Powered Code Retention System

CodeRecall is a modern spaced-repetition learning platform designed specifically for developers to retain and master code snippets. It combines a sleek, dark-themed UI with powerful AI features to help you understand and start recalling complex algorithms and patterns.

## 🚀 Key Features

- **Smart Snippet Management**: Save and organize code snippets with auto-generated titles, tags, and topics.
- **AI-Powered Insights**: Automatically generates "Problem", "Intuition", "Approach", and "Time/Space Complexity" notes for every snippet using Groq/Llama3.
- **Recall Mode (SRS)**: A scientifically grounded Spaced Repetition System that surfaces snippets you're about to forget.
    - *Algorithm V2*: Prioritizes snippets based on review history, difficulty, and age.
    - *Daily Queue*: Limits study sessions to avoid burnout.
- **Code Visualizer**: Step-by-step execution visualization for Java and C++ snippets to build mental models.
- **Secure Cloud Storage**: Built on Firebase for authentication and real-time data persistence.

## 🛠 Tech Stack

- **Frontend**: React (Vite), CSS3 (Variables, Flexbox/Grid)
- **Backend/Auth**: Firebase (Firestore, Auth)
- **AI Integration**: Groq API (Llama3-70b-8192) / OpenRouter
- **Icons**: Lucide-React

## 📅 7-Day Build Sprint Log

- **Day 1: Project Setup**
    - Initialized React + Vite project structure.
    - Configured Firebase Authentication and routing.
    - Set up environment variables and basic security.

- **Day 2: Core UI Components**
    - Built specific Dashboard layout and Sidebar navigation.
    - Designed the "Snippet Card" component.
    - Implemented responsiveness basics.

- **Day 3: Database & CRUD**
    - Integrated Firestore for data persistence.
    - Created `storage.js` service for standardized DB operations.
    - Implemented "My Snippets" list view with real-time updates.

- **Day 4: AI Integration & Theme**
    - Integrated Groq API for generating metadata (tags, titles) and detailed study notes.
    - Applied the "Modern Dark SaaS" theme (Day 4 Styles).
    - Refined UI consistency across Auth and Dashboard pages.

- **Day 5: Code Visualizer**
    - Developed the custom AST-based interpreter for Java/C++.
    - Built the Visualizer Modal with step-by-step execution controls.
    - Implemented variable state tracking and array visualization.

- **Day 6: Testing & Refinement**
    - Refactored Visualizer logic into specific utilities.
    - Added unit tests for the interpreter.
    - Fixed edge cases in C++ vector parsing.

- **Day 7: Recall Mode V1**
    - Implemented the Spaced Repetition algorithm foundation.
    - Created the Recall Mode UI with "Reveal Code" interaction.
    - Set up the review loop (Understood/Revisit).

- **Day 8: Production Polish (Current)**
    - **Recall Algorithm V2**: Refined scoring to prioritize "hard" and "new" items correctly.
    - **Stability**: Added guards to prevent AI note regeneration.
    - **UX**: Added "Missing Notes" CTA and restricted Visualizer to supported languages.
    - **Cleanup**: Removed debug logs and finalized branding.

## 📦 Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up `.env` with your API keys:
   ```env
   VITE_FIREBASE_API_KEY=...
   VITE_GROQ_API_KEY=...
   ```
4. Run locally:
   ```bash
   npm run dev
   ```

## 🔮 Future Roadmap

- [ ] Support for Python visualization.
- [ ] Mobile-responsive visualizer.
- [ ] Community snippet sharing.
