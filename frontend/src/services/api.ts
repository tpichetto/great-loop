import type {
  Landmark,
  BoundingBox,
  UserLocation,
  User,
  LoginCredentials,
  RegisterData,
  Comment,
  CreateCommentData,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Module-level token storage (in-memory only, never persisted)
let currentAccessToken: string | null = null;

/**
 * Set the current access token for API requests.
 * Called by AuthContext after login/register/refresh.
 */
export function setAccessToken(token: string | null) {
  currentAccessToken = token;
}

/**
 * Low-level fetch that includes credentials for refresh token cookie.
 * Does NOT add Authorization header and does NOT handle 401 retries.
 * Used for token refresh and other special calls.
 */
async function fetchWithCredentials<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    const err = new Error(error.message || `HTTP ${response.status}`);
    (err as any).status = response.status;
    throw err;
  }

  return response.json();
}

/**
 * Main API fetch function.
 * - Adds Authorization header if token available (except for refresh endpoint)
 * - Automatically attempts token refresh on 401 errors
 * - Always sends credentials for refresh token cookie
 */
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const isRefreshCall = endpoint === '/auth/refresh';

  // Add Authorization header if we have a token and this isn't the refresh endpoint
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (!isRefreshCall && currentAccessToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${currentAccessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  // If unauthorized (401) and not already a refresh call, try to refresh the token once
  if (response.status === 401 && !isRefreshCall) {
    try {
      // Attempt to get a new access token using the refresh token cookie
      const refreshResult = await fetchWithCredentials<{ token: string }>('/auth/refresh', {
        method: 'POST',
      });
      const newToken = refreshResult.token;
      setAccessToken(newToken);

      // Retry the original request with the new token
      const retryHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newToken}`,
        ...options.headers,
      };

      const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: retryHeaders,
        credentials: 'include',
      });

      if (!retryResponse.ok) {
        const error = await retryResponse
          .json()
          .catch(() => ({ message: 'Request failed after refresh' }));
        const err = new Error(error.message || `HTTP ${retryResponse.status}`);
        (err as any).status = retryResponse.status;
        throw err;
      }

      return retryResponse.json();
    } catch (refreshError) {
      // Refresh failed: clear token and treat as session expired
      setAccessToken(null);
      // Re-throw with 401 status to trigger login redirect
      const err = refreshError instanceof Error ? refreshError : new Error('Session expired');
      (err as any).status = 401;
      throw err;
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    const err = new Error(error.message || `HTTP ${response.status}`);
    (err as any).status = response.status;
    throw err;
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

// Auth API functions
export const authAPI = {
  // Login user
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    return fetchAPI<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Register new user
  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    return fetchAPI<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Logout - revoke session and clear refresh token cookie
  async logout(): Promise<void> {
    try {
      await fetchAPI('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore errors, client will clear state anyway
    }
  },

  // Refresh access token using refresh token cookie
  async refreshToken(): Promise<{ token: string }> {
    return fetchWithCredentials<{ token: string }>('/auth/refresh', {
      method: 'POST',
    });
  },

  // Get current user profile
  async getCurrentUser(): Promise<User> {
    return fetchAPI<User>('/auth/me');
  },

  // Update user profile
  async updateProfile(data: Partial<User>): Promise<User> {
    return fetchAPI<User>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await fetchAPI('/users/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

// User progress API
export const progressAPI = {
  // Get user's visited/collected landmarks
  async getProgress(): Promise<{ visitedLandmarks: string[]; collectedLandmarks: string[] }> {
    return fetchAPI<{ visitedLandmarks: string[]; collectedLandmarks: string[] }>('/progress');
  },

  // Mark landmark as visited
  async markVisited(landmarkId: string): Promise<void> {
    await fetchAPI(`/progress/visited/${landmarkId}`, { method: 'POST' });
  },

  // Unmark landmark as visited
  async unmarkVisited(landmarkId: string): Promise<void> {
    await fetchAPI(`/progress/visited/${landmarkId}`, { method: 'DELETE' });
  },

  // Mark landmark as collected
  async markCollected(landmarkId: string): Promise<void> {
    await fetchAPI(`/progress/collected/${landmarkId}`, { method: 'POST' });
  },

  // Unmark landmark as collected
  async unmarkCollected(landmarkId: string): Promise<void> {
    await fetchAPI(`/progress/collected/${landmarkId}`, { method: 'DELETE' });
  },
};

// Comments API
export const commentsAPI = {
  // Fetch comments for a landmark
  async fetchByLandmark(landmarkId: string): Promise<Comment[]> {
    return fetchAPI<Comment[]>(`/comments/landmark/${landmarkId}`);
  },

  // Create a new comment
  async create(data: CreateCommentData): Promise<Comment> {
    return fetchAPI<Comment>('/comments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update a comment
  async update(commentId: string, content: string): Promise<Comment> {
    return fetchAPI<Comment>(`/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  },

  // Delete a comment
  async delete(commentId: string): Promise<void> {
    await fetchAPI(`/comments/${commentId}`, { method: 'DELETE' });
  },

  // Flag a comment for moderation
  async flag(commentId: string, reason: string): Promise<void> {
    await fetchAPI(`/comments/${commentId}/flag`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  // Fetch flagged comments (admin only)
  async fetchFlagged(): Promise<Comment[]> {
    return fetchAPI<Comment[]>('/comments/flagged');
  },

  // Approve a flagged comment (admin only)
  async approve(commentId: string): Promise<void> {
    await fetchAPI(`/comments/${commentId}/approve`, { method: 'POST' });
  },

  // Hide a comment (admin only)
  async hide(commentId: string): Promise<void> {
    await fetchAPI(`/comments/${commentId}/hide`, { method: 'POST' });
  },
};
