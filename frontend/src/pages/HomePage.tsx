import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-dark">
      {/* Hero Section */}
      <section className="luma-hero">
        {/* Floating Cards (Background layer) */}
        <div className="luma-floating-cards">
          <div className="luma-card card-1"><img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80" alt="Pizza" /></div>
          <div className="luma-card card-2"><img src="https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=400&q=80" alt="BBQ" /></div>
          <div className="luma-card card-3">
            <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&q=80" alt="Tech Event" />
          </div>
          <div className="luma-card card-4"><img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80" alt="Event" /></div>
          <div className="luma-card card-5"><img src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80" alt="Party" /></div>
          <div className="luma-card card-6"><img src="https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=400&q=80" alt="DJ" /></div>
        </div>

        {/* Content (Foreground layer) */}
        <div className="luma-hero__content">
          <h1 className="luma-hero__title">
            Delightful<br />
            events <span className="text-gradient">start here</span>
          </h1>
          <p className="luma-hero__subtitle">
            From run clubs to launch parties and firework shows,<br />
            EventHub makes every event feel effortless.
          </p>

          <div className="luma-hero__actions">
            <Link to={isAuthenticated ? "/events" : "/register"} className="btn-luma-primary">
              Create Your First Event
            </Link>
            <Link to="/events" className="btn-luma-text">
              Discover Events <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section with Dot Background */}
      <section className="luma-cta">
        <div className="luma-dots-bg"></div>
        <div className="luma-cta__content">
          <h2 className="luma-cta__title">
            Your next unforgettable<br />
            <span className="text-gradient-2">memory awaits.</span>
          </h2>
          <div className="luma-cta__actions">
            <Link to="/events" className="btn-luma-outline">Discover Events</Link>
            <Link to={isAuthenticated ? "/events" : "/register"} className="btn-luma-secondary">Get the App</Link>
          </div>
        </div>
      </section>


    </div>
  );
}
