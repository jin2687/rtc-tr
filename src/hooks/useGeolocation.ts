import { useState, useEffect, useCallback } from 'react';
import { Location } from '../types';

interface UseGeolocationResult {
  location: Location | null;
  error: string | null;
  isLoading: boolean;
  startTracking: () => void;
  stopTracking: () => void;
}

export function useGeolocation(updateInterval: number = 5000): UseGeolocationResult {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('お使いのブラウザは位置情報をサポートしていません');
      return;
    }

    setIsLoading(true);
    setError(null);

    const id = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: position.timestamp,
        });
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        setError(`位置情報の取得に失敗しました: ${err.message}`);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: updateInterval,
      }
    );

    setWatchId(id);
  }, [updateInterval]);

  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    location,
    error,
    isLoading,
    startTracking,
    stopTracking,
  };
}
