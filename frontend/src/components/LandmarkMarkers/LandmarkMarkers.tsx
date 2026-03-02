import { useMemo } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import { MarkerClusterGroup } from 'react-leaflet-markercluster';
import L from 'leaflet';
import type { Landmark } from '../../types';
import { getCachedIcon } from '../../services/markerIcons';
import { LandmarkPopup } from '../LandmarkPopup/LandmarkPopup';

interface LandmarkMarkersProps {
  landmarks: Landmark[];
  onSelect: (landmark: Landmark) => void;
}

export function LandmarkMarkers({ landmarks, onSelect }: LandmarkMarkersProps) {
  const map = useMap();

  // Memoize markers to avoid unnecessary re-renders
  const markers = useMemo(() => {
    return landmarks.map((landmark) => ({
      id: landmark.id,
      position: [landmark.latitude, landmark.longitude] as [number, number],
      landmark,
    }));
  }, [landmarks]);

  // Handle marker click
  const handleMarkerClick = (landmark: Landmark) => {
    onSelect(landmark);
    map.flyTo([landmark.latitude, landmark.longitude], 14, { duration: 1 });
  };

  // Custom cluster icon function
  const createClusterCustomIcon = (cluster: unknown) => {
    const count = (cluster as { getChildCount: () => number }).getChildCount();
    let size = 40;
    let fontSize = '14px';

    if (count > 100) {
      size = 60;
      fontSize = '18px';
    } else if (count > 50) {
      size = 50;
      fontSize = '16px';
    }

    return new L.DivIcon({
      html: `<div style="
        background-color: #3498db;
        color: white;
        border-radius: 50%;
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: ${fontSize};
        border: 3px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      ">${count}</div>`,
      className: 'custom-cluster-icon',
      iconSize: [size, size],
    });
  };

  return (
    <MarkerClusterGroup
      chunkedLoading
      spiderfyOnMaxZoom={true}
      showCoverageOnHover={true}
      zoomToBoundsOnClick={true}
      iconCreateFunction={createClusterCustomIcon}
      maxClusterRadius={50}
      disableClusteringAtZoom={14}
    >
      {markers.map(({ id, position, landmark }) => (
        <Marker
          key={id}
          position={position}
          icon={getCachedIcon(landmark.category)}
          eventHandlers={{
            click: () => handleMarkerClick(landmark),
          }}
        >
          <Popup>
            <LandmarkPopup landmark={landmark} onSelect={onSelect} />
          </Popup>
        </Marker>
      ))}
    </MarkerClusterGroup>
  );
}
