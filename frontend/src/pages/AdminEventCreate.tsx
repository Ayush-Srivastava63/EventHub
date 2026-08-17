import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EventForm from '../components/EventForm';
import { createEvent } from '../api/events';
import type { CreateEventData } from '../types';
import './AdminEventCreate.css';

export default function AdminEventCreate() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  async function handleCreate(data: CreateEventData) {
    setIsLoading(true);
    try {
      await createEvent(data);
      navigate('/admin');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="admin-create" id="admin-event-create">
      <button className="admin-create__back" onClick={() => navigate(-1)}>
        ← Back to Dashboard
      </button>
      <h1 className="admin-create__title">Create New Event</h1>
      <p className="admin-create__subtitle">Fill in the details to create a new event</p>

      <div className="admin-create__form-container">
        <EventForm
          onSubmit={handleCreate}
          submitLabel="Create Event"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
