import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats, getAdminEvents } from '../api/events';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import type { AdminStats, Event } from '../types';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    setIsLoading(true);
    setError('');
    try {
      const [statsData, eventsData] = await Promise.all([
        getAdminStats(),
        getAdminEvents(),
      ]);
      setStats(statsData);
      setEvents(eventsData);
    } catch {
      setError('Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) return <LoadingSpinner size="large" message="Loading dashboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchDashboard} />;

  return (
    <div className="admin-dash" id="admin-dashboard">
      <div className="admin-dash__header">
        <div>
          <h1 className="admin-dash__title">Admin Dashboard</h1>
          <p className="admin-dash__subtitle">Manage your events and track registrations</p>
        </div>
        <Link to="/admin/events/create" className="btn btn--primary">
          + Create Event
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="admin-dash__stats">
          <div className="stat-card">
            <span className="stat-card__icon">📅</span>
            <div className="stat-card__content">
              <span className="stat-card__value">{stats.totalEvents}</span>
              <span className="stat-card__label">Total Events</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-card__icon">🎫</span>
            <div className="stat-card__content">
              <span className="stat-card__value">{stats.totalRegistrations}</span>
              <span className="stat-card__label">Total Registrations</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-card__icon">⏳</span>
            <div className="stat-card__content">
              <span className="stat-card__value">{stats.upcomingEvents}</span>
              <span className="stat-card__label">Upcoming Events</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-card__icon">💺</span>
            <div className="stat-card__content">
              <span className="stat-card__value">{stats.availableSeats}</span>
              <span className="stat-card__label">Available Seats</span>
            </div>
          </div>
        </div>
      )}

      {/* Events Table */}
      <div className="admin-dash__section">
        <h2 className="admin-dash__section-title">Your Events</h2>
        {events.length === 0 ? (
          <div className="admin-dash__empty">
            <p>No events yet. Create your first event!</p>
          </div>
        ) : (
          <div className="admin-dash__table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Registrations</th>
                  <th>Capacity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <Link to={`/events/${event.id}`} className="admin-table__link">
                        {event.title}
                      </Link>
                    </td>
                    <td>{new Date(event.event_date).toLocaleDateString()}</td>
                    <td>
                      <span className="admin-table__badge">{event.category}</span>
                    </td>
                    <td>{Number(event.registration_count) || 0}</td>
                    <td>{event.capacity}</td>
                    <td>
                      <div className="admin-table__actions">
                        <Link to={`/admin/events/${event.id}/edit`} className="btn btn--outline btn--sm">
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
