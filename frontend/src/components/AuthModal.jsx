import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  LogIn,
  UserPlus,
  ShieldCheck,
  User,
  ScanLine,
  Headphones,
  CalendarCheck,
  Crown,
  KeyRound,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export const AuthModal = ({ isOpen, onClose, defaultTab = 'login', onRoleSwitched, setToast }) => {
  const { login, signup, quickSwitchRole, user } = useAuth();
  const [tab, setTab] = useState(defaultTab); // 'login' | 'signup' | 'roles'
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState('customer');

  if (!isOpen) return null;

  const roleDefinitions = [
    {
      id: 'customer',
      title: 'Customer / Attendee',
      email: 'customer@eventbox.com',
      password: 'password123',
      icon: <User className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      desc: 'Browse event catalog, pick interactive seats, book tickets with limits, view QR passes, and request refunds.',
      defaultTab: 'catalog'
    },
    {
      id: 'entry_manager',
      title: 'Entry Manager',
      email: 'entry@eventbox.com',
      password: 'password123',
      icon: <ScanLine className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      desc: 'Scan QR ticket codes at venue gate, validate entry permissions in real-time, and detect already-used/fraudulent passes.',
      defaultTab: 'scanner'
    },
    {
      id: 'admin',
      title: 'Platform Admin',
      email: 'admin@eventbox.com',
      password: 'password123',
      icon: <Crown className="w-5 h-5 text-purple-400" />,
      color: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      desc: 'Master platform privileges: Create venues, publish events, monitor capacity, process refunds, and validate gate entry.',
      defaultTab: 'admin'
    },
    {
      id: 'support',
      title: 'Support Executive',
      email: 'support@eventbox.com',
      password: 'password123',
      icon: <Headphones className="w-5 h-5 text-cyan-400" />,
      color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      desc: 'Handle customer complaint tickets and review refund claims with automatic pre-event deadline enforcement.',
      defaultTab: 'support'
    },
    {
      id: 'organizer',
      title: 'Event Organizer',
      email: 'organizer@eventbox.com',
      password: 'password123',
      icon: <CalendarCheck className="w-5 h-5 text-indigo-400" />,
      color: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300',
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      desc: 'Publish upcoming concerts, hackathons, and workshops, configure venues, seat capacities, and ticket prices.',
      defaultTab: 'admin'
    },
  ];

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!loginEmail || !loginPassword) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(loginEmail, loginPassword);
      if (setToast) {
        setToast({
          type: 'success',
          title: 'Welcome Back!',
          message: `Logged in successfully as ${loggedUser.name} (${loggedUser.role.toUpperCase()})`
        });
      }
      if (onRoleSwitched) {
        const matchingRole = roleDefinitions.find(r => r.id === loggedUser.role);
        onRoleSwitched(matchingRole ? matchingRole.defaultTab : 'catalog');
      }
      onClose();
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!signupName || !signupEmail || !signupPassword) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const newUser = await signup(signupName, signupEmail, signupPassword, signupRole);
      if (setToast) {
        setToast({
          type: 'success',
          title: 'Account Created!',
          message: `Account created for ${newUser.name} as ${signupRole.toUpperCase()}`
        });
      }
      if (onRoleSwitched) {
        const matchingRole = roleDefinitions.find(r => r.id === signupRole);
        onRoleSwitched(matchingRole ? matchingRole.defaultTab : 'catalog');
      }
      onClose();
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Registration failed. Email might already exist.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRoleSelect = async (roleObj) => {
    setErrorMessage('');
    setLoading(true);
    try {
      await quickSwitchRole(roleObj.id);
      if (setToast) {
        setToast({
          type: 'success',
          title: 'Role Switched!',
          message: `Now operating as ${roleObj.title}`
        });
      }
      if (onRoleSwitched) {
        onRoleSwitched(roleObj.defaultTab);
      }
      onClose();
    } catch (err) {
      setErrorMessage('Failed to switch role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (email, pass) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setTab('login');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Glow Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-slate-800 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-purple-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 shadow-inner">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  EventPass Portal Access
                </h3>
                <p className="text-xs text-slate-400">
                  Select a role portal or authenticate with your account credentials
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-5 bg-slate-950/60 p-1 rounded-2xl border border-slate-800/80">
            <button
              onClick={() => { setTab('roles'); setErrorMessage(''); }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                tab === 'roles'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Role Portals (5 Roles)</span>
            </button>
            <button
              onClick={() => { setTab('login'); setErrorMessage(''); }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                tab === 'login'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => { setTab('signup'); setErrorMessage(''); }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                tab === 'signup'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up / Register</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6">
          {/* TAB 1: 5 ROLE PORTALS SELECTOR */}
          {tab === 'roles' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Instant Role Logins & Capabilities
                </span>
                <span className="text-[11px] text-slate-500">1-Click Instant Login</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {roleDefinitions.map((roleObj) => {
                  const isActive = user?.role === roleObj.id;
                  return (
                    <div
                      key={roleObj.id}
                      className={`relative rounded-2xl p-4 border transition-all hover:scale-[1.01] flex flex-col justify-between ${
                        isActive
                          ? 'border-indigo-500/80 bg-indigo-950/30 ring-1 ring-indigo-500/40'
                          : 'border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-900/80'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-2 rounded-xl border ${roleObj.color}`}>
                              {roleObj.icon}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                                {roleObj.title}
                                {isActive && (
                                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-semibold">
                                    Active
                                  </span>
                                )}
                              </h4>
                              <p className="text-[11px] text-slate-400">{roleObj.email}</p>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed">
                          {roleObj.desc}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => fillCredentials(roleObj.email, roleObj.password)}
                          className="text-[11px] text-slate-400 hover:text-indigo-300 transition-colors"
                        >
                          Fill Form
                        </button>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => handleQuickRoleSelect(roleObj)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            isActive
                              ? 'bg-slate-800 text-slate-300'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                          }`}
                        >
                          <span>{isActive ? 'Current Role' : `Login as ${roleObj.title.split('/')[0]}`}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SIGN IN FORM */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. customer@eventbox.com"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">Password</label>
                  <span className="text-[11px] text-slate-500">Default demo: password123</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Quick Fill Chips */}
              <div className="pt-2">
                <span className="block text-[11px] font-semibold text-slate-400 mb-2">
                  Quick Fill Preset Role Credentials:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {roleDefinitions.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => fillCredentials(r.email, r.password)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 text-slate-300 flex items-center gap-1.5 transition-all"
                    >
                      <span>{r.title.split('/')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Sign In to Account</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-center text-xs text-slate-500 pt-2">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => { setTab('signup'); setErrorMessage(''); }}
                  className="text-indigo-400 hover:underline font-semibold"
                >
                  Create one now
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: SIGN UP / REGISTRATION FORM */}
          {tab === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="e.g. alex@example.com"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Create a strong password"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Role Picker */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Select Account Role / Permission Level:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {roleDefinitions.map((r) => {
                    const isSelected = signupRole === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSignupRole(r.id)}
                        className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-600/15 ring-1 ring-indigo-500'
                            : 'border-slate-800 bg-slate-950 hover:border-slate-700 hover:bg-slate-900/50'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <div className={`p-1.5 rounded-lg border ${r.color}`}>
                            {r.icon}
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-white">{r.title.split('/')[0]}</div>
                          <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{r.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Register as {signupRole.toUpperCase()}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-center text-xs text-slate-500 pt-2">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => { setTab('login'); setErrorMessage(''); }}
                  className="text-indigo-400 hover:underline font-semibold"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
