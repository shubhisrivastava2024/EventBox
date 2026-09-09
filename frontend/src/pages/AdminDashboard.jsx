import React, { useState, useEffect } from 'react';
import { venueAPI, eventAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  PlusCircle,
  Building2,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  ArrowRight,
  Crown
} from 'lucide-react';

export const AdminDashboard = ({ setToast, onEventCreated }) => {
  const { user, quickSwitchRole } = useAuth();
  const [venues, setVenues] = useState([]);
  const [loadingVenues, setLoadingVenues] = useState(true);

  const isAuthorized = user?.role === 'organizer' || user?.role === 'admin';

  // Venue form state
  const [venueForm, setVenueForm] = useState({
    name: '',
    city: '',
    address: '',
    total_capacity: 50
  });
  const [creatingVenue, setCreatingVenue] = useState(false);

  // Event form state
  const [eventForm, setEventForm] = useState({
    venue_id: '',
    name: '',
    category: 'Tech',
    event_date: '',
    ticket_price: 49.99,
    max_tickets_per_user: 5,
    total_seats_to_generate: 30
  });
  const [creatingEvent, setCreatingEvent] = useState(false);

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    setLoadingVenues(true);
    try {
      const res = await venueAPI.getAll();
      setVenues(res.data);
      if (res.data.length > 0 && !eventForm.venue_id) {
        setEventForm(prev => ({ ...prev, venue_id: res.data[0].id }));
      }
    } catch (err) {
      console.error("Error fetching venues:", err);
    } finally {
      setLoadingVenues(false);
    }
  };

  const handleCreateVenue = async (e) => {
    e.preventDefault();
    setCreatingVenue(true);
    try {
      const res = await venueAPI.create(venueForm);
      setToast({
        type: 'success',
        title: 'Venue Created',
        message: `Successfully created venue '${res.data.name}' with capacity ${res.data.total_capacity}`
      });
      setVenueForm({ name: '', city: '', address: '', total_capacity: 50 });
      fetchVenues();
    } catch (err) {
      console.error("Create venue error:", err);
      const msg = err.response?.data?.detail || 'Failed to create venue.';
      setToast({ type: 'error', title: 'Error', message: msg });
    } finally {
      setCreatingVenue(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!eventForm.venue_id) {
      setToast({ type: 'warning', title: 'Venue Required', message: 'Please select or create a venue first.' });
      return;
    }

    setCreatingEvent(true);
    try {
      const payload = {
        ...eventForm,
        venue_id: parseInt(eventForm.venue_id),
        ticket_price: parseFloat(eventForm.ticket_price),
        max_tickets_per_user: parseInt(eventForm.max_tickets_per_user),
        total_seats_to_generate: parseInt(eventForm.total_seats_to_generate)
      };

      const res = await eventAPI.create(payload);
      setToast({
        type: 'success',
        title: 'Event Published!',
        message: `Event '${res.data.name}' published and ${res.data.total_seats_count} seats automatically generated!`
      });
      
      setEventForm({
        venue_id: venues[0]?.id || '',
        name: '',
        category: 'Tech',
        event_date: '',
        ticket_price: 49.99,
        max_tickets_per_user: 5,
        total_seats_to_generate: 30
      });
      if (onEventCreated) onEventCreated();
    } catch (err) {
      console.error("Create event error:", err);
      const msg = err.response?.data?.detail || 'Failed to publish event.';
      setToast({ type: 'error', title: 'Error', message: msg });
    } finally {
      setCreatingEvent(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Role Notice if not authorized */}
      {!isAuthorized && (
        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-purple-200 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-purple-400 shrink-0" />
            <div>
              <p className="font-bold">Organizer or Admin permissions required</p>
              <p className="text-purple-300/80 text-[11px]">
                You are currently logged in as <span className="font-semibold uppercase">{user?.role || 'Guest'}</span>. Switch to Organizer or Admin to create venues and publish events.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => quickSwitchRole('organizer')}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0"
            >
              <span>Switch to Organizer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => quickSwitchRole('admin')}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0"
            >
              <span>Switch to Admin</span>
              <Crown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex items-center gap-4">
        <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center border border-purple-500/20 shrink-0">
          <PlusCircle className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">Organizer & Admin Management Console</h1>
          <p className="text-xs text-slate-400">Add event venues and publish upcoming events with automatic seat layout generation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form 1: Add Venue */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <h2 className="font-extrabold text-lg text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-400" />
            <span>Add New Venue</span>
          </h2>

          <form onSubmit={handleCreateVenue} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Venue Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Silicon Valley Auditorium"
                value={venueForm.name}
                onChange={(e) => setVenueForm({ ...venueForm, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">City</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. San Francisco"
                  value={venueForm.city}
                  onChange={(e) => setVenueForm({ ...venueForm, city: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Total Capacity</label>
                <input
                  type="number"
                  required
                  min="5"
                  max="500"
                  value={venueForm.total_capacity}
                  onChange={(e) => setVenueForm({ ...venueForm, total_capacity: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Street Address</label>
              <input
                type="text"
                required
                placeholder="e.g. 100 Tech Way, Suite 400"
                value={venueForm.address}
                onChange={(e) => setVenueForm({ ...venueForm, address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={creatingVenue || !isAuthorized}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {creatingVenue ? <Loader2 className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
              <span>Save Venue</span>
            </button>
          </form>
        </div>

        {/* Form 2: Create Event */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <h2 className="font-extrabold text-lg text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <span>Publish New Event</span>
          </h2>

          <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Select Venue</label>
              <select
                value={eventForm.venue_id}
                onChange={(e) => setEventForm({ ...eventForm, venue_id: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              >
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.city} - Max {v.total_capacity} seats)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Event Title</label>
              <input
                type="text"
                required
                placeholder="e.g. AI Developers Summit 2026"
                value={eventForm.name}
                onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Category</label>
                <select
                  value={eventForm.category}
                  onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                >
                  {['Tech', 'Conference', 'Workshop', 'Music', 'Sports'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Event Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={eventForm.event_date}
                  onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Ticket Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={eventForm.ticket_price}
                  onChange={(e) => setEventForm({ ...eventForm, ticket_price: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Max/User Limit</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={eventForm.max_tickets_per_user}
                  onChange={(e) => setEventForm({ ...eventForm, max_tickets_per_user: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Seats to Generate</label>
                <input
                  type="number"
                  min="5"
                  max="200"
                  required
                  value={eventForm.total_seats_to_generate}
                  onChange={(e) => setEventForm({ ...eventForm, total_seats_to_generate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={creatingEvent || !isAuthorized}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {creatingEvent ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
              <span>Publish Event & Auto-Generate Seats</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
