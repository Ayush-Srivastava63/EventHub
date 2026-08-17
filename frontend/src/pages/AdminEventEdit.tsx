import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EventForm from '../components/EventForm';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { getEventById, updateEvent, deleteEvent } from '../api/events';
import { getEventRegistrations } from '../api/registrations';
import type { Event, CreateEventData, Registration } from '../types';
import './AdminEventEdit.css';

export default function AdminEventEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showRegistrations, setShowRegistrations] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvent();
  }, [id]);

  async function fetchEvent() {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await getEventById(parseInt(id, 10));
      setEvent(data);
      try {
        const regs = await getEventRegistrations(parseInt(id, 10));
        setRegistrations(regs);
      } catch {
        // Non-critical — admin may not have permission for non-owned events
      }
    } catch {
      setError('Failed to load event.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdate(data: CreateEventData) {
    if (!id) return;
    setIsSaving(true);
    await updateEvent(parseInt(id, 10), data);
    navigate('/admin');
  }

  async function handleDelete() {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    try {
      await deleteEvent(parseInt(id, 10));
      navigate('/admin');
    } catch {
      alert('Failed to delete event.');
    }
  }

  if (isLoading) return <LoadingSpinner size="large" message="Loading event..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!event) return <ErrorMessage message="Event not found." />;

  return (
    <div className="admin-edit" id="admin-event-edit">
      <button className="admin-edit__back" onClick={() => navigate(-1)}>
        ← Back to Dashboard
      </button>

      <div className="admin-edit__header">
        <div>
          <h1 className="admin-edit__title">Edit Event</h1>
          <p className="admin-edit__subtitle">{event.title}</p>
        </div>
        <div className="admin-edit__actions">
          <button
            className="btn btn--outline"
            onClick={() => setShowRegistrations(true)}
          >
            View Registrations ({registrations.length})
          </button>
          <button className="btn btn--danger" onClick={handleDelete}>
            Delete Event
          </button>
        </div>
      </div>

      <div className="admin-edit__form-container">
        <EventForm
          initialData={event}
          onSubmit={handleUpdate}
          submitLabel="Save Changes"
          isLoading={isSaving}
        />
      </div>

      {/* Registrations Modal */}
      <Modal
        isOpen={showRegistrations}
        onClose={() => setShowRegistrations(false)}
        title={`Registrations — ${event.title}`}
      >
        {registrations.length === 0 ? (
          <p className="admin-edit__no-regs">No registrations yet.</p>
        ) : (
          <div className="admin-edit__reg-list">
            {registrations.map((reg) => (
              <div key={reg.id} className="admin-edit__reg-item">
                <div>
                  <strong>{reg.name}</strong>
                  <span className="admin-edit__reg-email">{reg.email}</span>
                </div>
                <span className={`admin-edit__reg-status admin-edit__reg-status--${reg.status}`}>
                  {reg.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
