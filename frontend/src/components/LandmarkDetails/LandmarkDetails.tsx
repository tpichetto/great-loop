import { useEffect, useState } from 'react';
import { Landmark } from '../../types';
import { useMapStore } from '../../store/useMapStore';
import { landmarkAPI } from '../../services/api';
import './LandmarkDetails.css';

interface LandmarkDetailsProps {
  landmarkId?: string;
  onClose: () => void;
}

export function LandmarkDetails({ landmarkId, onClose }: LandmarkDetailsProps) {
  const [landmark, setLandmark] = useState<Landmark | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisited, setIsVisited] = useState(false);
  const userLocation = useMapStore((state) => state.userLocation);

  // Fetch landmark details when ID changes
  useEffect(() => {
    if (!landmarkId) {
      setLandmark(null);
      return;
    }

    const fetchLandmark = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await landmarkAPI.fetchById(landmarkId);
        setLandmark(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load landmark');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLandmark();
  }, [landmarkId]);

  const handleMarkVisited = async () => {
    if (!landmark) return;
    // TODO: API call to mark as visited
    // await landmarkAPI.markVisited(landmark.id);
    setIsVisited(true);
  };

  const handleGetDirections = () => {
    if (!landmark) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${landmark.latitude},${landmark.longitude}`;
    window.open(url, '_blank');
  };

  if (!landmarkId) return null;

  // Calculate distance from user
  const distance =
    landmark && userLocation ? landmarkAPI.getDistance(userLocation, landmark) : undefined;

  // Format opening hours
  const formatOpeningHours = (hours?: { day: string; open: string; close: string }[]) => {
    if (!hours || hours.length === 0) return 'Hours not available';

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return hours
      .map((h) => {
        const dayIndex = days.findIndex((d) => d.toLowerCase() === h.day.toLowerCase());
        const dayName = dayIndex >= 0 ? days[dayIndex] : h.day;
        return `${dayName}: ${h.open} - ${h.close}`;
      })
      .join('\n');
  };

  // For mobile, render as bottom sheet overlay
  if (window.innerWidth < 768) {
    return (
      <div className="landmark-details-overlay" onClick={onClose}>
        <div className="landmark-details-mobile" onClick={(e) => e.stopPropagation()}>
          <div className="details-header-mobile">
            <button className="close-btn" onClick={onClose}>
              ✕
            </button>
          </div>

          {isLoading ? (
            <div className="loading-state">Loading...</div>
          ) : error ? (
            <div className="error-state">{error}</div>
          ) : landmark ? (
            <>
              <div className="details-image-mobile">
                {landmark.images?.[0] ? (
                  <img src={landmark.images[0]} alt={landmark.name} />
                ) : (
                  <div className="placeholder-image">No image</div>
                )}
              </div>

              <div className="details-content">
                <div className="details-title-section">
                  <h2>{landmark.name}</h2>
                  <div className="details-meta">
                    <span className="category-badge">
                      {landmark.category.charAt(0).toUpperCase() + landmark.category.slice(1)}
                    </span>
                    {distance && (
                      <span className="distance-badge">{distance.toFixed(1)} km away</span>
                    )}
                  </div>
                  {landmark.rating && (
                    <div className="rating-section">
                      <span className="stars">{'⭐'.repeat(Math.round(landmark.rating))}</span>
                      <span>
                        {landmark.rating} ({landmark.reviewCount} reviews)
                      </span>
                      {landmark.priceLevel && (
                        <span className="price-level">{'$'.repeat(landmark.priceLevel)}</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="details-section">
                  <h3>About</h3>
                  <p>{landmark.description}</p>
                </div>

                {landmark.openingHours && (
                  <div className="details-section">
                    <h3>Hours</h3>
                    <pre className="hours-list">{formatOpeningHours(landmark.openingHours)}</pre>
                  </div>
                )}

                {landmark.address && (
                  <div className="details-section">
                    <h3>Location</h3>
                    <p>{landmark.address}</p>
                  </div>
                )}

                <div className="details-actions-mobile">
                  <button className="btn-mobile primary" onClick={handleGetDirections}>
                    🗺️ Get Directions
                  </button>
                  <button
                    className={`btn-mobile secondary ${isVisited ? 'visited' : ''}`}
                    onClick={handleMarkVisited}
                    disabled={isVisited}
                  >
                    {isVisited ? '✓ Visited' : 'Mark as Visited'}
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    );
  }

  // For desktop, render as side panel
  return (
    <div className="landmark-details-desktop">
      <div className="details-header-desktop">
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      {isLoading ? (
        <div className="loading-state">Loading...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : landmark ? (
        <>
          <div className="details-image-desktop">
            {landmark.images?.[0] ? (
              <img src={landmark.images[0]} alt={landmark.name} />
            ) : (
              <div className="placeholder-image">No image available</div>
            )}
          </div>

          <div className="details-content">
            <div className="details-title-section">
              <h2>{landmark.name}</h2>
              <div className="details-meta">
                <span className="category-badge">
                  {landmark.category.charAt(0).toUpperCase() + landmark.category.slice(1)}
                </span>
                {distance && <span className="distance-badge">📍 {distance.toFixed(1)} km</span>}
              </div>
              {landmark.rating && (
                <div className="rating-section">
                  <span className="stars">{'⭐'.repeat(Math.round(landmark.rating))}</span>
                  <span>
                    {landmark.rating} ({landmark.reviewCount} reviews)
                  </span>
                  {landmark.priceLevel && (
                    <span className="price-level">{'$'.repeat(landmark.priceLevel)}</span>
                  )}
                </div>
              )}
            </div>

            <div className="details-section">
              <h3>About</h3>
              <p>{landmark.description}</p>
            </div>

            {landmark.openingHours && (
              <div className="details-section">
                <h3>Opening Hours</h3>
                <pre className="hours-list">{formatOpeningHours(landmark.openingHours)}</pre>
              </div>
            )}

            {landmark.address && (
              <div className="details-section">
                <h3>Address</h3>
                <p>{landmark.address}</p>
                {landmark.phone && <p>📞 {landmark.phone}</p>}
                {landmark.website && (
                  <p>
                    🌐{' '}
                    <a href={landmark.website} target="_blank" rel="noopener noreferrer">
                      Visit website
                    </a>
                  </p>
                )}
              </div>
            )}

            {landmark.tags && landmark.tags.length > 0 && (
              <div className="details-section">
                <h3>Tags</h3>
                <div className="tags-list">
                  {landmark.tags.map((tag, idx) => (
                    <span key={idx} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="details-actions-desktop">
              <button className="btn-desktop primary" onClick={handleGetDirections}>
                🗺️ Get Directions
              </button>
              <button
                className={`btn-desktop secondary ${isVisited ? 'visited' : ''}`}
                onClick={handleMarkVisited}
                disabled={isVisited}
              >
                {isVisited ? '✓ Marked as Visited' : 'Mark as Visited'}
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
