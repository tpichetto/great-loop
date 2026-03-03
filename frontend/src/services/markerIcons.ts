import { DivIcon } from 'leaflet';
import type { LandmarkCategory } from '../types';

// Define colors for each category
const categoryColors: Record<LandmarkCategory, string> = {
  attraction: '#e74c3c',
  restaurant: '#f39c12',
  park: '#27ae60',
  museum: '#9b59b6',
  historic: '#8e44ad',
  nature: '#2ecc71',
  entertainment: '#e67e22',
  shopping: '#3498db',
};

// Define SVG icons for each category
const categoryIcons: Record<LandmarkCategory, string> = {
  attraction: '🎢',
  restaurant: '🍽️',
  park: '🌳',
  museum: '🏛️',
  historic: '🏛️',
  nature: '🌲',
  entertainment: '🎭',
  shopping: '🛍️',
};

// Size for marker
const MARKER_SIZE = 36;

// Create a DivIcon with custom styling
export function createCategoryIcon(category: LandmarkCategory): DivIcon {
  const color = categoryColors[category];
  const iconEmoji = categoryIcons[category];

  return new DivIcon({
    className: 'custom-marker',
    html: `
      <div
        style="
          width: ${MARKER_SIZE}px;
          height: ${MARKER_SIZE}px;
          background-color: ${color};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        "
      >
        <span
          style="
            transform: rotate(45deg);
            font-size: 16px;
            line-height: 1;
          "
        >
          ${iconEmoji}
        </span>
      </div>
    `,
    iconSize: [MARKER_SIZE, MARKER_SIZE],
    iconAnchor: [MARKER_SIZE / 2, MARKER_SIZE],
    popupAnchor: [0, -MARKER_SIZE],
  });
}

// Default icon for fallback
export function createDefaultIcon(): DivIcon {
  return createCategoryIcon('attraction');
}

// User location icon (blue dot with pulse)
export function createUserLocationIcon(accuracy?: number): DivIcon {
  const pulseSize = accuracy ? Math.max(20, Math.min(60, accuracy / 2)) : 30;

  return new DivIcon({
    className: 'user-location-marker',
    html: `
      <div
        style="
          width: 16px;
          height: 16px;
          background-color: #3498db;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(52, 152, 219, 0.7);
          position: relative;
        "
      >
        ${
          accuracy
            ? `
          <div
            style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: ${pulseSize}px;
              height: ${pulseSize}px;
              border: 2px solid rgba(52, 152, 219, 0.4);
              border-radius: 50%;
              animation: pulse 2s ease-out infinite;
            "
          ></div>
          <style>
            @keyframes pulse {
              0% {
                transform: translate(-50%, -50%) scale(0.5);
                opacity: 1;
              }
              100% {
                transform: translate(-50%, -50%) scale(1.5);
                opacity: 0;
              }
            }
          </style>
        `
            : ''
        }
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

// Cache for icons to avoid recreating them
const iconCache = new Map<LandmarkCategory, DivIcon>();
const defaultIconCache = createDefaultIcon();

export function getCachedIcon(category: LandmarkCategory): DivIcon {
  if (!iconCache.has(category)) {
    iconCache.set(category, createCategoryIcon(category));
  }
  return iconCache.get(category)!;
}

export function getCachedDefaultIcon(): DivIcon {
  return defaultIconCache;
}
