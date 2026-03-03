import { Link } from 'react-router-dom';
import './HomePage.css';

export function HomePage() {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Discover Amazing Landmarks</h1>
          <p className="hero-subtitle">
            Explore, track, and collect landmarks around the world. Your personal adventure awaits.
          </p>
          <div className="hero-actions">
            <Link to="/map" className="btn btn-primary btn-large">
              Start Exploring
            </Link>
            <Link to="/register" className="btn btn-secondary btn-large">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="section-header">
          <h2 className="section-title">Features</h2>
          <p className="section-subtitle">
            Everything you need to explore and document your journey
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🗺️</div>
            <h3 className="feature-title">Interactive Map</h3>
            <p className="feature-description">
              Navigate with our powerful map interface. Find landmarks near you and discover new
              places to visit.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📍</div>
            <h3 className="feature-title">Progress Tracking</h3>
            <p className="feature-description">
              Keep track of landmarks you've visited and collections you've completed. Build your
              personal legacy.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🏷️</div>
            <h3 className="feature-title">Categorization</h3>
            <p className="feature-description">
              Filter by categories like attractions, parks, museums, and more. Find exactly what
              you're looking for.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3 className="feature-title">Mobile Ready</h3>
            <p className="feature-description">
              Access on any device with a responsive design. Perfect for on-the-go exploration.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3 className="feature-title">Smart Search</h3>
            <p className="feature-description">
              Powerful search and filter options help you find landmarks based on location,
              category, and more.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">👤</div>
            <h3 className="feature-title">Personal Profile</h3>
            <p className="feature-description">
              Manage your account and view your exploration statistics in your personal profile
              dashboard.
            </p>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Start Your Adventure?</h2>
          <p className="cta-subtitle">
            Join thousands of explorers tracking their journeys around the world.
          </p>
          <div className="cta-actions">
            <Link to="/register" className="btn btn-primary btn-large">
              Create Free Account
            </Link>
            <Link to="/login" className="btn btn-secondary btn-large">
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
