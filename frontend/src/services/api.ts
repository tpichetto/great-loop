import { Landmark, BoundingBox, UserLocation } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function to make API calls
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Calculate distance between two coordinates in km
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Landmark API functions
export const landmarkAPI = {
  // Fetch landmarks within a bounding box
  async fetchByBoundingBox(bounds: BoundingBox): Promise<Landmark[]> {
    const { minLat, maxLat, minLng, maxLng } = bounds;
    const query = new URLSearchParams({
      minLat: minLat.toString(),
      maxLat: maxLat.toString(),
      minLng: minLng.toString(),
      maxLng: maxLng.toString(),
    });
    return fetchAPI<Landmark[]>(`/landmarks?${query.toString()}`);
  },

  // Fetch a single landmark by ID
  async fetchById(id: string): Promise<Landmark> {
    return fetchAPI<Landmark>(`/landmarks/${id}`);
  },

  // Fetch landmarks near a location
  async fetchNearby(lat: number, lng: number, radiusKm: number): Promise<Landmark[]> {
    const query = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      radius: radiusKm.toString(),
    });
    return fetchAPI<Landmark[]>(`/landmarks/near?${query.toString()}`);
  },

  // Calculate distance from user to landmark
  getDistance(userLocation: UserLocation | null, landmark: Landmark): number | undefined {
    if (!userLocation) return undefined;
    return calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      landmark.latitude,
      landmark.longitude,
    );
  },

  // Filter landmarks based on current filters
  filterLandmarks(
    landmarks: Landmark[],
    filters: {
      categories: string[];
      distance: number | null;
      searchQuery: string;
    },
    userLocation: UserLocation | null,
  ): Landmark[] {
    return landmarks.filter((landmark) => {
      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(landmark.category)) {
        return false;
      }

      // Distance filter
      if (filters.distance && userLocation) {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          landmark.latitude,
          landmark.longitude,
        );
        if (distance > filters.distance) return false;
      }

      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesName = landmark.name.toLowerCase().includes(query);
        const matchesDescription = landmark.shortDescription.toLowerCase().includes(query);
        const matchesTags = landmark.tags.some((tag) => tag.toLowerCase().includes(query));
        if (!matchesName && !matchesDescription && !matchesTags) return false;
      }

      return true;
    });
  },
};
