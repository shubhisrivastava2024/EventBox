import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Ticket,
  ScanLine,
  ShieldAlert,
  Calendar,
  PlusCircle,
  LogOut,
  Sparkles,
  LogIn,
  UserPlus,
  User,
  Crown,
  Headphones,
  CalendarCheck,
  ChevronDown
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, logout, quickSwitchRole, openAuthModal } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const roleConfigs = {
    customer: {
      label: 'Customer',
      icon: <User className="w-3.5 h-3.5" />,
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      activeColor: 'bg-emerald-600 text-white shadow-emerald-500/20',
      defaultTab: 'catalog'
    },
    entry_manager: {
      label: 'Entry Manager',
      icon: <ScanLine className="w-3.5 h-3.5" />,
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      activeColor: 'bg-amber-600 text-white shadow-amber-500/20',
      defaultTab: 'scanner'
    },
    support: {
      label: 'Support Exec',
      icon: <Headphones className="w-3.5 h-3.5" />,
      color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      activeColor: 'bg-cyan-600 text-white shadow-cyan-500/20',
      defaultTab: 'support'
    },
    organizer: {
      label: 'Organizer',
      icon: <CalendarCheck className="w-3.5 h-3.5" />,
      color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      activeColor: 'bg-indigo-600 text-white shadow-indigo-500/20',
      defaultTab: 'admin'
    },
    admin: {
      label: 'Platform Admin',
      icon: <Crown className="w-3.5 h-3.5" />,
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      activeColor: 'bg-purple-600 text-white shadow-purple-500/20',
      defaultTab: 'admin'
    },
  };

  const currentRoleConfig = user ? roleConfigs[user.role] || roleConfigs.customer : null;

  const handleRoleSwitch = async (roleKey) => {
    await quickSwitchRole(roleKey);
    const targetTab = roleConfigs[roleKey]?.defaultTab || 'catalog';
    setActiveTab(targetTab);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/85 backdrop-blur-md border-b border-slate-800">
      {/* 5-Role Fast Switcher Bar (Demo & Testing Helper) */}
      <div className="bg-slate-950/95 border-b border-slate-800/80 px-4 py-2 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-slate-200">5-Role Portals:</span>
          <span className="hidden sm:inline text-slate-500 text-[11px]">Click to switch instant testing session:</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {Object.entries(roleConfigs).map(([roleKey, config]) => {
            const isActive = user?.role === roleKey;
            return (
              <button
                key={roleKey}
                onClick={() => handleRoleSwitch(roleKey)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                  isActive
                    ? `${config.activeColor} shadow-md scale-105`
                    : 'bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300'
                }`}
              >
                {config.icon}
                <span>{config.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => openAuthModal('roles')}
            className="ml-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 flex items-center gap-1 transition-all"
            title="Open Role Details & Portals Modal"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Role Guide</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setActiveTab('catalog')}
          >
            <div className="bg-gradient-to-tr from-indigo-600 to-emerald-500 p-2 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                  EventPass
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Platform
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block">FastAPI + React 3-Day Ticketing Architecture</p>
            </div>
          </div>

          {/* Role-Specific Navigation Links */}
          <nav className="flex items-center gap-1 md:gap-2">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'catalog'
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Browse Events</span>
            </button>

            {(user?.role === 'customer' || user?.role === 'admin') && (
              <button
                onClick={() => setActiveTab('my-tickets')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'my-tickets'
                    ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Ticket className="w-4 h-4" />
                <span>My Tickets</span>
              </button>
            )}

            {(user?.role === 'entry_manager' || user?.role === 'admin') && (
              <button
                onClick={() => setActiveTab('scanner')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'scanner'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <ScanLine className="w-4 h-4" />
                <span>Gate Scanner</span>
              </button>
            )}

            {(user?.role === 'support' || user?.role === 'admin') && (
              <button
                onClick={() => setActiveTab('support')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'support'
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Support Hub</span>
              </button>
            )}

            {(user?.role === 'organizer' || user?.role === 'admin') && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'admin'
                    ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Manage Events</span>
              </button>
            )}
          </nav>

          {/* User Profile & Auth Controls */}
          <div className="flex items-center gap-2.5">
            {user ? (
              <div className="relative">
                <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 rounded-2xl p-1.5 pl-3">
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-bold text-slate-200 leading-tight">{user.name}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md border inline-block ${currentRoleConfig?.color}`}>
                      {currentRoleConfig?.label || user.role}
                    </span>
                  </div>

                  <button
                    onClick={() => openAuthModal('roles')}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Switch Role or Account"
                  >
                    <User className="w-4 h-4" />
                  </button>

                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 flex items-center gap-1.5 transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
