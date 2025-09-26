import React, { useMemo, useState, useEffect } from 'react';
import { buses } from '../data/buses';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

const normalizePhone = (p) => {
  const raw = (p || '').toString().trim();
  if (!raw) return '';
  if (raw.startsWith('+')) return raw.replace(/\s+/g, '');
  const digits = raw.replace(/[^0-9]/g, '').replace(/^0+/, '');
  // Default to +91 if 10-digit
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits}`;
};

const Sms = () => {
  // Build options from buses.js
  const routes = useMemo(() => {
    const set = new Set(buses.map(b => b.route));
    return Array.from(set);
  }, []);

  const allStarts = useMemo(() => {
    const set = new Set(buses.map(b => b.start));
    return Array.from(set);
  }, []);

  const allDestinations = useMemo(() => {
    const set = new Set(buses.map(b => b.destination));
    return Array.from(set);
  }, []);

  const [route, setRoute] = useState('');
  const [currentStop, setCurrentStop] = useState('');
  const [destinationStop, setDestinationStop] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sending, setSending] = useState(false);

  const [currentStopsOptions, setCurrentStopsOptions] = useState(allStarts);
  const [destinationStopsOptions, setDestinationStopsOptions] = useState(allDestinations);

  useEffect(() => {
    // Filter stops based on selected route, or show all when no route selected
    if (route) {
      const filtered = buses.filter(b => b.route === route);
      const starts = Array.from(new Set(filtered.map(b => b.start)));
      const dests = Array.from(new Set(filtered.map(b => b.destination)));
      setCurrentStopsOptions(starts.length ? starts : allStarts);
      setDestinationStopsOptions(dests.length ? dests : allDestinations);
      // Reset stops if they are no longer in options
      if (starts.length && !starts.includes(currentStop)) setCurrentStop('');
      if (dests.length && !dests.includes(destinationStop)) setDestinationStop('');
    } else {
      setCurrentStopsOptions(allStarts);
      setDestinationStopsOptions(allDestinations);
    }
  }, [route, allStarts, allDestinations]);

  const canSend = route && currentStop && destinationStop && phone && !sending;

  const preview = `ETA ${route || '<route>'} ${currentStop || '<current_stop>'} ${destinationStop || '<destination_stop>'}`;

  const handleSend = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (!route || !currentStop || !destinationStop) {
      setError('Please fill Route, Current Stop, and Destination Stop.');
      return;
    }
    const phoneNorm = normalizePhone(phone);
    if (!phoneNorm) {
      setError('Please enter a valid phone number (e.g., +91 98765 43210).');
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`${BACKEND_URL}/send-sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneNorm,
          route,
          currentStop,
          destinationStop,
          // eta is optional; omit for now
        })
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Failed to send SMS');
      setSuccess('SMS sent successfully!');
    } catch (err) {
      setError(err?.message || 'Failed to send SMS');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">SMS ETA Request</h1>
          <p className="text-sm text-gray-500 mb-6">Get the latest ETA via a simple text message.</p>

          <form onSubmit={handleSend} className="space-y-5">
            {/* Route */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Route <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                value={route}
                onChange={(e) => setRoute(e.target.value)}
              >
                <option value="">Select a route</option>
                {routes.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Current Stop */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Stop <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                value={currentStop}
                onChange={(e) => setCurrentStop(e.target.value)}
              >
                <option value="">Select current stop</option>
                {currentStopsOptions.map((s) => (
                  <option key={`c-${s}`} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Destination Stop */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination Stop <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                value={destinationStop}
                onChange={(e) => setDestinationStop(e.target.value)}
              >
                <option value="">Select destination stop</option>
                {destinationStopsOptions.map((s) => (
                  <option key={`d-${s}`} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Phone (required) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone <span className="text-red-500">*</span></label>
              <input
                type="tel"
                inputMode="tel"
                placeholder="e.g. +91 98765 43210"
                className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Preview */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-gray-800">
              <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Preview</div>
              <div className="font-mono text-sm break-words">{preview}</div>
            </div>

            {/* Error */}
            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}

            {/* Success */}
            {success && (
              <div className="text-sm text-green-600">{success}</div>
            )}

            {/* Actions */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!canSend}
                className={`w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-white font-medium shadow transition-colors 
                ${canSend ? 'bg-green-600 hover:bg-green-700' : 'bg-green-300 cursor-not-allowed'}`}
              >
                {sending ? 'Sending...' : 'Send SMS'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Sms;
