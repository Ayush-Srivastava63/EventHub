import { Link } from 'react-router-dom';
import type { Event } from '../types';
import './EventCard.css';

interface EventCardProps {
  event: Event;
}

/**
 * Card displaying an event summary — title, date, location, category, and capacity.
 */
export default function EventCard({ event }: EventCardProps) {
  const registrationCount = Number(event.registration_count) || 0;
  const spotsLeft = event.capacity - registrationCount;
  const isFull = spotsLeft <= 0;

  const formattedDate = new Date(event.event_date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Link to={`/events/${event.id}`} className="event-card" id={`event-card-${event.id}`}>
      <div className="event-card__header">
        <span className="event-card__category">{event.category}</span>
        <span className={`event-card__spots ${isFull ? 'event-card__spots--full' : ''}`}>
          {isFull ? 'Full' : `${spotsLeft} spots left`}
        </span>
      </div>

      <h3 className="event-card__title">{event.title}</h3>

      <p className="event-card__description">
        {event.description.length > 120
          ? event.description.substring(0, 120) + '...'
          : event.description}
      </p>

      <div className="event-card__details">
        <div className="event-card__detail">
          <span className="event-card__icon">📅</span>
          <span>{formattedDate}</span>
        </div>
        <div className="event-card__detail">
          <span className="event-card__icon">⏰</span>
          <span>{event.event_time}</span>
        </div>
        <div className="event-card__detail">
          <span className="event-card__icon">📍</span>
          <span>{event.location}</span>
        </div>
      </div>

      {event.organizer_name && (
        <div className="event-card__footer">
          <span className="event-card__organizer">By {event.organizer_name}</span>
        </div>
      )}
    </Link>
  );
}
