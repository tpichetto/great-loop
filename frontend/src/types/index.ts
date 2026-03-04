export type LandmarkCategory =
  | 'attraction'
  | 'restaurant'
  | 'park'
  | 'museum'
  | 'historic'
  | 'nature'
  | 'entertainment'
  | 'shopping';

export interface Landmark {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  category: LandmarkCategory;
  latitude: number;
  longitude: number;
  address: string;
  phone?: string;
  website?: string;
  openingHours?: {
    day: string;
    open: string;
    close: string;
  }[];
  images: string[];
  rating?: number;
  reviewCount?: number;
  priceLevel?: 1 | 2 | 3 | 4;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export interface ViewportState {
  center: [number, number];
  zoom: number;
  bounds?: L.LatLngBounds;
}

export interface MapFilters {
  categories: LandmarkCategory[];
  distance: number | null; // in km, null = unlimited
  searchQuery: string;
}

export interface LandmarkPopupData {
  landmark: Landmark;
  distance?: number; // distance from user location in km
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  landmarkId: string;
  parentId?: string;
  isHidden: boolean;
  flagReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentData {
  content: string;
  landmarkId: string;
  parentId?: string;
}
