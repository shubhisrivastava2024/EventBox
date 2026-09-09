import React, { useState } from 'react';
import { orderAPI } from '../api/client';
import { ArrowLeft, CreditCard, QrCode, ShieldCheck, CheckCircle2, Loader2, Sparkles, Ticket } from 'lucide-react';

export const Checkout = ({ checkoutData, onBack, onBookingSuccess, setToast }) => {
  const { event, selectedSeats } = checkoutData;
  const [paymentMode, setPaymentMode] = useState('credit_card');
  const [processing, setProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  const totalAmount = selectedSeats.length * event.ticket_price;

  const handleSimulatePayment = async () => {
    setProcessing(true);
    try {
      // Add brief artificial delay to simulate live payment gateway handshake
      await new Promise(resolve => setTimeout(resolve, 1200));

      const payload = {
        event_id: event.id,
        seat_ids: selectedSeats.map(s => s.id),
        payment_mode: paymentMode
      };

      const res = await orderAPI.checkout(payload);
      setCompletedOrder(res.data);
      setToast({
        type: 'success',
        title: 'Booking Confirmed!',
        message: `Successfully booked ${selectedSeats.length} seat(s) for ${event.name}`
      });
    } catch (err) {
      console.error("Checkout error:", err);
      const msg = err.response?.data?.detail || 'Failed to process payment. Please try again.';
      setToast({
        type: 'error',
        title: 'Checkout Failed',
        message: msg
      });
    } finally {
      setProcessing(false);
    }
  };

  if (completedOrder) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-8">
        <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Payment Successful</span>
            <h1 className="text-2xl font-black text-white">Order Confirmed!</h1>
            <p className="text-xs text-slate-400">Order ID: #{completedOrder.id} • {new Date(completedOrder.booking_time).toLocaleString()}</p>
          </div>

          {/* Ticket Badges */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Your Digital Ticket Passes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {completedOrder.tickets.map((t) => (
                <div key={t.ticket_id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-slate-500 block">Seat {t.seat_number}</span>
                    <span className="font-mono text-xs font-black text-indigo-400 block">{t.ticket_code}</span>
                    <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                      {t.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-slate-300">
                    <QrCode className="w-8 h-8" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={onBookingSuccess}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-600/30"
            >
              View My Tickets Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Modify Seat Selection</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Payment Options (2 Cols) */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <h2 className="font-extrabold text-xl text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            <span>Simulated Payment Gateway</span>
          </h2>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-400 block">Select Payment Mode</label>
            
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'credit_card', label: 'Credit / Debit Card', icon: '💳', sub: 'Instant confirmation' },
                { id: 'upi', label: 'UPI / Instant QR', icon: '📱', sub: 'GPay, PhonePe, Paytm' },
                { id: 'netbanking', label: 'NetBanking', icon: '🏦', sub: 'All major banks supported' },
              ].map((mode) => (
                <div
                  key={mode.id}
                  onClick={() => setPaymentMode(mode.id)}
                  className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                    paymentMode === mode.id
                      ? 'bg-indigo-600/10 border-indigo-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{mode.icon}</span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">{mode.label}</h4>
                      <p className="text-[11px] text-slate-500">{mode.sub}</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMode === mode.id}
                    onChange={() => setPaymentMode(mode.id)}
                    className="accent-indigo-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs text-slate-400 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-slate-200 block">256-Bit Encrypted Hackathon Simulation</span>
              <span>No real money will be charged. Payment is simulated for demo purposes.</span>
            </div>
          </div>
        </div>

        {/* Summary Sidebar (1 Col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-white border-b border-slate-800 pb-3">Order Details</h3>
            
            <div className="space-y-2">
              <span className="text-xs font-bold text-indigo-400 block">{event.name}</span>
              <p className="text-[11px] text-slate-400">{new Date(event.event_date).toLocaleString()}</p>
              <p className="text-[11px] text-slate-400">{event.venue_name}</p>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">Booked Seats ({selectedSeats.length}):</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedSeats.map(s => (
                  <span key={s.id} className="px-2.5 py-1 rounded bg-indigo-950 text-indigo-300 font-bold text-xs border border-indigo-800">
                    {s.seat_number}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex justify-between items-center text-sm font-black text-white">
              <span>Total Payable:</span>
              <span className="text-xl text-emerald-400">${totalAmount.toFixed(2)}</span>
            </div>

            <button
              onClick={handleSimulatePayment}
              disabled={processing}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Pay & Generate Tickets</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
