import { useState } from 'react';
import { useMapStore } from '../../store/useMapStore';
import type { Landmark } from '../../types';
import { landmarkAPI } from '../../services/api';
import './LandmarkPopup.css';

interface LandmarkPopupProps {
  landmark: Landmark;
  onSelect: (landmark: Landmark) => void;
  distance?: number; // in km, optional if computed internally
}

export function LandmarkPopup({ landmark, onSelect, distance: propDistance }: LandmarkPopupProps) {
  const userLocation = useMapStore((state) => state.userLocation);
  const [isVisited, setIsVisited] = useState(false);
  const [isMarkingVisited, setIsMarkingVisited] = useState(false);

  // Compute distance if not provided
  const distance =
    propDistance ?? (userLocation ? landmarkAPI.getDistance(userLocation, landmark) : undefined);

  const handleMarkVisited = async () => {
    setIsMarkingVisited(true);
    try {
      // TODO: API call to mark as visited
      // await landmarkAPI.markVisited(landmark.id);
      setIsVisited(true);
    } catch (error) {
      console.error('Failed to mark as visited:', error);
    } finally {
      setIsMarkingVisited(false);
    }
  };

  const handleViewDetails = () => {
    onSelect(landmark);
  };

  // Format distance
  const distanceText = distance !== undefined ? `${distance.toFixed(1)} km away` : '';

  // Capitalize category
  const categoryLabel = landmark.category.charAt(0).toUpperCase() + landmark.category.slice(1);

  return (
    <div className="landmark-popup">
      <div className="popup-header">
        <h3 className="popup-title">{landmark.name}</h3>
        <span className="popup-category">{categoryLabel}</span>
      </div>

      <p className="popup-description">{landmark.shortDescription}</p>

      {distance && (
        <div className="popup-distance">
          <span className="distance-icon">📍</span>
          <span>{distanceText}</span>
        </div>
      )}

      <div className="popup-actions">
        <button className="btn btn-primary" onClick={handleViewDetails}>
          View Details
        </button>
        <button
          className={`btn btn-secondary ${isVisited ? 'btn-visited' : ''}`}
          onClick={handleMarkVisited}
          disabled={isVisited || isMarkingVisited}
        >
          {isMarkingVisited ? 'Saving...' : isVisited ? '✓ Visited' : 'Mark as Visited'}
        </button>
      </div>

      <div className="popup-footer">
        {landmark.rating && (
          <span className="popup-rating">
            ⭐ {landmark.rating} ({landmark.reviewCount || 0} reviews)
          </span>
        )}
        {landmark.priceLevel && (
          <span className="popup-price">{'$'.repeat(landmark.priceLevel)}</span>
        )}
      </div>
    </div>
  );
}
