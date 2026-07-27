"use client";

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';

export function NotificationBell() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll unread notification count every 30 seconds
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.filter((n: { read: boolean }) => !n.read).length);
        }
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = () => {
    setUnreadCount(0);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        className="btn-icon"
        onClick={() => setShowNotifications(!showNotifications)}
        title="Notifications"
        style={{ position: 'relative' }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-2px', 
            right: '-6px',
            background: '#ef4444',
            color: '#fff',
            fontSize: '9px',
            fontWeight: 'bold',
            minWidth: '14px',
            height: '14px',
            borderRadius: '7px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            border: '1.5px solid var(--bg-primary)',
            boxSizing: 'border-box'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {showNotifications && (
        <NotificationDropdown 
          onClose={() => setShowNotifications(false)}
          onMarkAllRead={handleMarkAllRead}
        />
      )}
    </div>
  );
}
