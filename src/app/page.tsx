import './landing.css';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ScrollReveal } from '@/components/ScrollReveal';
import { Screenshot } from '@/components/Screenshot';

export const metadata: Metadata = {
  title: 'Pen Pals — Collaborative Novel Writing',
  description:
    'Pen Pals is a premium collaborative writing platform for novelists. Write side-by-side with your co-author with live cursors, plan your story on a drag-and-drop Kanban board, and build deep character profiles — all in one beautiful, distraction-free editor.',
  keywords: ['collaborative writing', 'novel writing app', 'co-author', 'writing tool', 'story planning'],
  openGraph: {
    title: 'Pen Pals — Write Together',
    description: 'The collaborative novel editor for writers who refuse to write alone.',
    type: 'website',
  },
};

import { Users, LayoutDashboard, UserSquare, FileDown, MessageSquare, History, PenTool } from 'lucide-react';
import { ScrollToTop } from '@/components/ScrollToTop';

const FEATURES = [
  {
    icon: <Users size={20} />,
    title: 'Real-Time Collaboration',
    desc: 'Write side-by-side with your co-author. Live cursors, colour-coded presence, and instant sync — no refresh needed.',
  },
  {
    icon: <LayoutDashboard size={20} />,
    title: 'Kanban Storyboard',
    desc: 'Map every plot point across customizable acts on a drag-and-drop board. Move cards between Idea, Drafting, and Completed.',
  },
  {
    icon: <UserSquare size={20} />,
    title: 'Deep Character Profiles',
    desc: 'Age, personality traits, relationships, roles — everything about your cast lives in detailed, beautifully designed profiles.',
  },
  {
    icon: <FileDown size={20} />,
    title: 'Export Your Manuscript',
    desc: 'Compile all your chapters and export as a polished .docx or .pdf with a single click.',
  },
  {
    icon: <MessageSquare size={20} />,
    title: 'Inline Comments',
    desc: 'Highlight any passage and leave threaded comments directly in the text. Give feedback without disrupting the story.',
  },
  {
    icon: <History size={20} />,
    title: 'Version History',
    desc: 'Name, snapshot, and restore previous versions of any chapter. Never lose a scene you might want back.',
  },
];

/* ── SVG Mockups — shown if a real screenshot is missing ── */

function EditorMockup() {
  return (
    <svg viewBox="0 0 800 500" style={{ width: '100%' }} aria-hidden="true">
      <rect width="800" height="500" fill="#171513" />
      <rect x="0" y="0" width="220" height="500" fill="#1c1917" />
      <rect x="0" y="0" width="220" height="48" fill="#171513" />
      <rect x="16" y="16" width="80" height="16" rx="4" fill="#292524" />
      <rect x="16" y="64" width="140" height="12" rx="3" fill="#292524" />
      <rect x="16" y="84" width="110" height="12" rx="3" fill="#292524" />
      <rect x="16" y="104" width="130" height="12" rx="3" fill="#292524" />
      <rect x="220" y="0" width="580" height="48" fill="#1c1917" />
      {[88, 116, 144, 172, 200, 228, 272, 300, 328, 356].map((y, i) => (
        <rect key={i} x="280" y={y} width={200 + (i % 3) * 80} height="11" rx="3" fill="#292524" />
      ))}
      <rect x="480" y="116" width="2" height="14" rx="1" fill="#a8a29e" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0;0.8" dur="1.2s" repeatCount="indefinite" />
      </rect>
      <rect x="380" y="144" width="2" height="14" rx="1" fill="#a78bfa" />
      <rect x="380" y="130" width="40" height="12" rx="3" fill="#a78bfa" opacity="0.9" />
      <text x="384" y="140" fontSize="8" fill="#171513" fontFamily="sans-serif">Alex</text>
    </svg>
  );
}

function DashboardMockup() {
  return (
    <svg viewBox="0 0 800 500" style={{ width: '100%' }} aria-hidden="true">
      <rect width="800" height="500" fill="#171513" />
      <rect width="800" height="60" fill="#1c1917" />
      <rect x="32" y="20" width="90" height="20" rx="4" fill="#292524" />
      <rect x="680" y="18" width="88" height="24" rx="6" fill="#e6e4e1" />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${32 + i * 250}, 100)`}>
          <rect width="220" height="160" rx="10" fill="#1c1917" stroke="#292524" strokeWidth="1" />
          <rect x="16" y="20" width="120" height="14" rx="3" fill="#3b3531" />
          <rect x="16" y="44" width="80" height="10" rx="3" fill="#292524" />
        </g>
      ))}
    </svg>
  );
}

function KanbanMockup() {
  return (
    <svg viewBox="0 0 800 500" style={{ width: '100%' }} aria-hidden="true">
      <rect width="800" height="500" fill="#171513" />
      <rect width="800" height="48" fill="#1c1917" />
      {['Act 1', 'Act 2', 'Act 3'].map((act, i) => (
        <g key={act} transform={`translate(${16 + i * 264}, 64)`}>
          <rect width="248" height="420" rx="8" fill="#1c1917" stroke="#292524" strokeWidth="1" />
          <text x="16" y="24" fontSize="11" fill="#78716c" fontFamily="sans-serif" fontWeight="600">
            {act.toUpperCase()}
          </text>
          {Array.from({ length: i === 0 ? 3 : i === 1 ? 2 : 1 }, (_, j) => (
            <g key={j} transform={`translate(12, ${48 + j * 80})`}>
              <rect width="224" height="68" rx="6" fill="#171513" stroke="#292524" strokeWidth="1" />
              <rect x="12" y="14" width={100 + j * 20} height="10" rx="3" fill="#292524" />
              <rect x="12" y="48" width="52" height="10" rx="4" fill="#292524" />
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}

function CharacterMockup() {
  return (
    <svg viewBox="0 0 800 500" style={{ width: '100%' }} aria-hidden="true">
      <rect width="800" height="500" fill="#171513" />
      <rect width="800" height="500" fill="rgba(0,0,0,0.4)" />
      <rect x="160" y="60" width="480" height="380" rx="12" fill="#1c1917" stroke="#292524" strokeWidth="1" />
      <circle cx="280" cy="140" r="48" fill="#292524" />
      <text x="280" y="148" textAnchor="middle" fontSize="28" fill="#78716c" fontFamily="sans-serif">E</text>
      <rect x="350" y="100" width="200" height="20" rx="4" fill="#292524" />
      <rect x="350" y="130" width="140" height="12" rx="3" fill="#1c1917" />
      {['Age', 'Role', 'Traits', 'Relationships'].map((label, i) => (
        <g key={label} transform={`translate(192, ${220 + i * 44})`}>
          <text x="0" y="12" fontSize="10" fill="#78716c" fontFamily="sans-serif">{label.toUpperCase()}</text>
          <rect x="0" y="18" width={220 + (i % 2) * 60} height="12" rx="3" fill="#292524" />
        </g>
      ))}
    </svg>
  );
}

/* ── Page ─────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="landing-root">
      <ScrollReveal />

      {/* ── Navigation ── */}
      <nav className="landing-nav" aria-label="Main navigation">
        <span className="landing-nav-logo">
          <PenTool size={18} strokeWidth={2} style={{ color: 'var(--text-secondary)' }} />
          Pen<span>Pals</span>
        </span>
        <Link href="/dashboard" className="landing-nav-cta" id="nav-cta">
          Start Writing →
        </Link>
      </nav>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="landing-hero" aria-label="Hero">


        <h1 className="landing-hero-title">
          The writing tool built for<br />
          <em>two voices, one story.</em>
        </h1>

        <p className="landing-hero-subtitle">
          Pen Pals is a premium collaborative editor for novelists. Write in real-time
          with your co-author, plan on a Kanban board, and bring your characters to life.
        </p>

        <div className="landing-hero-actions">
          <Link href="/dashboard" className="landing-btn-primary" id="hero-cta">
            Start Writing →
          </Link>
          <a href="#features" className="landing-btn-secondary" id="hero-features-link">
            See the features
          </a>
        </div>

        {/* Hero screenshot frame */}
        <div className="landing-hero-frame" aria-hidden="true">
          <div className="landing-hero-frame-glow" />
          <Screenshot
            src="/screenshots/editor.png"
            alt="Pen Pals editor showing collaborative writing in action"
            width={1200}
            height={750}
            className="landing-screenshot"
            fallback={<EditorMockup />}
          />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES GRID
      ══════════════════════════════════════════ */}
      <section className="landing-features" id="features" aria-label="Features">
        <div className="landing-features-inner">
          <p className="landing-section-label" style={{ textAlign: 'center', marginBottom: 12 }}>
            Everything you need
          </p>
          <h2 className="landing-section-title" style={{ textAlign: 'center', marginBottom: 48 }}>
            A novelist&apos;s complete toolkit
          </h2>
          <div className="landing-features-grid" role="list">
            {FEATURES.map((f, i) => (
              <article className="landing-feature-card" key={i} role="listitem">
                <div className="landing-feature-icon" aria-hidden="true">{f.icon}</div>
                <h3 className="landing-feature-title">{f.title}</h3>
                <p className="landing-feature-desc">{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SHOWCASE 1 — The Editor
      ══════════════════════════════════════════ */}
      <section className="landing-showcase reveal" aria-label="Editor showcase">
        <div className="landing-showcase-content">
          <p className="landing-section-label">The Writing Space</p>
          <h2 className="landing-section-title">
            A distraction-free editor<br /><em>that stays out of your way</em>
          </h2>
          <p className="landing-section-body">
            Built on TipTap, the editor gives you every formatting tool a novelist needs —
            from inline comments and block quotes to smart auto-capitalisation — wrapped
            in a warm, minimal interface. Your words always come first.
          </p>
          <div style={{ marginTop: 28, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {['Auto-Capitalisation', 'Word Count Goals', 'Export PDF/DOCX', 'Bubble Menu'].map(tag => (
              <span key={tag} style={{
                fontSize: 11, padding: '4px 10px', borderRadius: 6,
                border: '1px solid var(--border-color)', color: 'var(--text-secondary)',
                fontWeight: 500, letterSpacing: '0.02em',
              }}>{tag}</span>
            ))}
          </div>
        </div>
        <div className="landing-showcase-img">
          <Screenshot
            src="/screenshots/editor.png"
            alt="Pen Pals TipTap rich text editor"
            width={600}
            height={380}
            fallback={<EditorMockup />}
          />
        </div>
      </section>

      <div className="landing-divider" />

      {/* ══════════════════════════════════════════
          SHOWCASE 2 — Dashboard
      ══════════════════════════════════════════ */}
      <section className="landing-showcase reverse reveal" aria-label="Dashboard showcase">
        <div className="landing-showcase-content">
          <p className="landing-section-label">Your Writing Library</p>
          <h2 className="landing-section-title">
            All your projects,<br /><em>beautifully organised</em>
          </h2>
          <p className="landing-section-body">
            The dashboard gives every book its own space. See word count progress,
            active collaborators, and chapter counts at a glance. Create a new project
            in seconds and invite your co-author instantly.
          </p>
        </div>
        <div className="landing-showcase-img">
          <Screenshot
            src="/screenshots/dashboard.png"
            alt="Pen Pals project dashboard with book cards"
            width={600}
            height={380}
            fallback={<DashboardMockup />}
          />
        </div>
      </section>

      <div className="landing-divider" />

      {/* ══════════════════════════════════════════
          SHOWCASE 3 — Storyboard
      ══════════════════════════════════════════ */}
      <section className="landing-showcase reveal" aria-label="Storyboard showcase">
        <div className="landing-showcase-content">
          <p className="landing-section-label">Story Planning</p>
          <h2 className="landing-section-title">
            Every plot point<br /><em>in its place</em>
          </h2>
          <p className="landing-section-body">
            The Kanban Storyboard divides your story into customizable acts with drag-and-drop
            cards for every plot point. Move them between Idea, Drafting, and Completed
            as your story takes shape. Planning and writing, unified.
          </p>
        </div>
        <div className="landing-showcase-img">
          <Screenshot
            src="/screenshots/kanban.png"
            alt="Pen Pals Kanban storyboard with customizable Act columns"
            width={600}
            height={380}
            fallback={<KanbanMockup />}
          />
        </div>
      </section>

      <div className="landing-divider" />

      {/* ══════════════════════════════════════════
          SHOWCASE 4 — Characters
      ══════════════════════════════════════════ */}
      <section className="landing-showcase reverse reveal" aria-label="Characters showcase">
        <div className="landing-showcase-content">
          <p className="landing-section-label">Character Profiles</p>
          <h2 className="landing-section-title">
            Know your cast<br /><em>inside and out</em>
          </h2>
          <p className="landing-section-body">
            Build deep profiles for every character — age, personality traits, role,
            and relationships. Each profile lives in a beautiful pop-out modal,
            always one click away while you write.
          </p>
        </div>
        <div className="landing-showcase-img">
          <Screenshot
            src="/screenshots/characters.png"
            alt="Pen Pals character profile modal with traits and relationships"
            width={600}
            height={380}
            fallback={<CharacterMockup />}
          />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          COLLABORATION STRIP
      ══════════════════════════════════════════ */}
      <section className="landing-collab reveal" aria-label="Collaboration feature">
        <p className="landing-section-label">Real-Time Collaboration</p>
        <h2 className="landing-section-title" style={{ maxWidth: 520, margin: '0 auto 16px' }}>
          Your co-author is always<br /><em>one invite away</em>
        </h2>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 440, margin: '0 auto', lineHeight: 1.7, fontWeight: 300 }}>
          Powered by Liveblocks and Yjs, Pen Pals syncs every keystroke in real time.
          See coloured cursors dance across the page as your writing partner types
          alongside you — even from across the world.
        </p>
        <div className="landing-collab-lines" aria-hidden="true">
          <div className="landing-collab-line" />
          <div className="landing-collab-line" />
          <div className="landing-collab-line" />
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', opacity: 0.5, marginTop: 24, letterSpacing: '0.04em' }}>
          Each colour represents a different author
        </p>
      </section>

      {/* ══════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════ */}
      <div className="landing-cta-banner reveal" role="complementary" aria-label="Call to action">
        <div className="landing-cta-banner-box">
          <h2 className="landing-cta-banner-title">
            Ready to write<br /><em>your story?</em>
          </h2>
          <p className="landing-cta-banner-sub">
            Join Pen Pals and start your first collaborative novel today.
            It&apos;s free to get started.
          </p>
          <Link href="/dashboard" className="landing-btn-primary" id="footer-cta">
            Start Writing →
          </Link>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="landing-footer" role="contentinfo">
        <span className="landing-footer-logo">Pen Pals</span>
        <span className="landing-footer-copy">© {new Date().getFullYear()} Pen Pals. All rights reserved.</span>
        <nav className="landing-footer-links" aria-label="Footer links">
          <a href="/dashboard">App</a>
          <a href="https://github.com/RedPhoenix25/pen-pals" target="_blank" rel="noopener noreferrer">GitHub</a>
        </nav>
      </footer>

      <ScrollToTop />
    </div>
  );
}
