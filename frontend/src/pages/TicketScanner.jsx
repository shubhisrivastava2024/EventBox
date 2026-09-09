import React, { useState } from 'react';
import { ticketAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  ShieldCheck,
  UserCheck,
  Calendar,
  MapPin,
  Sparkles,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const TicketScanner = ({ setToast }) => {
  const { user, quickSwitchRole } = useAuth();
  const [ticketCode, setTicketCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const isAuthorized = user?.role === 'entry_manager' || user?.role === 'admin';

  const handleValidate = async (codeToTest) => {
    const code = codeToTest || ticketCode;
    if (!code.trim()) {
      setToast({ type: 'warning', title: 'Input Required', message: 'Please enter a ticket code.' });
      return;
    }

    setLoading(true);
    try {
      const res = await ticketAPI.validate(code);
      setScanResult(res.data);
      if (res.data.success) {
        setToast({ type: 'success', title: 'Valid Ticket', message: 'Access granted! Ticket status updated to USED.' });
      } else {
        setToast({ type: 'error', title: 'Validation Warning', message: res.data.message });
      }
    } catch (err) {
      console.error("Validation error:", err);
      const msg = err.response?.data?.detail || 'Error validating ticket.';
      setScanResult({
        success: false,
        status: 'invalid',
        message: msg,
        ticket_code: code
      });
      setToast({ type: 'error', title: 'Error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      {/* Role Notice if not authorized */}
      {!isAuthorized && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-200 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="font-bold">Entry Manager permissions required</p>
              <p className="text-amber-300/80 text-[11px]">
                You are currently logged in as <span className="font-semibold uppercase">{user?.role || 'Guest'}</span>. Switch to Entry Manager to validate tickets.
              </p>
            </div>
          </div>
          <button
            onClick={() => quickSwitchRole('entry_manager')}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0"
          >
            <span>Switch to Entry Manager</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4 text-center relative overflow-hidden">
        <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20">
          <ScanLine className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-white">Entry Manager Scanner Interface</h1>
          <p className="text-xs text-slate-400">Validate digital tickets at venue gates. Instant status updates (Valid ➔ Used).</p>
        </div>

        {/* Quick Sample Ticket Buttons for Hackathon Demo */}
        <div className="pt-2 flex items-center justify-center gap-2 flex-wrap text-xs">
          <span className="text-slate-500 font-semibold">Test Sample Codes:</span>
          <button
            onClick={() => { setTicketCode('TCK-DEMO-001'); handleValidate('TCK-DEMO-001'); }}
            className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 text-indigo-400 font-mono border border-slate-800 font-semibold"
          >
            TCK-DEMO-001
          </button>
          <button
            onClick={() => { setTicketCode('TCK-DEMO-002'); handleValidate('TCK-DEMO-002'); }}
            className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 text-indigo-400 font-mono border border-slate-800 font-semibold"
          >
            TCK-DEMO-002
          </button>
          <button
            onClick={() => { setTicketCode('TCK-INVALID-999'); handleValidate('TCK-INVALID-999'); }}
            className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 text-rose-400 font-mono border border-slate-800 font-semibold"
          >
            INVALID-CODE
          </button>
        </div>
      </div>

      {/* Input Scanner Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4">
        <label className="text-xs font-bold text-slate-300 block uppercase tracking-wider">Enter Ticket Code / Scan Barcode</label>
        
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="e.g. TCK-8F3A2 or TCK-DEMO-001"
              value={ticketCode}
              onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-base font-mono uppercase text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <button
            onClick={() => handleValidate()}
            disabled={loading}
            className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 shrink-0 disabled:opacity-50"
          >
            <ScanLine className="w-4 h-4" />
            <span>Validate</span>
          </button>
        </div>
      </div>

      {/* Scan Result Feedback Screen */}
      {scanResult && (
        <div className={`p-6 md:p-8 rounded-3xl border shadow-2xl space-y-6 animate-fade-in ${
          scanResult.success
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100'
            : scanResult.status === 'used'
            ? 'bg-amber-950/40 border-amber-500/40 text-amber-100'
            : 'bg-rose-950/40 border-rose-500/40 text-rose-100'
        }`}>
          {/* Header Status Banner */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {scanResult.success ? (
                <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              ) : scanResult.status === 'used' ? (
                <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-400 border border-amber-500/30">
                  <AlertTriangle className="w-8 h-8" />
                </div>
              ) : (
                <div className="p-3 bg-rose-500/20 rounded-2xl text-rose-400 border border-rose-500/30">
                  <XCircle className="w-8 h-8" />
                </div>
              )}

              <div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                  scanResult.success
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : scanResult.status === 'used'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}>
                  STATUS: {scanResult.status?.toUpperCase()}
                </span>
                <h2 className="text-xl font-black mt-1">{scanResult.message}</h2>
              </div>
            </div>
          </div>

          {/* Detailed Verification Breakdown */}
          {scanResult.ticket_code && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80 text-xs">
              <div className="space-y-1 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Ticket Code</span>
                <span className="font-mono font-bold text-indigo-400 text-sm">{scanResult.ticket_code}</span>
              </div>

              {scanResult.seat_number && (
                <div className="space-y-1 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned Seat</span>
                  <span className="font-bold text-slate-200 text-sm">Seat {scanResult.seat_number}</span>
                </div>
              )}

              {scanResult.event_name && (
                <div className="space-y-1 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Event</span>
                  <span className="font-semibold text-slate-200">{scanResult.event_name}</span>
                </div>
              )}

              {scanResult.user_name && (
                <div className="space-y-1 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Ticket Holder</span>
                  <span className="font-semibold text-slate-200">{scanResult.user_name}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
