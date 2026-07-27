"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, User as UserIcon, Lock, Image as ImageIcon } from 'lucide-react';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  image?: string;
  provider: 'google' | 'credentials';
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Form fields
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setImage(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setName(data.name || '');
        setImage(data.image || '');
      } else if (res.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          image,
          currentPassword,
          newPassword
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setProfile(data);
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
        // Force refresh session (reload page or use NextAuth update if we had it, but reload is robust for visual changes)
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage({ text: data.error || 'Failed to update profile', type: 'error' });
      }
    } catch (e) {
      setMessage({ text: 'An unexpected error occurred', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--text-secondary)' }}>Loading...</span>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Nav */}
      <nav style={{
        padding: '16px 32px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        background: 'var(--bg-primary)'
      }}>
        <button 
          onClick={() => router.push('/dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '48px 32px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
        <h1 style={{ margin: '0 0 32px 0', fontSize: '24px', fontWeight: 300 }}>Profile Settings</h1>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Avatar Preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {image ? (
              <img
                src={image}
                alt="Avatar Preview"
                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                onError={(e) => { e.currentTarget.src = ''; setImage(''); }}
              />
            ) : (
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '32px', fontWeight: 300, color: 'var(--text-primary)', border: '1px solid var(--border-color)'
              }}>
                {name?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ImageIcon size={14} /> Profile Picture
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '8px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                    borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer', transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-primary)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                >
                  Upload Image
                </button>
                {image && (
                  <button
                    type="button"
                    onClick={() => setImage('')}
                    style={{
                      padding: '8px 16px', background: 'transparent', border: '1px solid var(--border-color)',
                      borderRadius: '8px', color: '#ef4444', fontSize: '13px', cursor: 'pointer', transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    Remove
                  </button>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>JPG, PNG or GIF. Max 5MB.</p>
            </div>
          </div>

          <div style={{ height: '1px', background: 'var(--border-color)' }} />

          {/* User Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserIcon size={14} /> Display Name
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                required
                style={{
                  width: '100%', padding: '10px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                  borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--text-secondary)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>
                Email Address
              </label>
              <input
                value={profile.email}
                disabled
                style={{
                  width: '100%', padding: '10px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                  borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '14px', boxSizing: 'border-box', opacity: 0.5, cursor: 'not-allowed'
                }}
              />
              {profile.provider === 'google' && (
                <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#3b82f6' }}>Signed in via Google</p>
              )}
            </div>
          </div>

          {/* Password (Only for Credentials users) */}
          {profile.provider === 'credentials' && (
            <>
              <div style={{ height: '1px', background: 'var(--border-color)' }} />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 400, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={16} /> Change Password
                </h3>
                
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="Leave blank if not changing password"
                    style={{
                      width: '100%', padding: '10px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                      borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--text-secondary)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="New secure password"
                    disabled={!currentPassword}
                    style={{
                      width: '100%', padding: '10px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                      borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                      opacity: !currentPassword ? 0.5 : 1
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--text-secondary)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                  />
                </div>
              </div>
            </>
          )}

          {/* Actions & Feedback */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
            <div style={{ 
              fontSize: '13px', 
              color: message.type === 'error' ? '#ef4444' : '#10b981',
              opacity: message.text ? 1 : 0,
              transition: 'opacity 0.2s'
            }}>
              {message.text}
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 24px', background: 'var(--text-primary)', color: 'var(--bg-primary)',
                border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 500,
                cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, transition: 'opacity 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = saving ? '0.7' : '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = saving ? '0.7' : '1'}
            >
              <Save size={16} /> {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
