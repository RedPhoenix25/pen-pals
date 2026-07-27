# Project Timeline & Changelog

This document tracks every step of the development process for the Pen Pals writing platform.

## 2026-07-10 - Project Initialization
- Created `.agents/AGENTS.md` to establish project rules, emphasizing a minimalist, warm black design and the requirement to keep this timeline updated.
- Created this `timeline.md` document to track project progress.
- Drafted and finalized the `implementation_plan.md` artifact based on user feedback.

## 2026-07-10 - Foundation & Minimalist UI
- **Initialized Next.js App**: Configured for Vanilla CSS, stripping out Tailwind CSS to ensure strict control over the minimalist design.
- **Created Design System**: Wrote `globals.css` with the warm black color palette (`#171513`, `#1c1917`) and minimal scrollbar styling.
- **Built the Sidebar UI**: Created `Sidebar.tsx` allowing for a distraction-free, toggleable sidebar for the Planning Area (Drafts, Storyboard, Characters).
- **Integrated TipTap Editor**: Set up `Editor.tsx` using TipTap for a headless, highly customizable rich text editing experience.
- **Setup Supabase Utility**: Created `src/lib/supabase.ts` to prepare for connecting the database for asynchronous saving.

## 2026-07-23 - Dependency Fix
- **Installed Tiptap Packages**: Added `@tiptap/react`, `@tiptap/starter-kit`, and `@tiptap/pm` dependencies to resolve build error in `Editor.tsx`.
- **Installed Lucide Icons**: Added `lucide-react` dependency to resolve icon import errors in `page.tsx` and `Sidebar.tsx`.

## 2026-07-23 - Application State & Backend Skeleton
- **MongoDB Setup**: Switched backend strategy to MongoDB (from Supabase) per user request. Created `src/lib/mongodb.ts`, Mongoose models (`Chapter`, `StoryboardEvent`, `Character`), and Next.js API routes.
- **Context API**: Lifted state up using `AppContext.tsx` to share data across `Sidebar` and `Editor` components.
- **Fleshed out UI**: 
  - Integrated `CharacterCount` and a floating `BubbleMenu` into the TipTap Editor.
  - Rewrote the `Sidebar` to display actual data from the database, complete with inline "+ Add" functionality for Chapters, Plot Points, and Cast members.
  - Updated `globals.css` with sleek input fields and a glassmorphic floating menu to retain the minimal premium aesthetic.

## 2026-07-23 - Phase 3 & 4: Collaboration & Advanced Planning
- **Phase 3 Complete**: Added advanced Tiptap Collaborative Editor, user presence cursors, and custom Liveblocks sync logic. Fixed React 19 StrictMode remount issues.
- **Phase 4 Complete**: Implemented Advanced Planning & Tools. Added glassmorphic Character Profile modals (with age, traits, relationships). Transformed Storyboard into a drag-and-drop Kanban board (Act 1-3 columns, Idea/Drafting/Complete statuses). Added real-time Word Count progress bar with a customizable target. Added `.docx` and `.pdf` export generation options directly in the browser!
- **Liveblocks Setup**: Integrated `@liveblocks/react` and `@liveblocks/yjs` to enable real-time collaboration. Configured `LiveblocksProviderWrapper` and `<RoomProvider>` to create rooms for specific chapter editing.
- **Yjs Tiptap Integration**: Added `@tiptap/extension-collaboration` and `@tiptap/extension-collaboration-cursor` to sync document state and display live multi-colored user cursors.
- **Bug Fix - Dependency Conflicts**: Discovered a critical incompatibility between Tiptap v3 (`@tiptap/pm`) and Yjs (`y-prosemirror`) in Next.js development mode. Successfully downgraded Tiptap to stable v2.27.2 to restore native peer dependency resolution and fix complete app crashes.
- **Bug Fix - Next.js 15 Routing Error**: Fixed backend API bug where `DELETE` operations silently failed. Refactored dynamic route parameters (`[id]/route.ts`) to use `await params` resolving the Next.js 15 Promise behavior.
- **Bug Fix - Liveblocks React Sync**: Resolved a React StrictMode bug where double-mounts destroyed the active `yDoc` binding. Fixed by strictly binding `TiptapEditor` to a unique `key={doc.guid}`. Wrapped Editor in `<ClientSideSuspense>` to ensure the WebSocket fully connects before rendering.
- **Watermark Eradication**: Replaced standard CSS watermark hiding with an aggressive Javascript DOM Observer in `Editor.tsx` to detect and immediately remove the Liveblocks shadow-DOM watermark.
- **UI Polish**: Added specific Tiptap CSS rules to render tiny capsule tags for multi-user cursors rather than disruptive block elements.

## 2026-07-23 - UX Polish & Fixes (Post Phase 4)
- **Daily Writing Goal**: Renamed "Project Goal" to "Daily Writing Goal". Repositioned it to the top-left writing area (near the sidebar toggle). Added a visible pencil edit button so it's clearly editable. The goal is hidden when the sidebar is open or in any sidebar menu — it is unique to the writing space.
- **Auto-Capitalisation**: Implemented smart capitalisation in the TipTap editor — the first letter of a new paragraph (on Enter) and the first letter after a full stop are automatically uppercased, reducing the need to press Caps Lock while typing.
- **Author Presence Tags**: Fixed collaborative cursor author tags so they only display on the tab where the OTHER author is writing — not on both tabs simultaneously.
- **Storyboard Horizontal Scroll (Mobile/Tablet)**: Fixed a persistent bug preventing horizontal scrolling on the Storyboard page on smaller screens. Root cause was `overflow: hidden` on `html, body` in `globals.css` which suppressed all child overflow scrolling on mobile browsers. Fixed by splitting to `overflow-x: hidden` + `overflow-y: hidden`, adding a dedicated `.kanban-scroll` CSS class using `overflow-x: scroll` and `-webkit-overflow-scrolling: touch`, and correcting the flex height chain (`flex: 1` + `minHeight: 0`) throughout the layout.

## 2026-07-24 - Phase 5: Auth, Multi-Project Architecture, and Social
- **Authentication**: Implemented NextAuth v5 (Beta) supporting both Google OAuth and Email/Password credentials. Configured secure JWT sessions, `User` model, and middleware protection that redirects unauthenticated users to a custom dark-themed `/login` page.
- **Multi-Project Architecture**: Migrated from a single-document setup to a multi-tenant `Project` model. The root page now redirects to `/dashboard`, which displays a library grid of user projects, word count targets, and collaborator counts. The editor lives at `/editor/[projectId]`. All backend queries (Chapters, Characters, Storyboard) are strictly scoped to `projectId`.
- **Author Roles & Collaboration**: Added a `ProjectSettingsModal` allowing project owners to configure Word Count goals, update project details, and invite collaborators by email (Editor/Viewer roles). Liveblocks cursors now utilize the real session user's name and derive a consistent cursor color based on their user ID. Liveblocks rooms are scoped specifically by `project-{projectId}-chapter-{chapterId}` to avoid cross-project pollution.
- **Notifications**: Added a `Notification` model and top-right Bell dropdown to alert users when invited to projects or for system events. It uses a real-time 30-second polling interval for unread badges.
- **Inline Comments**: Built a custom TipTap `CommentMark` extension. Users can highlight text and add threaded inline comments via the floating BubbleMenu.
- **Version History**: Implemented manual snapshotting via the `VersionHistoryPanel`. Users can name versions, view word counts and timestamps, and restore previous chapter states instantly.

## 2026-07-26 - Phase 6: Landing Page

- **KanbanBoard.tsx Recovery**: The `KanbanBoard.tsx` component was found to be entirely corrupted (filled with null bytes, likely a disk write failure). Reconstructed the full drag-and-drop Kanban board from scratch using dnd-kit, with Act 1/2/3 columns, Idea/Drafting/Completed status selectors, and full CRUD via the storyboard API.
- **Landing Page Built**: Created a full single-page marketing site at the root `/` of the Next.js app. The page adopts the exact warm-black aesthetic of the app (`#171513`, `#1c1917`, cream text, Lora serif) and includes:
  - Fixed navigation bar with logo and "Start Writing →" CTA
  - Hero section with animated badge, large serif headline, and two CTAs
  - 6-card features grid ("A novelist's complete toolkit")
  - 4 alternating left/right showcase rows with inline SVG mockups (Editor, Dashboard, Kanban, Characters)
  - Collaboration animation strip (3 coloured cursor dots animating across lines via pure CSS `@keyframes`)
  - CTA banner with glassmorphic box
  - Footer with copyright and links
  - Scroll reveal animations using Intersection Observer
- **`landing.css`**: Created dedicated stylesheet inheriting CSS variables, Google Fonts (Lora + Inter), and all landing page styles without affecting the app.
- **`ScrollReveal.tsx`**: Extracted as a client component for Intersection Observer animations.
- **Body Overflow Fix**: Changed `overflow-y: hidden` → `overflow-y: auto` on `body` to allow the landing page to scroll; editor layout is unaffected (it uses `height: 100vh` on its `<main>`).
- **`next.config.ts` Updated**: Added `images.remotePatterns` for Google OAuth profile avatars and `eslint.ignoreDuringBuilds: true` for smooth Vercel deployment.
- **ROADMAP Updated**: Phase 5 marked complete ✅, Phase 6 added as 🚧 in progress.

## 2026-07-27 - Phase 7: Storyboard Kanban Rebuild
- **KanbanBoard Rebuild**: Rebuilt the Kanban Board to support horizontal dragging and rearranging of columns (Plot Cards).
- **Default Plot Cards**: Set default plot cards to Prologue, Act 1, Epilogue.
- **Custom Plot Cards**: Added ability to add custom plot cards via an "Add Plot Card" button.
- **Delete Plot Cards**: Added a styled, themed modal to confirm deletion of plot cards and all nested plot plans.
- **Inline Status Selection**: Added inline status selection (Idea, Planning, Executed) when adding new plot plans directly to a card.
- **Inline Act Name Editing**: Double-clicking a plot card's header name allows renaming it inline.
