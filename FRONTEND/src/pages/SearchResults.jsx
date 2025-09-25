import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { buses as allBuses } from '../data/buses';
import Header from '../components/Header';
import { Home } from 'lucide-react';

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
      .filter(b => b.route.toLowerCase().includes(q))
      .sort((a, b) => a.route.localeCompare(b.route));
  }, [query]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
        </div>

        {query && filtered.length === 0 && (
          <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-700">
            No buses found matching your query. Try another route.
          </div>
        )}

        {filtered.length > 0 && (
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="space-y-2">
              {filtered.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg border bg-white border-gray-100"
                >
                  <div className="text-sm font-medium text-gray-900">{b.route}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default SearchResults;
