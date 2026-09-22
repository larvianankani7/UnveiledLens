import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Globe,
  LogOut,
  Mail,
  Moon,
  Pencil,
  Save,
  Settings as SettingsIcon,
  ShieldCheck,
  Sun,
  User,
  X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme.js';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function Settings() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState('');
  const [editingUsername, setEditingUsername] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const clearAuthentication = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  };

  useEffect(() => {
    const loadProfile = async () => {
      const token =
        sessionStorage.getItem('token') ||
        localStorage.getItem('token');

      if (!token) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/user/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.status === 401) {
          clearAuthentication();
          navigate('/login', { replace: true });
          return;
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.message ||
            data?.error ||
            'Unable to load your profile.'
          );
        }

        setProfile(data);
        setUsername(data.username || '');
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load your profile.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleLogout = () => {
    clearAuthentication();
    navigate('/login', { replace: true });
  };

  const handleSaveUsername = async () => {
    const trimmed = username.trim();
    if (!trimmed) {
      setError('Username cannot be empty.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token =
        sessionStorage.getItem('token') ||
        localStorage.getItem('token');

      const response = await fetch(
        `${API_BASE_URL}/api/user/profile/username`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            username: trimmed
          })
        }
      );

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        clearAuthentication();
        navigate('/login', { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
          data?.error ||
          'Unable to update username.'
        );
      }

      setUsername(data.username);
      setProfile((current) => ({
        ...current,
        username: data.username
      }));

      setEditingUsername(false);
      setSuccess('Username updated successfully.');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to update username.'
      );
    } finally {
      setSaving(false);
    }
  };

  const cancelUsernameEdit = () => {
    setUsername(profile?.username || '');
    setEditingUsername(false);
    setError('');
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 border-2 border-accent-burnt/30 border-t-accent-burnt rounded-full animate-spin" />
          <p className="text-xs font-mono text-gray-500 mt-4 uppercase tracking-widest">
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 sm:px-6 lg:px-10 py-8 lg:py-10 max-w-4xl mx-auto w-full page-enter">
      
      {/* Return Navigation */}
      <Link
        to="/search"
        className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-gray-400 hover:text-white transition-colors mb-6 group"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
        <span>Back to Exposure Search</span>
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3.5 mb-8 pb-6 border-b border-[var(--border-subtle)]">
        <div className="h-10 w-10 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-primary)] flex items-center justify-center text-accent-amber">
          <SettingsIcon className="h-5 w-5" />
        </div>
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-gray-500 block">
            ACCOUNT PREFERENCES
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Settings & Identity
          </h1>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-900/60 bg-red-950/30 px-5 py-3 text-xs text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-xl border border-emerald-900/50 bg-emerald-950/20 px-5 py-3 text-xs text-emerald-300 flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>{success}</span>
        </div>
      )}

      <div className="space-y-6">
        
        {/* Profile Details Panel */}
        <section className="glass-panel card-glow rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center gap-2.5">
            <User className="h-4 w-4 text-accent-amber" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
              Profile & Verified Scope
            </h2>
          </div>

          <div className="p-6 space-y-5">
            <ProfileRow
              icon={Mail}
              label="Account Email"
              value={profile?.email}
              description="Primary institutional email address"
            />

            <ProfileRow
              icon={Globe}
              label="Verified Domain"
              value={profile?.domain}
              description="The domain surface bound to this account"
              mono
            />

            {/* Editable Username */}
            <div className="flex items-start gap-4 py-2 border-t border-[var(--border-subtle)] pt-4">
              <div className="h-9 w-9 rounded-lg bg-[var(--bg-surface-soft)] border border-[var(--border-primary)] flex items-center justify-center shrink-0 text-gray-400">
                <User className="h-4 w-4" />
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block mb-1">
                  DISPLAY USERNAME
                </span>

                {editingUsername ? (
                  <div className="mt-2 flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      maxLength={30}
                      autoFocus
                      className="input-technical flex-1 px-3 py-2 text-xs font-mono"
                    />

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSaveUsername}
                        disabled={saving}
                        className="btn-primary text-xs px-3.5 py-1.5 gap-1.5"
                      >
                        <Save className="h-3.5 w-3.5" />
                        <span>{saving ? 'Saving...' : 'Save'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={cancelUsernameEdit}
                        disabled={saving}
                        className="btn-secondary text-xs px-3 py-1.5 gap-1"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-white font-mono">
                      {profile?.username || 'Not set'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setError('');
                        setSuccess('');
                        setEditingUsername(true);
                      }}
                      className="p-1 rounded text-gray-500 hover:text-accent-amber hover:bg-glass-light transition-colors"
                      title="Edit username"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                <p className="text-[11px] text-gray-500 mt-1">
                  Your identity label within UnveiledLens reports.
                </p>
              </div>
            </div>

            {/* Account Status & Role */}
            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block">
                  AUTHORIZATION ROLE
                </span>
                <span className="badge-technical badge-amber mt-1">
                  {profile?.role === 'ROLE_ADMIN' ? 'ADMIN' : 'USER'}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block">
                  ACCOUNT STATUS
                </span>
                <div className="flex items-center justify-end gap-1.5 mt-1 font-mono text-xs text-white">
                  <span className="status-pip status-pip-emerald" />
                  <span>{profile?.accountStatus || 'ACTIVE'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Appearance Panel */}
        <section className="glass-panel card-glow rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center gap-2.5">
            <Sun className="h-4 w-4 text-accent-amber" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
              Appearance & Theme
            </h2>
          </div>

          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="h-9 w-9 rounded-lg bg-[var(--bg-surface-soft)] border border-[var(--border-primary)] flex items-center justify-center text-accent-amber">
                {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </div>
              <div>
                <span className="text-sm font-medium text-white block">
                  {theme === 'dark' ? 'Dark Mode (Active)' : 'Light Mode (Active)'}
                </span>
                <span className="text-xs text-gray-500 font-mono">
                  Controlled telemetry palette across the intelligence system
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="btn-secondary text-xs px-4 py-2 font-mono uppercase"
            >
              Switch to {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>
        </section>

        {/* Security Info Panel */}
        <section className="glass-panel rounded-xl p-5 border border-glass-border">
          <div className="flex items-start gap-3.5">
            <div className="h-8 w-8 rounded-lg bg-[var(--bg-surface-soft)] border border-[var(--border-primary)] flex items-center justify-center shrink-0 text-accent-amber">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-white">
                Cryptographic Authentication
              </h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Authentication sessions utilize one-time verification tokens. Passwords and keys are never stored in plaintext or readable representations.
              </p>
            </div>
          </div>
        </section>

        {/* Logout Control */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full btn-secondary text-xs px-5 py-3 justify-center gap-2 text-red-400 hover:text-red-300 border-red-900/30 hover:border-red-800/60"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Terminate Authentication Session</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfileRow({ icon: Icon, label, value, description, mono = false }) {
  return (
    <div className="flex items-start gap-4">
      <div className="h-9 w-9 rounded-lg bg-[var(--bg-surface-soft)] border border-[var(--border-primary)] flex items-center justify-center shrink-0 text-gray-400">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block mb-0.5">
          {label}
        </span>
        <span className={`text-sm text-white block ${mono ? 'font-mono' : 'font-medium'}`}>
          {value || 'Not available'}
        </span>
        <span className="text-[11px] text-gray-500 block mt-0.5">
          {description}
        </span>
      </div>
    </div>
  );
}
