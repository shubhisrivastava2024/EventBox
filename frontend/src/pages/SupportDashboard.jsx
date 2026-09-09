import React, { useState, useEffect } from 'react';
import { supportAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  DollarSign,
  Loader2,
  Sparkles,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export const SupportDashboard = ({ setToast }) => {
  const { user, quickSwitchRole } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const isAuthorized = user?.role === 'support' || user?.role === 'admin';

  useEffect(() => {
    if (isAuthorized) {
      fetchCases();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await supportAPI.getCases();
      setCases(res.data);
    } catch (err) {
      console.error("Error fetching support cases:", err);
      if (isAuthorized) {
        setToast({ type: 'error', title: 'Error', message: 'Failed to load support cases.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (caseId, action) => {
    setProcessingId(caseId);
    try {
      const res = await supportAPI.approveRefund({
        case_id: caseId,
        action: action, // approve | reject
        notes: action === 'approve' ? 'Refund approved by support executive.' : 'Refund rejected.'
      });
      setToast({
        type: action === 'approve' ? 'success' : 'info',
        title: action === 'approve' ? 'Refund Approved' : 'Case Closed',
        message: res.data.message
      });
      fetchCases();
    } catch (err) {
      console.error("Refund action error:", err);
      const msg = err.response?.data?.detail || 'Failed to process refund decision.';
      setToast({ type: 'error', title: 'Action Failed', message: msg });
      fetchCases();
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Role Notice if not authorized */}
      {!isAuthorized && (
        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-cyan-200 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-cyan-400 shrink-0" />
            <div>
              <p className="font-bold">Support Executive permissions required</p>
              <p className="text-cyan-300/80 text-[11px]">
                You are currently logged in as <span className="font-semibold uppercase">{user?.role || 'Guest'}</span>. Switch to Support Executive or Admin to resolve cases and process refunds.
              </p>
            </div>
          </div>
          <button
            onClick={() => quickSwitchRole('support')}
            className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0"
          >
            <span>Switch to Support Exec</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-cyan-500/10 text-cyan-400 rounded-2xl flex items-center justify-center border border-cyan-500/20 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Support Executive Dashboard</h1>
            <p className="text-xs text-slate-400">Review refund requests and enforcement of pre-event date cancellation policy.</p>
          </div>
        </div>

        {isAuthorized && (
          <button
            onClick={fetchCases}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700"
          >
            Refresh Cases List
          </button>
        )}
      </div>

      {/* Rules Notice */}
      <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-200 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-slate-100">Business Rule Automated Enforcement</span>
          <span>
            Approving a refund marks Order = <strong>refunded</strong>, Ticket = <strong>cancelled</strong>, and frees the booked seat back to <strong>available</strong> status for new customers. Refunds requested after the event date are automatically blocked.
          </span>
        </div>
      </div>

      {/* Cases Table / Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
          <p className="text-sm font-medium">Loading support tickets...</p>
        </div>
      ) : !isAuthorized ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
          <ShieldAlert className="w-12 h-12 text-cyan-500/60 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">Restricted to Support & Admin Roles</h3>
          <p className="text-slate-400 text-xs max-w-md mx-auto">
            Please log in with a Support Executive or Admin account to access customer claims and refund operations.
          </p>
          <div className="pt-2">
            <button
              onClick={() => quickSwitchRole('support')}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-lg shadow-cyan-600/20"
            >
              <span>Instant Login as Support Rep</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : cases.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-2">
          <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-300">No support cases submitted</h3>
          <p className="text-slate-500 text-xs">Customer refund requests will show up here automatically.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {cases.map((c) => {
            const isEventFuture = new Date(c.event_date) > new Date();

            return (
              <div
                key={c.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-700 transition-all"
              >
                {/* Info Section */}
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-mono text-slate-400 font-bold">Case #{c.id}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-950 text-indigo-400 border border-slate-800 font-bold">
                      Order #{c.order_id}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                      c.status === 'open'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : c.status === 'resolved'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {c.status.toUpperCase()}
                    </span>

                    {/* Rule Badge */}
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                      isEventFuture
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                    }`}>
                      {isEventFuture ? '✓ Pre-Event Date (Eligible)' : '✗ Event Date Passed (Ineligible)'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-white">{c.event_name}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-slate-400 pt-1">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>User: <strong>{c.user_name}</strong> ({c.user_email})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Event Date: <strong>{new Date(c.event_date).toLocaleDateString()}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                        <span>Order Total: <strong>${c.order_total.toFixed(2)}</strong></span>
                      </div>
                    </div>
                  </div>

                  {c.resolution_notes && (
                    <p className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                      <strong className="text-slate-300">Notes / Reason:</strong> {c.resolution_notes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                {c.status === 'open' && (
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => handleAction(c.id, 'reject')}
                      disabled={processingId === c.id}
                      className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-rose-400 border border-slate-800 font-bold text-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>

                    <button
                      onClick={() => handleAction(c.id, 'approve')}
                      disabled={processingId === c.id}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {processingId === c.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      <span>Approve Refund (${c.order_total.toFixed(2)})</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
