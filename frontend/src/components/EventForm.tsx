import { useState, useEffect } from 'react';
import type { CreateEventData } from '../types';
import './EventForm.css';

interface EventFormProps {
  initialData?: Partial<CreateEventData>;
  onSubmit: (data: CreateEventData) => Promise<void>;
  submitLabel?: string;
  isLoading?: boolean;
}

const CATEGORIES = ['general', 'technology', 'music', 'sports', 'business', 'education', 'art', 'health', 'food', 'networking'];

export default function EventForm({ initialData, onSubmit, submitLabel = 'Create Event', isLoading = false }: EventFormProps) {
  const [formData, setFormData] = useState<CreateEventData>({
    title: '',
    description: '',
    location: '',
    event_date: '',
    event_time: '',
    category: 'general',
    capacity: 50,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        event_date: initialData.event_date
          ? new Date(initialData.event_date).toISOString().split('T')[0]
          : prev.event_date,
      }));
    }
  }, [initialData]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value, 10) || 0 : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Basic client-side validation
    if (!formData.title.trim() || !formData.description.trim() || !formData.location.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!formData.event_date || !formData.event_time) {
      setError('Please set the event date and time.');
      return;
    }
    if (formData.capacity < 1) {
      setError('Capacity must be at least 1.');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong.');
    }
  }

  return (
    <form className="event-form" onSubmit={handleSubmit} id="event-form">
      {error && <div className="event-form__error">{error}</div>}

      <div className="event-form__group">
        <label htmlFor="title" className="event-form__label">Title *</label>
        <input
          type="text"
          id="title"
          name="title"
          className="event-form__input"
          value={formData.title}
          onChange={handleChange}
          placeholder="Event title"
          required
        />
      </div>

      <div className="event-form__group">
        <label htmlFor="description" className="event-form__label">Description *</label>
        <textarea
          id="description"
          name="description"
          className="event-form__textarea"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your event..."
          rows={4}
          required
        />
      </div>

      <div className="event-form__row">
        <div className="event-form__group">
          <label htmlFor="event_date" className="event-form__label">Date *</label>
          <input
            type="date"
            id="event_date"
            name="event_date"
            className="event-form__input"
            value={formData.event_date}
            onChange={handleChange}
            required
          />
        </div>
        <div className="event-form__group">
          <label htmlFor="event_time" className="event-form__label">Time *</label>
          <input
            type="time"
            id="event_time"
            name="event_time"
            className="event-form__input"
            value={formData.event_time}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="event-form__group">
        <label htmlFor="location" className="event-form__label">Location *</label>
        <input
          type="text"
          id="location"
          name="location"
          className="event-form__input"
          value={formData.location}
          onChange={handleChange}
          placeholder="Event venue or address"
          required
        />
      </div>

      <div className="event-form__row">
        <div className="event-form__group">
          <label htmlFor="category" className="event-form__label">Category</label>
          <select
            id="category"
            name="category"
            className="event-form__select"
            value={formData.category}
            onChange={handleChange}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="event-form__group">
          <label htmlFor="capacity" className="event-form__label">Capacity *</label>
          <input
            type="number"
            id="capacity"
            name="capacity"
            className="event-form__input"
            value={formData.capacity}
            onChange={handleChange}
            min={1}
            required
          />
        </div>
      </div>

      <button type="submit" className="event-form__submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
