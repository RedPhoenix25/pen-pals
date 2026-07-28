"use client";

import { useState } from 'react';
import { X, UserPlus, Trash2, Crown } from 'lucide-react';
import { ProjectSettings } from '@/context/AppContext';
import { CustomSelect } from './CustomSelect';

interface Props {
  project: ProjectSettings;
  currentUserId: string;
  onClose: () => void;
  onUpdate: (updated: ProjectSettings) => void;
}

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  editor: 'Editor',
  viewer: 'Viewer',
};

export function ProjectSettingsModal({ project, currentUserId, onClose, onUpdate }: Props) {
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description || '');
  const [wordCountTarget, setWordCountTarget] = useState(project.wordCountTarget);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');
  const [inviteError, setInviteError] = useState('');
  const [inviting, setInviting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState('');

  const isOwner = project.ownerId === currentUserId;

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/projects/${project._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, wordCountTarget }),
    });
    if (res.ok) {
      showNotif('Project settings saved.');
      onUpdate(await res.json());
    }
    setSaving(false);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteError('');
    setInviting(true);
    const res = await fetch(`/api/projects/${project._id}/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
    });
    const data = await res.json();
    if (!res.ok) {
      setInviteError(data.error || 'Failed to invite.');
    } else {
      setInviteEmail('');
      showNotif(`Invitation sent to ${inviteEmail}.`);
    }
    setInviting(false);
  };

  const handleRemove = async (userId: string) => {
    const res = await fetch(`/api/projects/${project._id}/invite`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) showNotif('Collaborator removed.');
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '24px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '28px', maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 400 }}>Project Settings</h2>
          <button onClick={onClose} className="btn-icon"><X size={18} /></button>
        </div>

        {notification && (
          <div style={{ padding: '10px 14px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '8px', color: '#4ade80', fontSize: '13px' }}>
            {notification}
          </div>
        )}

        {/* Project Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Details</h3>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              disabled={!isOwner}
              style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--text-secondary)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              disabled={!isOwner}
              rows={2}
              style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--text-secondary)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Word Count Goal</label>
            <input
              type="number"
              value={wordCountTarget}
              onChange={e => setWordCountTarget(Number(e.target.value))}
              disabled={!isOwner}
              min={1000}
              step={1000}
              style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--text-secondary)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
            />
          </div>

          {isOwner && (
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ alignSelf: 'flex-end', padding: '8px 20px', background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>

        <div style={{ height: '1px', background: 'var(--border-color)' }} />

        {/* Collaborators */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Collaborators</h3>

          {/* Owner */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '13px' }}>You (Owner)</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
              <Crown size={11} /> Owner
            </span>
          </div>

          {project.collaborators.map(c => (
            <div key={c.userId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{c.userId}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{ROLE_LABELS[c.role] || c.role}</span>
                {isOwner && (
                  <button onClick={() => handleRemove(c.userId)} className="btn-icon" style={{ padding: '2px', color: '#ef4444' }}>
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Invite Form */}
          {isOwner && (
            <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Invite by Email</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="collaborator@example.com"
                  style={{ flex: 1, padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--text-secondary)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                />
                <CustomSelect
                  value={inviteRole}
                  onChange={(val) => setInviteRole(val as 'editor' | 'viewer')}
                  options={[
                    { value: "editor", label: "Editor" },
                    { value: "viewer", label: "Viewer" }
                  ]}
                  style={{ width: '110px' }}
                />
                <button type="submit" disabled={inviting} className="btn-icon" style={{ border: '1px solid var(--border-color)', padding: '8px 12px' }}>
                  <UserPlus size={16} />
                </button>
              </div>
              {inviteError && <p style={{ margin: 0, fontSize: '12px', color: '#f87171' }}>{inviteError}</p>}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
