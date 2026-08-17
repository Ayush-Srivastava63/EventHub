import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEventById } from '../api/events';
import { registerForEvent, cancelRegistration, checkRegistration } from '../api/registrations';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import type { Event } from '../types';
import './EventDetailPage.css';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchEvent();
  }, [id]);

  async function fetchEvent() {
    if (!id) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await getEventById(parseInt(id, 10));
      setEvent(data);

      // Check registration status if logged in
      if (isAuthenticated) {
        const registered = await checkRegistration(parseInt(id, 10));
        setIsRegistered(registered);
      }
    } catch {
      setError('Failed to load event details.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegister() {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setActionLoading(true);
    setMessage('');
    try {
      await registerForEvent(parseInt(id!, 10));
      setIsRegistered(true);
      setMessage('Successfully registered for this event!');
      fetchEvent(); // Refresh registration count
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to register.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancel() {
    setActionLoading(true);
    setMessage('');
    try {
      await cancelRegistration(parseInt(id!, 10));
      setIsRegistered(false);
      setMessage('Registration cancelled.');
      fetchEvent();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to cancel registration.');
    } finally {
      setActionLoading(false);
    }
  }

  if (isLoading) return <LoadingSpinner size="large" message="Loading event..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchEvent} />;
  if (!event) return <ErrorMessage message="Event not found." />;

  const registrationCount = Number(event.registration_count) || 0;
  const spotsLeft = event.capacity - registrationCount;
  const isFull = spotsLeft <= 0;
  const isOrganizer = user?.id === event.organizer_id;

  const formattedDate = new Date(event.event_date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="event-detail" id="event-detail-page">
      <button className="event-detail__back" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="event-detail__layout">
        <div className="event-detail__main">
          <span className="event-detail__category">{event.category}</span>
          <h1 className="event-detail__title">{event.title}</h1>

          <div className="event-detail__meta">
            <div className="event-detail__meta-item">
              <span className="event-detail__meta-icon">📅</span>
              <span>{formattedDate}</span>
            </div>
            <div className="event-detail__meta-item">
              <span className="event-detail__meta-icon">⏰</span>
              <span>{event.event_time}</span>
            </div>
            <div className="event-detail__meta-item">
              <span className="event-detail__meta-icon">📍</span>
              <span>{event.location}</span>
            </div>
            <div className="event-detail__meta-item">
              <span className="event-detail__meta-icon">👤</span>
              <span>Organized by {event.organizer_name}</span>
            </div>
          </div>

          <div className="event-detail__description">
            <h2>About This Event</h2>
            <p>{event.description}</p>
          </div>
        </div>

        <aside className="event-detail__sidebar">
          <div className="event-detail__card">
            <div className="event-detail__capacity">
              <div className="event-detail__capacity-bar">
                <div
                  className="event-detail__capacity-fill"
                  style={{ width: `${Math.min((registrationCount / event.capacity) * 100, 100)}%` }}
                />
              </div>
              <div className="event-detail__capacity-info">
                <span>{registrationCount} / {event.capacity} registered</span>
                <span className={isFull ? 'text-danger' : 'text-success'}>
                  {isFull ? 'Event Full' : `${spotsLeft} spots left`}
                </span>
              </div>
            </div>

            {message && (
              <div className={`event-detail__message ${message.includes('Successfully') || message.includes('cancelled') ? 'event-detail__message--success' : 'event-detail__message--error'}`}>
                {message}
              </div>
            )}

            {isOrganizer ? (
              <button
                className="btn btn--outline btn--full"
                onClick={() => navigate(`/admin/events/${event.id}/edit`)}
              >
                Edit Event
              </button>
            ) : isRegistered ? (
              <button
                className="btn btn--danger btn--full"
                onClick={handleCancel}
                disabled={actionLoading}
              >
                {actionLoading ? 'Cancelling...' : 'Cancel Registration'}
              </button>
            ) : (
              <button
                className="btn btn--primary btn--full"
                onClick={handleRegister}
                disabled={actionLoading || isFull}
              >
                {actionLoading ? 'Registering...' : isFull ? 'Event Full' : 'Register Now'}
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
