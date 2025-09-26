import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { buses as allBuses } from '../data/buses';
import Header from '../components/Header';
import MobileNav from '../components/MobileNav';
import { Home, MapPin, Clock, Activity } from 'lucide-react';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const SearchResults = () => {
  const navigate = useNavigate();
  const query = useQuery().get('q')?.trim() || '';

  const filtered = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return allBuses
      .filter(b =>
        b.route.toLowerCase().includes(q) ||
        (b.start || '').toLowerCase().includes(q) ||
        (b.destination || '').toLowerCase().includes(q)
      )
      .sort((a, b) => a.route.localeCompare(b.route));
  }, [query]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-16">
      <Header />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Search Results{query ? ` for "${query}"` : ''}
          </h1>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white ring-1 ring-gray-200 text-gray-700 hover:bg-gray-50"
          >
            <Home className="w-4 h-4" /> Home
          </button>
          <MobileNav />
    </div>

        {query && (
          <div className="text-sm text-gray-600 mb-4">
            {filtered.length > 0 ? `${filtered.length} result${filtered.length > 1 ? 's' : ''} found` : 'No results'}
          </div>
        )}

        {filtered.length > 0 && (
          <div className="bg-white rounded-2xl shadow p-2 sm:p-4">
            <ul className="divide-y divide-gray-100">
              {filtered.map((b) => {
                const eta = typeof b.etaMin === 'number' ? `${b.etaMin} min` : (b.eta || '—');
                const occ = typeof b.occupancy === 'number' ? `${b.occupancy}%` : '—';
                const status = b.status || 'On Time';
                return (
                  <li key={b.id} className="p-3 sm:p-4 hover:bg-gray-50 rounded-xl">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{b.route}</h2>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status === 'Delayed' ? 'bg-yellow-100 text-yellow-800' : status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {status}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-700 flex items-center gap-2 flex-wrap">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span className="truncate">{b.start}</span>
                          <span className="text-gray-400">→</span>
                          <span className="truncate">{b.destination}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                            <Clock className="w-3 h-3" /> ETA: {eta}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-medium">
                            <Activity className="w-3 h-3" />Occupancy: {occ}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
};

export default SearchResults;
