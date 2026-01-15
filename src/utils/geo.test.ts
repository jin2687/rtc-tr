import { describe, it, expect } from 'vitest';
import {
  calculateDistance,
  calculateBearing,
  calculateRelativeDirection,
  formatDistance,
  getDirectionName,
} from './geo';
import { Location } from '../types';

describe('Geo utilities', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two locations', () => {
      const tokyo: Location = {
        latitude: 35.6762,
        longitude: 139.6503,
        timestamp: Date.now(),
      };
      const osaka: Location = {
        latitude: 34.6937,
        longitude: 135.5023,
        timestamp: Date.now(),
      };

      const distance = calculateDistance(tokyo, osaka);
      // Tokyo to Osaka is approximately 400km
      expect(distance).toBeGreaterThan(350000);
      expect(distance).toBeLessThan(450000);
    });

    it('should return 0 for same location', () => {
      const loc: Location = {
        latitude: 35.6762,
        longitude: 139.6503,
        timestamp: Date.now(),
      };

      const distance = calculateDistance(loc, loc);
      expect(distance).toBe(0);
    });
  });

  describe('calculateBearing', () => {
    it('should calculate bearing from one location to another', () => {
      const start: Location = {
        latitude: 35.6762,
        longitude: 139.6503,
        timestamp: Date.now(),
      };
      const end: Location = {
        latitude: 36.6762,
        longitude: 139.6503,
        timestamp: Date.now(),
      };

      const bearing = calculateBearing(start, end);
      // Going north should be close to 0 degrees
      expect(bearing).toBeGreaterThanOrEqual(0);
      expect(bearing).toBeLessThan(10);
    });

    it('should return value between 0 and 360', () => {
      const loc1: Location = {
        latitude: 35.6762,
        longitude: 139.6503,
        timestamp: Date.now(),
      };
      const loc2: Location = {
        latitude: 34.6937,
        longitude: 135.5023,
        timestamp: Date.now(),
      };

      const bearing = calculateBearing(loc1, loc2);
      expect(bearing).toBeGreaterThanOrEqual(0);
      expect(bearing).toBeLessThan(360);
    });
  });

  describe('calculateRelativeDirection', () => {
    it('should calculate relative direction correctly', () => {
      expect(calculateRelativeDirection(0, 90)).toBe(90);
      expect(calculateRelativeDirection(90, 0)).toBe(-90);
      expect(calculateRelativeDirection(0, 180)).toBe(180);
      expect(calculateRelativeDirection(180, 0)).toBe(-180);
    });

    it('should normalize angles correctly', () => {
      expect(calculateRelativeDirection(10, 350)).toBe(-20);
      expect(calculateRelativeDirection(350, 10)).toBe(20);
    });

    it('should handle same direction', () => {
      expect(calculateRelativeDirection(45, 45)).toBe(0);
    });
  });

  describe('formatDistance', () => {
    it('should format distances under 1km in meters', () => {
      expect(formatDistance(150)).toBe('150m');
      expect(formatDistance(999)).toBe('999m');
    });

    it('should format distances over 1km in kilometers', () => {
      expect(formatDistance(1000)).toBe('1.0km');
      expect(formatDistance(1500)).toBe('1.5km');
      expect(formatDistance(12345)).toBe('12.3km');
    });
  });

  describe('getDirectionName', () => {
    it('should return correct direction names', () => {
      expect(getDirectionName(0)).toBe('N');
      expect(getDirectionName(45)).toBe('NE');
      expect(getDirectionName(90)).toBe('E');
      expect(getDirectionName(135)).toBe('SE');
      expect(getDirectionName(180)).toBe('S');
      expect(getDirectionName(225)).toBe('SW');
      expect(getDirectionName(270)).toBe('W');
      expect(getDirectionName(315)).toBe('NW');
    });

    it('should handle angles near boundaries', () => {
      expect(getDirectionName(22)).toBe('N');
      expect(getDirectionName(23)).toBe('NE');
      expect(getDirectionName(67)).toBe('NE');
      expect(getDirectionName(68)).toBe('E');
    });
  });
});
