import React, { useState, useEffect } from 'react';
import { ticketAPI, supportAPI } from '../api/client';
import { Ticket, QrCode, Calendar, MapPin, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';

export const MyTickets = ({ setToast }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestingRefundOrderId, setRequestingRefundOrderId] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await ticketAPI.getMyTickets();
      setTickets(res.data);
    } catch (err) {
      console.error("Error fetching my tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRefund = async (orderId) => {
    setRequestingRefundOrderId(orderId);
    try {
      await supportAPI.createCase({
        order_id: orderId,
        type: 'refund_request',
        reason: 'Customer initiated refund request from My Tickets portal.'
      });
      setToast({
        type: 'success',
        title: 'Refund Request Submitted',
        message: 'Support case created. Our support team will review your refund request shortly.'
      });
    } catch (err) {
      console.error("Refund request error:", err);
      const msg = err.response?.data?.detail || 'Failed to submit refund request.';
      setToast({ type: 'error', title: 'Request Error', message: msg });
    } finally {
      setRequestingRefundOrderId(null);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-500/20 shrink-0">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">My Digital Ticket Passes</h1>
            <p className="text-xs text-slate-400">View your active ticket passes, present QR codes at entry, or request pre-event refunds.</p>
          </div>
        </div>

        <button
          onClick={fetchTickets}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
        >
          Refresh Passes
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Fetching ticket passes...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
          <Ticket className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-300">No tickets found</h3>
          <p className="text-slate-500 text-xs">Browse upcoming events and book your seats to view digital passes here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tickets.map((t) => {
            const isEventFuture = t.event_date ? new Date(t.event_date) > new Date() : false;

            return (
              <div
                key={t.ticket_id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl relative overflow-hidden"
              >
                <div className="space-y-4">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-slate-500">ORDER #{t.order_id}</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                      t.status === 'valid'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : t.status === 'used'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {t.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Title & Details */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-xl text-white">{t.event_name}</h3>
                    <div className="space-y-1 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{t.event_date ? new Date(t.event_date).toLocaleString() : 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pass Visual Card */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Assigned Seat</span>
                      <span className="text-base font-black text-white block">Seat {t.seat_number}</span>
                      <span className="text-xs font-mono text-indigo-400 font-bold block mt-1">{t.ticket_code}</span>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-slate-300">
                      <QrCode className="w-10 h-10" />
                    </div>
                  </div>
                </div>

                {/* Footer Action for Refund */}
                {t.status === 'valid' && isEventFuture && (
                  <div className="pt-4 border-t border-slate-800/80">
                    <button
                      onClick={() => handleRequestRefund(t.order_id)}
                      disabled={requestingRefundOrderId === t.order_id}
                      className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      {requestingRefundOrderId === t.order_id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      ) : (
                        <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span>Request Order Refund</span>
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
