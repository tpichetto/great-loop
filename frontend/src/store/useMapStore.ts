import { create } from 'zustand';
import type { Landmark, UserLocation, MapFilters, ViewportState } from '../types';

interface MapStore {
  // State
  landmarks: Landmark[];
  userLocation: UserLocation | null;
  filters: MapFilters;
  selectedLandmark: Landmark | null;
  viewport: ViewportState;
  isLoading: boolean;
  error: string | null;

  // Actions
  setLandmarks: (landmarks: Landmark[]) => void;
  addLandmarks: (landmarks: Landmark[]) => void;
  clearLandmarks: () => void;
  setUserLocation: (location: UserLocation | null) => void;
  setFilters: (filters: Partial<MapFilters>) => void;
  setSelectedLandmark: (landmark: Landmark | null) => void;
  setViewport: (viewport: Partial<ViewportState>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

const defaultFilters: MapFilters = {
  categories: [],
  distance: null,
  searchQuery: '',
};

const defaultViewport: ViewportState = {
  center: [39.8283, -98.5795], // Center of US
  zoom: 4,
};

export const useMapStore = create<MapStore>((set) => ({
  landmarks: [],
  userLocation: null,
  filters: defaultFilters,
  selectedLandmark: null,
  viewport: defaultViewport,
  isLoading: false,
  error: null,

  setLandmarks: (landmarks) => set({ landmarks }),
  addLandmarks: (newLandmarks) =>
    set((state) => ({
      landmarks: [...state.landmarks, ...newLandmarks],
    })),
  clearLandmarks: () => set({ landmarks: [] }),
  setUserLocation: (userLocation) => set({ userLocation }),
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  setSelectedLandmark: (selectedLandmark) => set({ selectedLandmark }),
  setViewport: (newViewport) =>
    set((state) => ({
      viewport: { ...state.viewport, ...newViewport },
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
