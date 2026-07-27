"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error); setLoading(false); return; }
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password.');
        setLoading(false);
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
      }}>
        {/* Brand */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 300, letterSpacing: '0.1em', color: 'var(--text-primary)' }}>
            Pen Pals
          </h1>
          <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Write together. Tell stories.
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}>

          {/* Mode toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-primary)', borderRadius: '8px', padding: '4px', gap: '4px' }}>
            {(['login', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: 'none',
                  borderRadius: '6px',
                  background: mode === m ? 'var(--accent-color)' : 'transparent',
                  color: mode === m ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: mode === m ? 500 : 400,
                  transition: 'all 0.2s',
                }}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Google Button */}
          <button
            onClick={handleGoogle}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              background: 'transparent',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'border-color 0.2s, background 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--bg-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleCredentials} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mode === 'signup' && (
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Display Name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your pen name..."
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--text-secondary)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                />
              </div>
            )}
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--text-secondary)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--text-secondary)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
              />
            </div>

            {error && (
              <div style={{
                padding: '10px 12px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#f87171',
                fontSize: '13px',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: loading ? 'var(--accent-color)' : 'var(--text-primary)',
                color: 'var(--bg-primary)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.2s',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
