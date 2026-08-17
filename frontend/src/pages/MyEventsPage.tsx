import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserRegistrations } from '../api/registrations';
import { cancelRegistration } from '../api/registrations';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import type { Registration } from '../types';
import './MyEventsPage.css';

export default function MyEventsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRegistrations();
  }, []);

  async function fetchRegistrations() {
    setIsLoading(true);
    setError('');
    try {
      const data = await getUserRegistrations();
      setRegistrations(data);
    } catch {
      setError('Failed to load your registrations.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCancel(eventId: number) {
    if (!window.confirm('Are you sure you want to cancel this registration?')) return;
    try {
      await cancelRegistration(eventId);
      fetchRegistrations();
    } catch {
      alert('Failed to cancel registration.');
    }
  }

  const confirmed = registrations.filter((r) => r.status === 'confirmed');
  const cancelled = registrations.filter((r) => r.status === 'cancelled');

  if (isLoading) return <LoadingSpinner size="large" message="Loading your events..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchRegistrations} />;

  return (
    <div className="my-events" id="my-events-page">
      <h1 className="my-events__title">My Events</h1>
      <p className="my-events__subtitle">Your registered events</p>

      {registrations.length === 0 ? (
        <div className="my-events__empty">
          <p>You haven't registered for any events yet.</p>
          <Link to="/events" className="btn btn--primary">Browse Events</Link>
        </div>
      ) : (
        <>
          {confirmed.length > 0 && (
            <section>
              <h2 className="my-events__section-title">
                Active Registrations ({confirmed.length})
              </h2>
              <div className="my-events__list">
                {confirmed.map((reg) => (
                  <div key={reg.id} className="my-events__card">
                    <div className="my-events__card-main">
                      <Link to={`/events/${reg.event_id}`} className="my-events__card-title">
                        {reg.title}
                      </Link>
                      <div className="my-events__card-meta">
                        <span>📅 {reg.event_date ? new Date(reg.event_date).toLocaleDateString() : ''}</span>
                        <span>⏰ {reg.event_time}</span>
                        <span>📍 {reg.location}</span>
                      </div>
                    </div>
                    <div className="my-events__card-actions">
                      <span className="my-events__status my-events__status--confirmed">Confirmed</span>
                      <button
                        className="btn btn--danger btn--sm"
                        onClick={() => handleCancel(reg.event_id)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {cancelled.length > 0 && (
            <section>
              <h2 className="my-events__section-title">
                Cancelled ({cancelled.length})
              </h2>
              <div className="my-events__list">
                {cancelled.map((reg) => (
                  <div key={reg.id} className="my-events__card my-events__card--cancelled">
                    <div className="my-events__card-main">
                      <Link to={`/events/${reg.event_id}`} className="my-events__card-title">
                        {reg.title}
                      </Link>
                      <div className="my-events__card-meta">
                        <span>📅 {reg.event_date ? new Date(reg.event_date).toLocaleDateString() : ''}</span>
                        <span>📍 {reg.location}</span>
                      </div>
                    </div>
                    <span className="my-events__status my-events__status--cancelled">Cancelled</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
