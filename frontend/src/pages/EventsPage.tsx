import { useState, useEffect } from 'react';
import EventCard from '../components/EventCard';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { getEvents, getCategories } from '../api/events';
import type { Event } from '../types';
import './EventsPage.css';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('date_asc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [search, category, sortBy, page]);

  async function fetchCategories() {
    try {
      const cats = await getCategories();
      setCategories(cats);
    } catch {
      // Categories are non-critical
    }
  }

  async function fetchEvents() {
    setIsLoading(true);
    setError('');
    try {
      const result = await getEvents({ search, category, sort: sortBy, page, limit: 12 });
      setEvents(result.events);
      setTotalPages(result.pagination.totalPages);
    } catch {
      setError('Failed to load events. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleSearch(query: string) {
    setSearch(query);
    setPage(1);
  }

  function handleCategoryChange(cat: string) {
    setCategory(cat);
    setPage(1);
  }

  return (
    <div className="events-page" id="events-page">
      <div className="events-page__header">
        <h1 className="events-page__title">Explore Events</h1>
        <p className="events-page__subtitle">Discover amazing events happening near you</p>
      </div>

      <div className="events-page__controls">
        <SearchBar onSearch={handleSearch} initialValue={search} />
        <FilterPanel
          categories={categories}
          selectedCategory={category}
          onCategoryChange={handleCategoryChange}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      </div>

      {isLoading ? (
        <LoadingSpinner size="large" message="Loading events..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchEvents} />
      ) : events.length === 0 ? (
        <div className="events-page__empty">
          <p className="events-page__empty-text">No events found.</p>
          {(search || category) && (
            <button
              className="btn btn--outline"
              onClick={() => { setSearch(''); setCategory(''); }}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="events-page__grid">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="events-page__pagination">
              <button
                className="btn btn--outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span className="events-page__page-info">
                Page {page} of {totalPages}
              </span>
              <button
                className="btn btn--outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
