# Pen Pals Project Roadmap

This document divides the ongoing development of the **Pen Pals** collaborative writing platform into clear, manageable phases. Feel free to edit this file to re-prioritize or add new ideas!

---

## Phase 1: The Foundation ✅
*Objective: Build a functional, single-player proof of concept with a premium UI.*
- [x] Set up Next.js skeleton and layout.
- [x] Implement the warm black, minimal aesthetic.
- [x] Integrate TipTap editor with novel-specific formatting (Undo/Redo, Alignments, Blockquotes, Scene breaks).
- [x] Build the Sidebar with Drafts (Chapters), Storyboard (Plot Points), and Characters (Cast).
- [x] Implement client-side state for switching and managing chapters.

## Phase 2: Database Integration ✅
*Objective: Ensure user data is securely and persistently saved to a database.*
- [x] Connect the application to MongoDB Atlas cluster using Mongoose.
- [x] Complete the API routes (`/api/chapters`, `/api/storyboard`, `/api/characters`) to handle real CRUD (Create, Read, Update, Delete) operations.
- [x] Implement debounced auto-saving in the editor to prevent data loss.
- [x] Sync the Sidebar state with the database on initial page load.

## Phase 3: Real-Time Collaboration ✅
*Objective: The core "Pen Pals" feature. Allow multiple authors to edit the same chapter seamlessly.*
- [x] Integrate **Yjs** (a real-time syncing framework) into the TipTap Editor.
- [x] Set up a WebSocket provider (Liveblocks) to broadcast changes instantly.
- [x] Display real-time multiplayer cursors and active user badges in the UI.
- [x] Handle conflict resolution for simultaneous edits.

## Phase 4: Advanced Planning & Export ✅
*Objective: Flesh out the surrounding tools to make it a true novelist's environment.*
- [x] **Storyboard:** Upgraded to a drag-and-drop Kanban board (Act columns + Idea/Drafting/Completed statuses).
- [x] **Characters:** Expanded into detailed pop-out character profiles (age, personality traits, relationships).
- [x] **Exporting:** Compile all chapters and export the manuscript as `.docx` or `.pdf`.
- [x] **Word Count Goals:** Daily writing targets with a progress bar, shown in the writing space only.
- [x] **Auto-Capitalisation:** Smart capitalisation after Enter (new paragraph) and full stops — no Caps Lock needed.
- [x] **Author Presence:** Cursor author tags only show on the opposing tab, not both simultaneously.
- [x] **Storyboard Scroll:** Horizontal scrolling on the Storyboard page on mobile and tablet screen sizes.

---

## Phase 5: Authentication & Polish ✅
*Objective: Secure the app, allow for private projects, and prepare for production.*
- [x] **Authentication:** Add **NextAuth.js** for user login (Google OAuth + Email/Password).
- [x] **Projects Dashboard:** A landing page where users can create, rename, and manage multiple separate books/projects.
- [x] **Role-Based Permissions:** Project Owner can invite Contributors and assign Editor vs. Read-Only roles.
- [x] **Author Profiles:** Each user gets a display name, avatar, and bio shown on their collaboration cursor.
- [x] **Notifications:** In-app notifications when a collaborator joins, leaves, or makes a comment.
- [x] **Comments & Annotations:** Inline commenting system so collaborators can leave feedback on specific passages without editing the text directly.
- [x] **Version History:** View and restore previous saved versions of a chapter.

---

## Phase 6: Landing Page & Deployment 🚧
*Objective: Build a beautiful marketing page and deploy the full app to Vercel.*
- [x] **Landing Page:** A one-page marketing site at the root `/` showcasing all features with screenshots, feature highlights, collaboration animation, and a CTA.
- [x] **KanbanBoard Recovery:** Restored corrupted `KanbanBoard.tsx` from null-byte corruption.
- [x] **Body Overflow Fix:** Scoped `overflow-y: auto` so landing page can scroll without breaking the editor.
- [x] **Real Screenshots:** Capture and embed live screenshots of Editor, Dashboard, Kanban, and Characters views.
- [ ] **Vercel Deployment:** Connect repo to Vercel, configure environment variables, and deploy to production.
- [ ] **`vercel.json`:** Add Vercel configuration file with framework and build settings.
- [ ] **`.env.example`:** Document all required environment variables for easy onboarding.

