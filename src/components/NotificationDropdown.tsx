"use client";

import { useState, useEffect, useRef } from 'react';
import { Bell, Check } from 'lucide-react';

interface Notification {
  _id: string;
  type: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export function NotificationDropdown({ onClose, onMarkAllRead }: { onClose: () => void, onMarkAllRead?: () => void }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) setNotifications(await res.json());
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();

    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    if (onMarkAllRead) onMarkAllRead();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        width: '320px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        overflow: 'hidden',
        zIndex: 50,
      }}
    >
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 500 }}>Notifications</span>
          {unreadCount > 0 && (
            <span style={{ fontSize: '10px', background: '#ef4444', color: '#fff', borderRadius: '10px', padding: '1px 6px' }}>
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} style={{ fontSize: '11px', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Check size={11} /> Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>Loading...</div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
            <Bell size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }} />
            No notifications yet
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n._id}
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--border-color)',
                background: n.read ? 'transparent' : 'rgba(255,255,255,0.02)',
                cursor: n.link ? 'pointer' : 'default',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (n.link) e.currentTarget.style.background = 'var(--bg-primary)'; }}
              onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(255,255,255,0.02)'}
              onClick={() => n.link && window.location.assign(n.link)}
            >
              {!n.read && (
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6', marginTop: '6px', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, paddingLeft: n.read ? '16px' : '0' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', lineHeight: 1.4 }}>{n.message}</p>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{timeAgo(n.createdAt)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
