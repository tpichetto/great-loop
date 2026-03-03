import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useMapStore } from '../../store/useMapStore';
import { useGeolocation } from '../../hooks/useGeolocation';
import { landmarkAPI } from '../../services/api';
import { InteractiveMap } from '../InteractiveMap/InteractiveMap';
import { LandmarkMarkers } from '../LandmarkMarkers/LandmarkMarkers';
import { LandmarkDetails } from '../LandmarkDetails/LandmarkDetails';
import { SearchFilterControls } from '../SearchFilterControls/SearchFilterControls';
import type { Landmark } from '../../types';
import './MapPage.css';

// Helper component to trigger data fetching on bounds change
function BoundsFetcher({ onBoundsChange }: { onBoundsChange: (bounds: L.LatLngBounds) => void }) {
  const map = useMap();
  useEffect(() => {
    onBoundsChange(map.getBounds());
  }, [map, onBoundsChange]);
  return null;
}

export function MapPage() {
  const { filters, setLandmarks, setUserLocation, selectedLandmark, setSelectedLandmark } =
    useMapStore();

  const [currentBounds, setCurrentBounds] = useState<L.LatLngBounds | null>(null);

  // Geolocation
  const {
    location,
    error: geoError,
    startWatching,
    isSupported,
  } = useGeolocation({
    watch: false,
    enableHighAccuracy: true,
  });

  // Set user location in store when available
  useEffect(() => {
    if (location) {
      setUserLocation(location);
    }
  }, [location, setUserLocation]);

  // Fetch landmarks by bounding box using React Query
  const {
    data: landmarksData,
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ['landmarks', currentBounds?.toBBoxString(), filters],
    queryFn: async () => {
      if (!currentBounds) return [];
      const bounds = {
        minLat: currentBounds.getSouth(),
        maxLat: currentBounds.getNorth(),
        minLng: currentBounds.getWest(),
        maxLng: currentBounds.getEast(),
      };
      const landmarks = await landmarkAPI.fetchByBoundingBox(bounds);
      // Apply filters client-side
      return landmarkAPI.filterLandmarks(landmarks, filters, location || null);
    },
    enabled: !!currentBounds,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Update landmarks when data changes
  useEffect(() => {
    if (landmarksData) {
      setLandmarks(landmarksData);
    }
  }, [landmarksData, setLandmarks]);

  // Handle bounds change
  const handleBoundsChange = useCallback(
    (bounds: L.LatLngBounds) => {
      setCurrentBounds(bounds);
    },
    [setCurrentBounds],
  );

  // Handle landmark selection
  const handleSelectLandmark = useCallback(
    (landmark: Landmark) => {
      setSelectedLandmark(landmark);
    },
    [setSelectedLandmark],
  );

  // Close details panel
  const handleCloseDetails = useCallback(() => {
    setSelectedLandmark(null);
  }, [setSelectedLandmark]);

  // Enable geolocation on user action
  const handleEnableLocation = useCallback(() => {
    if (isSupported) {
      startWatching();
    }
  }, [isSupported, startWatching]);

  return (
    <div className="map-page-container">
      <div className="sidebar-left">
        <SearchFilterControls />
        {!location && isSupported && (
          <button className="locate-btn-primary" onClick={handleEnableLocation}>
            📍 Enable Location
          </button>
        )}
        {geoError && <div className="geo-error">⚠️ Location disabled: {geoError}</div>}
        {isLoading && <div className="loading-indicator">Loading landmarks...</div>}
        {fetchError && (
          <div className="fetch-error">
            Error loading landmarks:{' '}
            {fetchError instanceof Error ? fetchError.message : 'Unknown error'}
          </div>
        )}
      </div>

      <div className="map-container">
        <InteractiveMap onBoundsChange={handleBoundsChange}>
          <BoundsFetcher onBoundsChange={handleBoundsChange} />
          <LandmarkMarkers
            landmarks={useMapStore.getState().landmarks}
            onSelect={handleSelectLandmark}
          />
        </InteractiveMap>
      </div>

      {selectedLandmark && (
        <LandmarkDetails landmarkId={selectedLandmark.id} onClose={handleCloseDetails} />
      )}
    </div>
  );
}
