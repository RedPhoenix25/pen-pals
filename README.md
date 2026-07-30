# Pen Pals 🖊️📖

> A distraction-free, minimalist collaborative novel writing platform built for authors.

**Live Application**: [https://pen-pals.onrender.com](https://pen-pals.onrender.com)

---

## ✨ Key Features

- ✍️ **Collaborative Writing Space**: Real-time rich text editing powered by TipTap & Yjs/Liveblocks with live co-author cursors.
- 📌 **Kanban Storyboard**: Drag-and-drop plot cards organized by Acts (Prologue, Act 1, 2, 3, Epilogue) with custom status trackers (*Idea*, *Planning*, *Executed*).
- 👤 **Character Dossiers**: Dedicated profile management for cast members, age, traits, and relationship webs.
- 🎯 **Daily Writing Goals**: Customizable word count targets with live progress tracking.
- 📄 **Professional Exports**: Generate publication-ready `.pdf` and `.docx` manuscripts with custom page breaks, indents, and headers.
- 💬 **Inline Comments & Version Snapshots**: Highlight text to add threaded comments and save named version snapshots.
- 📱 **Mobile & Tablet Optimized**: Single-line swipeable format toolbar and responsive touch-friendly drawer layouts.
- 🌙 **Minimalist Theme**: Warm black palette (`#171513`, `#1c1917`) tailored to prevent eye strain during long writing sessions.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Styling**: Vanilla CSS (Custom Design Tokens)
- **Database**: MongoDB (Mongoose)
- **Authentication**: NextAuth v5 (Google OAuth & Email Credentials)
- **Collaboration**: Liveblocks & Yjs
- **Exports**: jsPDF & docx

---

## 🚀 Local Setup

```bash
# Clone the repository
git clone https://github.com/RedPhoenix25/pen-pals.git

# Install dependencies
npm install

# Set up environment variables (.env.local)
# MONGODB_URI=...
# AUTH_SECRET=...
# GOOGLE_CLIENT_ID=...
# GOOGLE_CLIENT_SECRET=...
# NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=...

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
