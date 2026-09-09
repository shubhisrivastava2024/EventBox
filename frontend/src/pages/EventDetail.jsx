import React, { useState, useEffect } from 'react';
import { eventAPI } from '../api/client';
import { ArrowLeft, Calendar, MapPin, Ticket, ShieldAlert, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export const EventDetail = ({ eventId, onBack, onProceedToCheckout, setToast }) => {
  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventData();
  }, [eventId]);

  const fetchEventData = async () => {
    setLoading(true);
    try {
      const [evtRes, seatsRes] = await Promise.all([
        eventAPI.getById(eventId),
        eventAPI.getSeats(eventId)
      ]);
      setEvent(evtRes.data);
      setSeats(seatsRes.data);
    } catch (err) {
      console.error("Error fetching event details:", err);
      setToast({ type: 'error', title: 'Error', message: 'Failed to load event details.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat) => {
    if (seat.status === 'booked') return;

    if (selectedSeatIds.includes(seat.id)) {
      setSelectedSeatIds(prev => prev.filter(id => id !== seat.id));
    } else {
      // Check Core Business Rule #1: Max tickets per user limit
      if (selectedSeatIds.length >= event.max_tickets_per_user) {
        setToast({
          type: 'warning',
          title: 'Limit Reached',
          message: `Maximum allowed tickets for this event is ${event.max_tickets_per_user} seats per booking.`
        });
        return;
      }
      setSelectedSeatIds(prev => [...prev, seat.id]);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm font-medium">Loading seat map & event info...</p>
      </div>
    );
  }

  if (!event) return null;

  const totalCost = selectedSeatIds.length * event.ticket_price;
  const selectedSeatsList = seats.filter(s => selectedSeatIds.includes(s.id));

  return (
    <div className="space-y-8 pb-12">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-semibold transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Events Catalog</span>
      </button>

      {/* Event Overview Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20">
                {event.category}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                {event.available_seats_count} Available Seats
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-white">{event.name}</h1>
          </div>

          <div className="text-left md:text-right bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 shrink-0">
            <span className="text-xs text-slate-400 font-medium block">Ticket Price</span>
            <span className="text-3xl font-black text-white">${event.ticket_price.toFixed(2)}</span>
            <span className="text-[10px] text-indigo-400 block mt-0.5 font-semibold">Max {event.max_tickets_per_user} / user</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>Date & Time: <strong>{new Date(event.event_date).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Venue: <strong>{event.venue_name}, {event.city}</strong></span>
          </div>
        </div>
      </div>

      {/* Seat Map Selection Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Interactive Layout (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-lg text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>Select Your Seats</span>
            </h2>
            <span className="text-xs text-slate-400">Click available seat to select</span>
          </div>

          {/* Stage Graphic */}
          <div className="w-full bg-slate-950 py-3 rounded-2xl border border-slate-800 text-center">
            <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">STAGE / SCREEN FRONT</span>
          </div>

          {/* Seat Grid */}
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 sm:gap-3 py-4">
            {seats.map((seat) => {
              const isSelected = selectedSeatIds.includes(seat.id);
              const isBooked = seat.status === 'booked';

              return (
                <button
                  key={seat.id}
                  onClick={() => handleSeatClick(seat)}
                  disabled={isBooked}
                  className={`p-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all ${
                    isBooked
                      ? 'bg-slate-950/60 text-slate-600 border border-slate-900 cursor-not-allowed'
                      : isSelected
                      ? 'bg-gradient-to-br from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-105 border border-indigo-400'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <Ticket className="w-4 h-4 mb-1 opacity-80" />
                  <span>{seat.seat_number}</span>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-slate-800 border border-slate-700" />
              <span className="text-slate-400">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-indigo-500" />
              <span className="text-slate-200 font-medium">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-slate-950 border border-slate-900" />
              <span className="text-slate-500">Booked</span>
            </div>
          </div>
        </div>

        {/* Booking Summary Sidebar (1 Col) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-white border-b border-slate-800 pb-3">Booking Summary</h3>

            {/* Selected Seats List */}
            {selectedSeatsList.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs space-y-2">
                <Ticket className="w-8 h-8 mx-auto text-slate-600" />
                <p>No seats selected yet.</p>
                <p className="text-[11px] text-slate-600">You can select up to {event.max_tickets_per_user} seats.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-400">Selected Seats ({selectedSeatsList.length}):</span>
                <div className="flex flex-wrap gap-2">
                  {selectedSeatsList.map(s => (
                    <span key={s.id} className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 font-bold text-xs border border-indigo-500/30">
                      Seat {s.seat_number}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Rule Callout */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Ticket Limit Rule</span>
              </div>
              <p>Max {event.max_tickets_per_user} tickets allowed per user for this event.</p>
            </div>
          </div>

          {/* Pricing & Proceed */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal ({selectedSeatsList.length} seat):</span>
                <span>${totalCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Service Fee:</span>
                <span className="text-emerald-400 font-bold">FREE</span>
              </div>
              <div className="flex justify-between text-slate-100 font-black text-lg pt-2 border-t border-slate-800">
                <span>Total Amount:</span>
                <span className="text-indigo-400">${totalCost.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => onProceedToCheckout(event, selectedSeatsList)}
              disabled={selectedSeatsList.length === 0}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                selectedSeatsList.length > 0
                  ? 'bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white shadow-xl shadow-indigo-600/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Proceed to Payment (${totalCost.toFixed(2)})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
