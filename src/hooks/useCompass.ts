import { useState, useEffect, useCallback } from 'react';

interface UseCompassResult {
  heading: number | null;
  error: string | null;
  needsPermission: boolean;
  requestPermission: () => Promise<void>;
  isSupported: boolean;
}

// Type augmentation for iOS compass APIs
declare global {
  interface DeviceOrientationEvent {
    webkitCompassHeading?: number;
  }

  interface DeviceOrientationEventConstructor {
    requestPermission?: () => Promise<'granted' | 'denied'>;
  }
}

export function useCompass(): UseCompassResult {
  const [heading, setHeading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsPermission, setNeedsPermission] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if DeviceOrientationEvent is supported
    if (typeof DeviceOrientationEvent !== 'undefined') {
      setIsSupported(true);

      // Check if iOS permission is needed
      if (
        typeof (DeviceOrientationEvent as unknown as DeviceOrientationEventConstructor)
          .requestPermission === 'function'
      ) {
        setNeedsPermission(true);
      }
    } else {
      setIsSupported(false);
      setError('お使いのデバイスはコンパスをサポートしていません');
    }
  }, []);

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    let compassHeading: number | null = null;

    // iOS: Use webkitCompassHeading
    if (event.webkitCompassHeading !== undefined) {
      compassHeading = event.webkitCompassHeading;
    }
    // Android: Calculate from alpha
    else if (event.alpha !== null) {
      // On Android, alpha represents the compass heading
      // Need to invert for correct direction
      compassHeading = 360 - event.alpha;
    }

    if (compassHeading !== null) {
      setHeading(compassHeading);
      setError(null);
    }
  }, []);

  const handleOrientationAbsolute = useCallback((event: DeviceOrientationEvent) => {
    // Android Chrome uses deviceorientationabsolute event
    if (event.alpha !== null) {
      const compassHeading = 360 - event.alpha;
      setHeading(compassHeading);
      setError(null);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (
      typeof (DeviceOrientationEvent as unknown as DeviceOrientationEventConstructor)
        .requestPermission === 'function'
    ) {
      try {
        const permission = await (
          DeviceOrientationEvent as unknown as DeviceOrientationEventConstructor
        ).requestPermission!();

        if (permission === 'granted') {
          setNeedsPermission(false);
          setError(null);
        } else {
          setError('コンパスの使用が拒否されました');
        }
      } catch (err) {
        setError('コンパスの許可リクエストに失敗しました');
        console.error('Compass permission error:', err);
      }
    }
  }, []);

  useEffect(() => {
    if (!isSupported || needsPermission) {
      return;
    }

    // Try to use deviceorientationabsolute first (Android Chrome)
    const supportsAbsolute = 'ondeviceorientationabsolute' in window;

    if (supportsAbsolute) {
      window.addEventListener('deviceorientationabsolute', handleOrientationAbsolute as EventListener);
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      if (supportsAbsolute) {
        window.removeEventListener('deviceorientationabsolute', handleOrientationAbsolute as EventListener);
      } else {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, [isSupported, needsPermission, handleOrientation, handleOrientationAbsolute]);

  return {
    heading,
    error,
    needsPermission,
    requestPermission,
    isSupported,
  };
}
