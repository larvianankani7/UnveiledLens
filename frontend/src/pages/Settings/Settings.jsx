
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

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8080';

export default function Settings() {

  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState('');
  const [editingUsername, setEditingUsername] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [theme, setTheme] = useState(
    localStorage.getItem('unveiledlens-theme') || 'dark'
  );

  useEffect(() => {

    document.documentElement.dataset.theme =
      theme;

    localStorage.setItem(
      'unveiledlens-theme',
      theme
    );

  }, [theme]);

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

        const response =
          await fetch(
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

        const data =
          await response.json().catch(() => null);

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

  const clearAuthentication = () => {

    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');

    localStorage.removeItem('token');
    localStorage.removeItem('role');
  };

  const handleLogout = () => {

    clearAuthentication();

    navigate('/login', {
      replace: true
    });
  };

  const handleSaveUsername = async () => {

    const trimmed =
      username.trim();

    if (!trimmed) {

      setError(
        'Username cannot be empty.'
      );

      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {

      const token =
        sessionStorage.getItem('token') ||
        localStorage.getItem('token');

      const response =
        await fetch(
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

      const data =
        await response.json().catch(() => null);

      if (response.status === 401) {

        clearAuthentication();

        navigate('/login', {
          replace: true
        });

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
      setProfile(current => ({
        ...current,
        username: data.username
      }));

      setEditingUsername(false);
      setSuccess(
        'Username updated successfully.'
      );

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

    setUsername(
      profile?.username || ''
    );

    setEditingUsername(false);
    setError('');
  };

  if (loading) {

    return (
      <div className="flex-1 flex items-center justify-center px-6 py-16">

        <div className="text-center">

          <div className="mx-auto h-10 w-10 border-2 border-accent-burnt/30 border-t-accent-burnt rounded-full animate-spin" />

          <p className="text-sm text-gray-400 mt-4">
            Loading your settings...
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="flex-1 px-5 py-8 lg:px-10 lg:py-12">

      <div className="max-w-4xl mx-auto">

        <Link
          to="/search"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-accent-amber transition-colors mb-7"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Search
        </Link>

        <div className="mb-8">

          <div className="flex items-center gap-3">

            <div className="h-11 w-11 rounded-xl bg-accent-burnt/10 border border-accent-burnt/20 flex items-center justify-center">

              <SettingsIcon className="h-5 w-5 text-accent-amber" />

            </div>

            <div>

              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                Account
              </p>

              <h1 className="text-3xl font-semibold text-white tracking-tight">
                Settings
              </h1>

            </div>

          </div>

          <p className="text-sm text-gray-400 mt-3 max-w-xl">
            Manage your profile and personal preferences.
          </p>

        </div>

        {error && (

          <div className="mb-5 rounded-xl border border-red-900/60 bg-red-950/30 px-5 py-4 text-sm text-red-300">
            {error}
          </div>

        )}

        {success && (

          <div className="mb-5 rounded-xl border border-emerald-900/50 bg-emerald-950/20 px-5 py-4 text-sm text-emerald-300 flex items-center gap-2">

            <Check className="h-4 w-4" />

            {success}

          </div>

        )}

        <div className="space-y-6">

          <section className="glass-panel rounded-2xl border border-glass-border overflow-hidden">

            <div className="px-6 py-5 border-b border-glass-border">

              <div className="flex items-center gap-3">

                <User className="h-5 w-5 text-accent-amber" />

                <div>

                  <h2 className="text-lg font-medium text-white">
                    Profile
                  </h2>

                  <p className="text-xs text-gray-500 mt-0.5">
                    Your account information
                  </p>

                </div>

              </div>

            </div>

            <div className="p-6 space-y-5">

              <ProfileRow
                icon={Mail}
                label="Email"
                value={profile?.email}
                description="Your verified account email"
              />

              <ProfileRow
                icon={Globe}
                label="Verified domain"
                value={profile?.domain}
                description="The domain associated with this account"
                mono
              />

              <div className="flex items-start gap-4 py-2">

                <div className="h-10 w-10 rounded-xl bg-charcoal-lighter border border-glass-border flex items-center justify-center shrink-0">

                  <User className="h-4 w-4 text-gray-400" />

                </div>

                <div className="flex-1 min-w-0">

                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Username
                  </p>

                  {editingUsername ? (

                    <div className="mt-2 flex flex-col sm:flex-row gap-2">

                      <input
                        type="text"
                        value={username}
                        onChange={event =>
                          setUsername(
                            event.target.value
                          )
                        }
                        maxLength={30}
                        autoFocus
                        className="flex-1 bg-charcoal-lighter border border-glass-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-amber"
                      />

                      <div className="flex gap-2">

                        <button
                          type="button"
                          onClick={handleSaveUsername}
                          disabled={saving}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-accent-burnt text-white text-sm hover:bg-accent-dark disabled:opacity-60 transition-colors"
                        >
                          <Save className="h-4 w-4" />
                          {saving
                            ? 'Saving...'
                            : 'Save'}
                        </button>

                        <button
                          type="button"
                          onClick={cancelUsernameEdit}
                          disabled={saving}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-glass-border text-gray-300 hover:text-white transition-colors"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </button>

                      </div>

                    </div>

                  ) : (

                    <div className="flex items-center gap-3 mt-1">

                      <p className="text-base text-white font-medium break-all">
                        {profile?.username || 'Not set'}
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          setError('');
                          setSuccess('');
                          setEditingUsername(true);
                        }}
                        className="p-1.5 rounded-md text-gray-500 hover:text-accent-amber hover:bg-glass-light transition-colors"
                        title="Edit username"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                    </div>

                  )}

                  <p className="text-xs text-gray-500 mt-1">
                    Choose how you want to appear inside UnveiledLens.
                  </p>

                </div>

              </div>

              <div className="flex items-start gap-4 py-2">

                <div className="h-10 w-10 rounded-xl bg-accent-burnt/10 border border-accent-burnt/20 flex items-center justify-center shrink-0">

                  <ShieldCheck className="h-4 w-4 text-accent-amber" />

                </div>

                <div className="flex-1">

                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Account status
                  </p>

                  <div className="flex items-center gap-2 mt-1">

                    <span className="h-2 w-2 rounded-full bg-emerald-400" />

                    <p className="text-sm font-medium text-white">
                      {profile?.accountStatus || 'Active'}
                    </p>

                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    Your account remains available after logout.
                  </p>

                </div>

              </div>

              <div className="pt-2">

                <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                  Role
                </p>

                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-accent-burnt/15 text-accent-amber border border-accent-burnt/25">
                  {profile?.role === 'ROLE_ADMIN'
                    ? 'ADMIN'
                    : 'USER'}
                </span>

              </div>

            </div>

          </section>

          <section className="glass-panel rounded-2xl border border-glass-border overflow-hidden">

            <div className="px-6 py-5 border-b border-glass-border">

              <div className="flex items-center gap-3">

                <Sun className="h-5 w-5 text-accent-amber" />

                <div>

                  <h2 className="text-lg font-medium text-white">
                    Appearance
                  </h2>

                  <p className="text-xs text-gray-500 mt-0.5">
                    Choose how UnveiledLens looks for you
                  </p>

                </div>

              </div>

            </div>

            <div className="p-6">

              <div className="flex items-center justify-between gap-5">

                <div className="flex items-center gap-4">

                  <div className="h-10 w-10 rounded-xl bg-charcoal-lighter border border-glass-border flex items-center justify-center">

                    {theme === 'dark' ? (
                      <Moon className="h-4 w-4 text-gray-300" />
                    ) : (
                      <Sun className="h-4 w-4 text-accent-amber" />
                    )}

                  </div>

                  <div>

                    <p className="text-sm font-medium text-white">
                      {theme === 'dark'
                        ? 'Dark mode'
                        : 'Light mode'}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      This preference is saved on this device.
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setTheme(
                      current =>
                        current === 'dark'
                          ? 'light'
                          : 'dark'
                    )
                  }
                  role="switch"
                  aria-checked={theme === 'light'}
                  className={`relative w-14 h-8 rounded-full border transition-all duration-300 ${
                    theme === 'light'
                      ? 'bg-accent-burnt border-accent-burnt'
                      : 'bg-charcoal-lighter border-glass-border'
                  }`}
                >

                  <span
                    className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300 ${
                      theme === 'light'
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    }`}
                  />

                </button>

              </div>

            </div>

          </section>

          <section className="glass-panel rounded-2xl border border-glass-border overflow-hidden">

            <div className="px-6 py-5 border-b border-glass-border">

              <div className="flex items-center gap-3">

                <ShieldCheck className="h-5 w-5 text-accent-amber" />

                <div>

                  <h2 className="text-lg font-medium text-white">
                    Security
                  </h2>

                  <p className="text-xs text-gray-500 mt-0.5">
                    How your account is protected
                  </p>

                </div>

              </div>

            </div>

            <div className="p-6">

              <div className="rounded-xl border border-glass-border bg-charcoal-lighter/40 p-4">

                <p className="text-sm font-medium text-white">
                  Email verification
                </p>

                <p className="text-xs text-gray-500 mt-1 leading-5">
                  A one-time verification code is required when
                  you authenticate. Your password is never displayed
                  or stored in readable form.
                </p>

              </div>

            </div>

          </section>

          <section className="pt-2">

            <button
              type="button"
              onClick={handleLogout}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-red-900/50 bg-red-950/20 text-red-300 hover:text-red-200 hover:bg-red-950/35 transition-all"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>

          </section>

        </div>

        <footer className="mt-12 pt-6 border-t border-glass-border text-center">

          <p className="text-sm text-gray-500">
            UnveiledLens
          </p>

          <p className="text-xs text-gray-600 mt-1">
            Discover Beyond the Known.
          </p>

          <p className="text-xs text-gray-600 mt-2">
            © {new Date().getFullYear()} UnveiledLens. All rights reserved.
          </p>

        </footer>

      </div>

    </div>
  );
}

function ProfileRow({
  icon: Icon,
  label,
  value,
  description,
  mono = false
}) {

  return (
    <div className="flex items-start gap-4 py-2">

      <div className="h-10 w-10 rounded-xl bg-charcoal-lighter border border-glass-border flex items-center justify-center shrink-0">

        <Icon className="h-4 w-4 text-gray-400" />

      </div>

      <div className="min-w-0">

        <p className="text-xs uppercase tracking-wider text-gray-500">
          {label}
        </p>

        <p
          className={`text-sm text-white mt-1 break-all ${
            mono ? 'font-mono' : ''
          }`}
        >
          {value || 'Not available'}
        </p>

        <p className="text-xs text-gray-500 mt-1">
          {description}
        </p>

      </div>

    </div>
  );
}

