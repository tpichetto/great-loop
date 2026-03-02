import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapStore } from '../../store/useMapStore';
import { createUserLocationIcon } from '../../services/markerIcons';

// Fix for default markers in Leaflet with webpack/vite
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface InteractiveMapProps {
  children?: React.ReactNode;
  onBoundsChange?: (bounds: L.LatLngBounds) => void;
  onZoomChange?: (zoom: number) => void;
  height?: string;
}

// Component to handle map events
function MapEventHandler({
  onBoundsChange,
  onZoomChange,
}: {
  onBoundsChange?: (bounds: L.LatLngBounds) => void;
  onZoomChange?: (zoom: number) => void;
}) {
  const map = useMapEvents({
    moveend: () => {
      if (onBoundsChange) {
        onBoundsChange(map.getBounds());
      }
    },
    zoomend: () => {
      if (onZoomChange) {
        onZoomChange(map.getZoom());
      }
    },
  });

  return null;
}

// Component to display user location
function UserLocationMarker() {
  const userLocation = useMapStore((state) => state.userLocation);
  const userIcon = userLocation
    ? createUserLocationIcon(userLocation.accuracy)
    : createUserLocationIcon();

  if (!userLocation) return null;

  const position: [number, number] = [userLocation.latitude, userLocation.longitude];

  return (
    <>
      <Marker position={position} icon={userIcon} zIndexOffset={1000} />
      {userLocation.accuracy && (
        <Circle
          center={position}
          radius={userLocation.accuracy}
          pathOptions={{
            color: '#3498db',
            fillColor: '#3498db',
            fillOpacity: 0.1,
            weight: 1,
          }}
        />
      )}
    </>
  );
}

export function InteractiveMap({
  children,
  onBoundsChange,
  onZoomChange,
  height = '100%',
}: InteractiveMapProps) {
  const map = useRef<L.Map | null>(null);
  const userLocation = useMapStore((state) => state.userLocation);
  const setViewport = useMapStore((state) => state.setViewport);

  // Initialize map center
  const center: [number, number] = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : [39.8283, -98.5795]; // Default to US center

  const handleBoundsChange = (bounds: L.LatLngBounds) => {
    setViewport({ bounds });
    onBoundsChange?.(bounds);
  };

  const handleZoomChange = (zoom: number) => {
    setViewport({ zoom });
    onZoomChange?.(zoom);
  };

  // Fly to user location when it becomes available
  useEffect(() => {
    if (userLocation && map.current) {
      map.current.flyTo([userLocation.latitude, userLocation.longitude], 12, { duration: 1.5 });
    }
  }, [userLocation]);

  return (
    <div style={{ height, width: '100%' }}>
      <MapContainer
        center={center}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
        ref={map}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          updateWhenIdle={false}
          updateWhenZooming={false}
        />

        <UserLocationMarker />

        <MapEventHandler onBoundsChange={handleBoundsChange} onZoomChange={handleZoomChange} />

        {children}
      </MapContainer>
    </div>
  );
}
