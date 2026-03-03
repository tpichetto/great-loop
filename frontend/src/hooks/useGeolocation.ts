import { useState, useEffect, useCallback, useRef } from 'react';
import type { UserLocation } from '../types';

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean; // Continuously watch position
}

interface UseGeolocationResult {
  location: UserLocation | null;
  error: string | null;
  isLoading: boolean;
  isSupported: boolean;
  startWatching: () => void;
  stopWatching: () => void;
}

export function useGeolocation({
  enableHighAccuracy = true,
  timeout = 10000,
  maximumAge = 0,
  watch = false,
}: UseGeolocationOptions = {}): UseGeolocationResult {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported] = useState(typeof navigator !== 'undefined' && 'geolocation' in navigator);

  const watchIdRef = useRef<number | null>(null);

  const getCurrentPosition = useCallback((): Promise<UserLocation> => {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          setLocation({
            latitude,
            longitude,
            accuracy,
            timestamp: position.timestamp,
          });
          resolve({
            latitude,
            longitude,
            accuracy,
            timestamp: position.timestamp,
          });
        },
        (err) => {
          let message = 'Unknown error occurred';
          switch (err.code) {
            case err.PERMISSION_DENIED:
              message = 'Geolocation permission denied';
              break;
            case err.POSITION_UNAVAILABLE:
              message = 'Position unavailable';
              break;
            case err.TIMEOUT:
              message = 'Geolocation request timed out';
              break;
          }
          setError(message);
          reject(new Error(message));
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
        },
      );
    });
  }, [enableHighAccuracy, timeout, maximumAge]);

  const startWatching = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported');
      return;
    }

    setIsLoading(true);
    setError(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLocation({
          latitude,
          longitude,
          accuracy,
          timestamp: position.timestamp,
        });
        setIsLoading(false);
      },
      (err) => {
        let message = 'Unknown error occurred';
        switch (err.code) {
          case err.PERMISSION_DENIED:
            message = 'Geolocation permission denied';
            break;
          case err.POSITION_UNAVAILABLE:
            message = 'Position unavailable';
            break;
          case err.TIMEOUT:
            message = 'Geolocation request timed out';
            break;
        }
        setError(message);
        setIsLoading(false);
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      },
    );
  }, [enableHighAccuracy, timeout, maximumAge]);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Initial location fetch (only if not watching)
  useEffect(() => {
    if (!watch && isSupported) {
      setIsLoading(true);
      getCurrentPosition()
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [watch, isSupported, getCurrentPosition]);

  // Auto-start watching if watch is true
  useEffect(() => {
    if (watch && isSupported) {
      startWatching();
    }

    return () => {
      if (!watch && watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [watch, isSupported, startWatching]);

  return {
    location,
    error,
    isLoading,
    isSupported,
    startWatching,
    stopWatching,
  };
}
