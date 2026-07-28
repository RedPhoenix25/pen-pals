"use client";

import { useState, useEffect } from 'react';
import { X, Clock, User, RotateCcw, Save } from 'lucide-react';

interface Version {
  _id: string;
  label: string;
  authorName: string;
  wordCount: number;
  createdAt: string;
}

interface Props {
  chapterId: string;
  projectId: string;
  currentContent: string;
  currentWordCount: number;
  onRestore: (content: string) => void;
  onClose: () => void;
}

export function VersionHistoryPanel({ chapterId, projectId, currentContent, currentWordCount, onRestore, onClose }: Props) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [labelInput, setLabelInput] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    const fetchVersions = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/versions?chapterId=${chapterId}`);
        if (res.ok) setVersions(await res.json());
      } finally {
        setLoading(false);
      }
    };
    fetchVersions();
  }, [chapterId]);

  const handleSaveVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId,
          projectId,
          content: currentContent,
          wordCount: currentWordCount,
          label: labelInput.trim() || `Version ${new Date().toLocaleString()}`,
        }),
      });
      if (res.ok) {
        const newVersion = await res.json();
        setVersions(prev => [newVersion, ...prev]);
        setLabelInput('');
        setShowSaveForm(false);
        showNotif('Version saved.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async (versionId: string) => {
    setRestoringId(versionId);
    try {
      // First fetch the full content
      const res = await fetch(`/api/versions/${versionId}`);
      if (!res.ok) return;
      const version = await res.json();
      onRestore(version.content);
      showNotif('Content restored from this version.');
    } finally {
      setRestoringId(null);
    }
  };

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '320px',
      background: 'var(--bg-secondary)',
      borderLeft: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50,
      boxShadow: '-8px 0 32px rgba(0,0,0,0.3)',
    }}>
      {/* Header */}
      <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={16} style={{ color: 'var(--text-secondary)' }} />
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>Version History</h3>
        </div>
        <button onClick={onClose} className="btn-icon"><X size={16} /></button>
      </div>

      {/* Notification */}
      {notification && (
        <div style={{ margin: '12px 16px 0', padding: '8px 12px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px', fontSize: '12px', color: '#4ade80' }}>
          {notification}
        </div>
      )}

      {/* Save New Version */}
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
        {showSaveForm ? (
          <form onSubmit={handleSaveVersion} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              autoFocus
              value={labelInput}
              onChange={e => setLabelInput(e.target.value)}
              placeholder="Version label (optional)..."
              style={{
                width: '100%',
                padding: '8px 10px',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--text-secondary)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowSaveForm(false)}
                style={{ flex: 1, padding: '7px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{ flex: 1, padding: '7px', background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowSaveForm(true)}
            style={{
              width: '100%',
              padding: '9px',
              background: 'transparent',
              border: '1px dashed var(--border-color)',
              borderRadius: '8px',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'border-color 0.2s, color 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-secondary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <Save size={14} /> Save current version
          </button>
        )}
      </div>

      {/* Version List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>Loading...</div>
        ) : versions.length === 0 ? (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
            <Clock size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
            No saved versions yet.
            <br />
            <span style={{ fontSize: '12px', opacity: 0.6 }}>Save a version to track your progress.</span>
          </div>
        ) : (
          versions.map(v => (
            <div
              key={v._id}
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, flex: 1, marginRight: '8px' }}>
                  {v.label || `Version`}
                </p>
                <button
                  onClick={() => handleRestore(v._id)}
                  disabled={restoringId === v._id}
                  title="Restore this version"
                  style={{
                    padding: '4px 8px',
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    color: 'var(--text-secondary)',
                    fontSize: '11px',
                    cursor: restoringId === v._id ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    flexShrink: 0,
                    transition: 'border-color 0.15s, color 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-secondary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <RotateCcw size={10} />
                  {restoringId === v._id ? '...' : 'Restore'}
                </button>
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <User size={10} /> {v.authorName}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Clock size={10} /> {timeAgo(v.createdAt)}
                </span>
                <span>{v.wordCount.toLocaleString()} words</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
