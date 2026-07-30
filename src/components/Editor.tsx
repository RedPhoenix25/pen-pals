"use client";

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CharacterCount from '@tiptap/extension-character-count';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { useEffect, useState, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { 
  Bold, Italic, Strikethrough, Underline as UnderlineIcon, 
  Heading2, Heading3, Quote, Undo, Redo,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Minus, Users,
  MessageSquare, History, Trash2, Clock
} from 'lucide-react';
import { RoomProvider, useRoom, useOthers, ClientSideSuspense } from "@liveblocks/react/suspense";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import * as Y from "yjs";
import { CommentMark } from '@/lib/CommentMark';
import { TimestampMark } from '@/lib/TimestampMark';
import { VersionHistoryPanel } from './VersionHistoryPanel';

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'];

export function Editor({ projectId }: { projectId?: string }) {
  const { activeChapterId, currentUser } = useAppContext();
  
  // Stable user color derived from user id so it's consistent across sessions
  const userColor = currentUser
    ? COLORS[currentUser.id.charCodeAt(currentUser.id.length - 1) % COLORS.length]
    : COLORS[0]; // fallback to first color instead of impure Math.random()
  
  const userName = currentUser?.name || 'Anonymous';
  // Liveblocks room scoped to project + chapter to avoid cross-project collisions
  const roomId = projectId ? `project-${projectId}-chapter-${activeChapterId}` : (activeChapterId || '');

  if (!activeChapterId) {
    return (
      <div style={{ width: '100%', minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0 }}>Select or create a chapter to begin...</p>
        </div>
      </div>
    );
  }

  return (
    <RoomProvider id={roomId} initialPresence={{ cursor: null }}>
      <ClientSideSuspense fallback={<div style={{ padding: '80px 40px', color: 'var(--text-secondary)' }}>Connecting to collaborative room...</div>}>
        <CollaborativeEditor key={activeChapterId} userName={userName} userColor={userColor} projectId={projectId} />
      </ClientSideSuspense>
    </RoomProvider>
  );
}

function CollaborativeEditor({ userName, userColor, projectId }: { userName: string, userColor: string, projectId?: string }) {
  const room = useRoom();
  const [doc, setDoc] = useState<Y.Doc>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [provider, setProvider] = useState<any>();

  useEffect(() => {
    let isMounted = true;
    const yDoc = new Y.Doc();
    const yProvider = new LiveblocksYjsProvider(room, yDoc);
    
    if (isMounted) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDoc(yDoc);
      setProvider(yProvider);
    }

    // Aggressively remove the Liveblocks watermark from the DOM, including Shadow DOMs
    const hideWatermark = () => {
      // 1. Hide known selectors
      document.querySelectorAll('[id*="liveblocks"], [class*="liveblocks"], [class*="lb-"]').forEach(el => {
        (el as HTMLElement).style.display = 'none';
      });

      // 2. Iterate through body children to catch the injected container
      Array.from(document.body.children).forEach(child => {
        // Skip our main app containers
        if (child.tagName === 'NOSCRIPT' || child.tagName === 'SCRIPT' || child.tagName === 'MAIN' || child.id === '__next' || child.id === 'root') return;
        
        const htmlElement = child as HTMLElement;
        
        // If it's a web component with a shadow root, or has fixed positioning with high z-index
        if (
          child.tagName.toLowerCase().includes('liveblocks') || 
          htmlElement.shadowRoot || 
          (window.getComputedStyle(htmlElement).position === 'fixed' && parseInt(window.getComputedStyle(htmlElement).zIndex) >= 50)
        ) {
          // If it's the next.js dev tools, don't hide it
          if (child.tagName.toLowerCase() !== 'nextjs-portal') {
             htmlElement.style.display = 'none';
             htmlElement.style.opacity = '0';
             htmlElement.style.visibility = 'hidden';
          }
        }
      });
    };

    hideWatermark();
    // Run periodically just in case it is injected lazily
    const interval = setInterval(hideWatermark, 500);
    const observer = new MutationObserver(hideWatermark);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      isMounted = false;
      clearInterval(interval);
      observer.disconnect();
      yDoc.destroy();
      yProvider.destroy();
    };
  }, [room]);

  if (!doc || !provider) return null;

  // Use doc.guid as key so Tiptap completely remounts if StrictMode recreates the doc
  return <TiptapEditor key={doc.guid} doc={doc} provider={provider} userName={userName} userColor={userColor} projectId={projectId} />;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TiptapEditor({ doc, provider, userName, userColor, projectId }: { doc: Y.Doc, provider: any, userName: string, userColor: string, projectId?: string }) {
  const { chapters, activeChapterId, setChapters, currentUser } = useAppContext();
  const activeChapter = chapters.find(c => c._id === activeChapterId);
  const [saveStatus, setSaveStatus] = useState('Saved just now');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [comments, setComments] = useState<any[]>([]);

function getWordAtOffset(text: string, offset: number): string {
  if (!text || text.trim() === '') return '';
  let start = offset;
  while (start > 0 && /\S/.test(text[start - 1])) {
    start--;
  }
  let end = offset;
  while (end < text.length && /\S/.test(text[end])) {
    end++;
  }
  return text.slice(start, end).trim();
}

  // Floating Timestamp Tooltip State
  const [tooltipState, setTooltipState] = useState<{
    visible: boolean;
    x: number;
    y: number;
    timeText: string;
    authorName?: string;
  } | null>(null);

  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wordTimestampMapRef = useRef<Map<string, { time: number; author: string }>>(new Map());

  const handleCursorTimestampCheck = (editorInstance: any) => {
    if (!editorInstance) return;
    try {
      const { state, view } = editorInstance;
      const { selection } = state;
      const { $from } = selection;

      const parentText = $from.parent.textContent || '';
      const offset = $from.parentOffset;
      const word = getWordAtOffset(parentText, offset);

      let timeVal: number | null = null;
      let authorVal: string | null = null;

      // 1. Check timestamp in map
      if (word && wordTimestampMapRef.current.has(word.toLowerCase())) {
        const entry = wordTimestampMapRef.current.get(word.toLowerCase());
        if (entry) {
          timeVal = entry.time;
          authorVal = entry.author;
        }
      }

      // 2. Check mark attributes on node
      if (!timeVal) {
        const marks = $from.marks();
        const tsMark = marks.find((m: any) => m.type.name === 'timestampMark');
        if (tsMark?.attrs?.time) {
          timeVal = parseInt(tsMark.attrs.time, 10);
          authorVal = tsMark.attrs.author;
        } else if ($from.nodeBefore) {
          const bMarks = $from.nodeBefore.marks || [];
          const bTs = bMarks.find((m: any) => m.type.name === 'timestampMark');
          if (bTs?.attrs?.time) {
            timeVal = parseInt(bTs.attrs.time, 10);
            authorVal = bTs.attrs.author;
          }
        }
      }

      // 3. Fallback to activeChapter.updatedAt if available, otherwise current date
      let date: Date;
      if (timeVal) {
        date = new Date(timeVal);
      } else if (activeChapter?.updatedAt) {
        date = new Date(activeChapter.updatedAt);
      } else {
        date = new Date();
      }

      const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      const timeString = `${timeStr} · ${dateStr}`;

      const coords = view.coordsAtPos(selection.from);
      if (coords && coords.left > 0 && coords.top > 0) {
        setTooltipState({
          visible: true,
          x: coords.left,
          y: coords.top - 38,
          timeText: timeString,
          authorName: authorVal || userName,
        });

        if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
        tooltipTimeoutRef.current = setTimeout(() => {
          setTooltipState(prev => prev ? { ...prev, visible: false } : null);
        }, 3000);
      }
    } catch {}
  };

  useEffect(() => {
    if (!activeChapterId) return;
    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/comments?chapterId=${activeChapterId}`);
        if (res.ok) setComments(await res.json());
      } catch {}
    };
    fetchComments();
    const interval = setInterval(fetchComments, 10000);
    return () => clearInterval(interval);
  }, [activeChapterId]);
  
  const others = useOthers();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false, // History is handled by Yjs
      }),
      CharacterCount,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Collaboration.configure({
        document: doc,
      }),
      CollaborationCursor.configure({
        provider: provider,
        user: { name: userName, color: userColor },
      }),
      CommentMark,
      TimestampMark,
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none',
        style: 'line-height: 1.8; font-size: 18px; color: var(--text-primary);'
      },
      handleClick(view) {
        setTimeout(() => {
          if (editor) handleCursorTimestampCheck(editor);
        }, 50);
        return false;
      },
      handleTextInput(view, from, to, text) {
        if (text.length !== 1) return false;

        const { state } = view;
        const { $from } = state.selection;

        if (!$from.parent.isTextblock) return false;

        const offset = $from.parentOffset;
        let charToInsert = text;

        if (offset === 0) {
          charToInsert = text.toUpperCase();
        } else {
          const textBefore = $from.parent.textContent.slice(0, offset);
          if (/[.!?]['"”’)]?\s+$/.test(textBefore)) {
            charToInsert = text.toUpperCase();
          }
        }

        const now = Date.now().toString();
        const markType = state.schema.marks.timestampMark;
        const tr = state.tr;

        if (markType) {
          const mark = markType.create({ time: now, author: userName });
          tr.insertText(charToInsert, from, to);
          tr.addMark(from, from + charToInsert.length, mark);
          view.dispatch(tr);
          return true;
        }

        if (charToInsert !== text) {
          const tr = state.tr.insertText(charToInsert, from, to);
          view.dispatch(tr);
          return true;
        }

        return false;
      }
    },
    immediatelyRender: false,
    onCreate: ({ editor }) => {
      // With Liveblocks/Yjs, the document state is synced automatically. 
      // We only inject MongoDB content if the Yjs doc is truly empty on first load.
      // Wait a moment for Liveblocks to sync before deciding it's empty.
      setTimeout(() => {
        if (editor.isEmpty && activeChapter?.content) {
          editor.commands.setContent(activeChapter.content);
        }
      }, 500);
    },
    onUpdate: ({ editor }) => {
      if (!activeChapterId) return;
      
      try {
        const { selection } = editor.state;
        const { $from } = selection;
        const parentText = $from.parent.textContent || '';
        const offset = $from.parentOffset;
        const currentWord = getWordAtOffset(parentText, offset);
        if (currentWord) {
          wordTimestampMapRef.current.set(currentWord.toLowerCase(), {
            time: Date.now(),
            author: userName
          });
        }
      } catch {}

      const html = editor.getHTML();
      setSaveStatus('Saving...');
      
      // Update local state without triggering re-renders of the editor content itself
      setChapters(prev => prev.map(c => c._id === activeChapterId ? { ...c, content: html } : c));
      
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await fetch(`/api/chapters/${activeChapterId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: html })
          });
          setSaveStatus('Saved just now');
        } catch {
          setSaveStatus('Failed to save');
        }
      }, 1000);
    }
  });

  if (!editor) return null;

  return (
    <div style={{ width: '100%', minHeight: '500px', position: 'relative' }}>
      
      {/* Active Users Badge */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px', gap: '8px' }}>
        <div data-tutorial="editor-collaborators" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-secondary)', padding: '4px 12px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
          <Users size={14} color="var(--text-secondary)" />
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {others.length === 0 ? 'Only you editing' : `${others.length} other${others.length > 1 ? 's' : ''} editing`}
          </span>
        </div>
      </div>

      {/* Minimal Static Toolbar */}
      <div 
        className="editor-toolbar"
        style={{ 
          display: 'flex', 
          gap: '4px', 
          padding: '8px', 
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '24px',
          alignItems: 'center'
        }}
      >
        {/* Undo/Redo are disabled in collaboration mode usually, or you need yjs-undo. 
            For now, we leave them in, but they might not work perfectly without y-undo. 
            Tiptap handles it via y-undo under the hood if configured. */}
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="btn-icon"
          title="Undo"
          style={{ color: 'var(--text-secondary)', opacity: editor.can().undo() ? 1 : 0.5 }}
        >
          <Undo size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="btn-icon"
          title="Redo"
          style={{ color: 'var(--text-secondary)', opacity: editor.can().redo() ? 1 : 0.5 }}
        >
          <Redo size={16} />
        </button>
        
        <div style={{ width: '1px', background: 'var(--border-color)', margin: '4px 8px' }} />

        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`btn-icon ${editor.isActive('bold') ? 'is-active' : ''}`}
          style={{ background: editor.isActive('bold') ? 'var(--accent-color)' : 'transparent', color: editor.isActive('bold') ? '#fff' : 'var(--text-secondary)' }}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`btn-icon ${editor.isActive('italic') ? 'is-active' : ''}`}
          style={{ background: editor.isActive('italic') ? 'var(--accent-color)' : 'transparent', color: editor.isActive('italic') ? '#fff' : 'var(--text-secondary)' }}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`btn-icon ${editor.isActive('underline') ? 'is-active' : ''}`}
          style={{ background: editor.isActive('underline') ? 'var(--accent-color)' : 'transparent', color: editor.isActive('underline') ? '#fff' : 'var(--text-secondary)' }}
          title="Underline"
        >
          <UnderlineIcon size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`btn-icon ${editor.isActive('strike') ? 'is-active' : ''}`}
          style={{ background: editor.isActive('strike') ? 'var(--accent-color)' : 'transparent', color: editor.isActive('strike') ? '#fff' : 'var(--text-secondary)' }}
          title="Strikethrough"
        >
          <Strikethrough size={16} />
        </button>
        
        <div style={{ width: '1px', background: 'var(--border-color)', margin: '4px 8px' }} />
        
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`btn-icon ${editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}`}
          style={{ background: editor.isActive({ textAlign: 'left' }) ? 'var(--accent-color)' : 'transparent', color: editor.isActive({ textAlign: 'left' }) ? '#fff' : 'var(--text-secondary)' }}
          title="Align Left"
        >
          <AlignLeft size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`btn-icon ${editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}`}
          style={{ background: editor.isActive({ textAlign: 'center' }) ? 'var(--accent-color)' : 'transparent', color: editor.isActive({ textAlign: 'center' }) ? '#fff' : 'var(--text-secondary)' }}
          title="Align Center"
        >
          <AlignCenter size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`btn-icon ${editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}`}
          style={{ background: editor.isActive({ textAlign: 'right' }) ? 'var(--accent-color)' : 'transparent', color: editor.isActive({ textAlign: 'right' }) ? '#fff' : 'var(--text-secondary)' }}
          title="Align Right"
        >
          <AlignRight size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={`btn-icon ${editor.isActive({ textAlign: 'justify' }) ? 'is-active' : ''}`}
          style={{ background: editor.isActive({ textAlign: 'justify' }) ? 'var(--accent-color)' : 'transparent', color: editor.isActive({ textAlign: 'justify' }) ? '#fff' : 'var(--text-secondary)' }}
          title="Justify"
        >
          <AlignJustify size={16} />
        </button>

        <div style={{ width: '1px', background: 'var(--border-color)', margin: '4px 8px' }} />

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`btn-icon ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
          style={{ background: editor.isActive('heading', { level: 2 }) ? 'var(--accent-color)' : 'transparent', color: editor.isActive('heading', { level: 2 }) ? '#fff' : 'var(--text-secondary)' }}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`btn-icon ${editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}`}
          style={{ background: editor.isActive('heading', { level: 3 }) ? 'var(--accent-color)' : 'transparent', color: editor.isActive('heading', { level: 3 }) ? '#fff' : 'var(--text-secondary)' }}
          title="Heading 3"
        >
          <Heading3 size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`btn-icon ${editor.isActive('blockquote') ? 'is-active' : ''}`}
          style={{ background: editor.isActive('blockquote') ? 'var(--accent-color)' : 'transparent', color: editor.isActive('blockquote') ? '#fff' : 'var(--text-secondary)' }}
          title="Blockquote"
        >
          <Quote size={16} />
        </button>

        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="btn-icon"
          style={{ color: 'var(--text-secondary)' }}
          title="Horizontal Rule (Scene Break)"
        >
          <Minus size={16} />
        </button>

        <div style={{ width: '1px', background: 'var(--border-color)', margin: '4px 8px' }} />

        {/* Version History */}
        <button
          onClick={() => setShowVersionHistory(!showVersionHistory)}
          className={`btn-icon ${showVersionHistory ? 'is-active' : ''}`}
          style={{ background: showVersionHistory ? 'var(--accent-color)' : 'transparent', color: showVersionHistory ? '#fff' : 'var(--text-secondary)' }}
          title="Version History"
        >
          <History size={16} />
        </button>
      </div>

      {/* Comment BubbleMenu — appears on text selection */}
      <BubbleMenu
        editor={editor}
        pluginKey="addCommentMenu"
        tippyOptions={{ duration: 150, placement: 'top' }}
        shouldShow={({ editor, from, to }) => {
          return from !== to && !editor.isActive('comment');
        }}
      >
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '4px', display: 'flex', gap: '4px', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
          <button
            onClick={() => setShowCommentInput(v => !v)}
            className="btn-icon"
            title="Add Comment"
            style={{ fontSize: '12px', gap: '4px', padding: '4px 8px', color: 'var(--text-secondary)' }}
          >
            <MessageSquare size={13} /> Comment
          </button>
        </div>
      </BubbleMenu>

      {/* Comment Viewer BubbleMenu — appears on clicking a comment */}
      <BubbleMenu
        editor={editor}
        pluginKey="viewCommentMenu"
        tippyOptions={{ duration: 150, placement: 'bottom' }}
        shouldShow={({ editor, from, to }) => {
          return editor.isActive('comment') && from === to;
        }}
      >
        {(() => {
          if (!editor.isActive('comment')) return null;
          const { commentId } = editor.getAttributes('comment');
          const comment = comments.find(c => c.commentId === commentId);
          if (!comment) return (
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', fontSize: '12px', color: 'var(--text-secondary)', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
              Loading comment...
            </div>
          );
          
          return (
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', width: '240px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 50 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>{comment.authorName}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                    {new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                  {comment.authorId === currentUser?.id && (
                    <button
                      onClick={async () => {
                        await fetch(`/api/comments/${comment.commentId}`, { method: 'DELETE' });
                        editor.commands.unsetComment();
                        setComments(prev => prev.filter(c => c.commentId !== comment.commentId));
                      }}
                      className="btn-icon"
                      title="Delete Comment"
                      style={{ padding: '2px', color: 'var(--text-secondary)' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>{comment.text}</p>
            </div>
          );
        })()}
      </BubbleMenu>

      {/* Inline comment input popover */}
      {showCommentInput && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', zIndex: 100, width: '320px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Add a comment to the selected text:</p>
          <textarea
            autoFocus
            value={commentInput}
            onChange={e => setCommentInput(e.target.value)}
            placeholder="Your comment..."
            rows={3}
            style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '12px' }}
          />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button onClick={() => { setShowCommentInput(false); setCommentInput(''); }} style={{ padding: '7px 14px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
            <button
              onClick={async () => {
                if (!commentInput.trim() || !activeChapterId || !projectId) return;
                const { from, to } = editor.state.selection;
                const commentId = `c_${Date.now()}`;
                // Apply the mark
                editor.chain().focus().setComment(commentId).run();
                const res = await fetch('/api/comments', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ chapterId: activeChapterId, projectId, authorId: currentUser?.id, authorName: currentUser?.name || 'Anonymous', text: commentInput.trim(), from, to, commentId })
                });
                if (res.ok) {
                  const newComment = await res.json();
                  setComments(prev => [newComment, ...prev]);
                }
                setCommentInput('');
                setShowCommentInput(false);
              }}
              style={{ padding: '7px 14px', background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
            >
              Add Comment
            </button>
          </div>
        </div>
      )}

      {/* Floating Cursor Timestamp Tooltip */}
      {tooltipState && (
        <div
          style={{
            position: 'fixed',
            top: tooltipState.y,
            left: tooltipState.x,
            transform: 'translateX(-50%)',
            zIndex: 100,
            background: 'rgba(28, 24, 22, 0.94)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(214, 158, 46, 0.4)',
            borderRadius: '6px',
            padding: '4px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            color: 'var(--text-primary)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            pointerEvents: 'none',
            opacity: tooltipState.visible ? 1 : 0,
            transition: 'opacity 0.35s ease, transform 0.35s ease',
          }}
        >
          <Clock size={11} color="rgba(214, 158, 46, 0.9)" />
          <span>
            {tooltipState.timeText}
            {tooltipState.authorName && (
              <span style={{ color: 'var(--text-secondary)', marginLeft: '4px' }}>
                by {tooltipState.authorName}
              </span>
            )}
          </span>
        </div>
      )}

      <div data-tutorial="editor-content">
        <EditorContent editor={editor} />
      </div>
      
      {/* Footer Status */}
      <div style={{ 
        position: 'fixed', 
        bottom: '20px', 
        right: showVersionHistory ? '340px' : '40px', 
        fontSize: '12px', 
        color: 'var(--text-secondary)',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        zIndex: 10,
        transition: 'right 0.3s ease',
      }}>
        <span>{editor.storage.characterCount.words()} words</span>
        <span>|</span>
        <span>{saveStatus}</span>
      </div>

      {/* Version History Panel */}
      {showVersionHistory && activeChapterId && projectId && (
        <VersionHistoryPanel
          chapterId={activeChapterId}
          projectId={projectId}
          currentContent={editor.getHTML()}
          currentWordCount={editor.storage.characterCount.words()}
          onRestore={(content) => {
            editor.commands.setContent(content);
          }}
          onClose={() => setShowVersionHistory(false)}
        />
      )}
    </div>
  );
}
