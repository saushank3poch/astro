/**
 * Geographic Coordinates Utilities
 * Handles location data for astrological calculations
 */

export interface GeoLocation {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  timezone?: string;
}

/**
 * Parse location object from database
 */
export function parseLocation(locationJson: any): GeoLocation {
  if (!locationJson) {
    throw new Error('Location data is required for birth chart calculations');
  }

  return {
    latitude: locationJson.latitude || locationJson.lat,
    longitude: locationJson.longitude || locationJson.lng || locationJson.lon,
    city: locationJson.city,
    country: locationJson.country,
    timezone: locationJson.timezone,
  };
}

/**
 * Validate geographic coordinates
 */
export function isValidCoordinates(lat: number, lon: number): boolean {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Useful for timezone approximations
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
export function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Estimate timezone offset based on longitude
 * Note: This is a rough approximation. For production, use a timezone database.
 */
export function estimateTimezoneOffset(longitude: number): number {
  // Each 15 degrees of longitude = 1 hour
  return Math.round(longitude / 15);
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';

  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lon).toFixed(4)}°${lonDir}`;
}

/**
 * Major city coordinates for testing
 */
export const MAJOR_CITIES: { [key: string]: GeoLocation } = {
  'New York': {
    latitude: 40.7128,
    longitude: -74.0060,
    city: 'New York',
    country: 'USA',
    timezone: 'America/New_York',
  },
  'London': {
    latitude: 51.5074,
    longitude: -0.1278,
    city: 'London',
    country: 'UK',
    timezone: 'Europe/London',
  },
  'Tokyo': {
    latitude: 35.6762,
    longitude: 139.6503,
    city: 'Tokyo',
    country: 'Japan',
    timezone: 'Asia/Tokyo',
  },
  'Beijing': {
    latitude: 39.9042,
    longitude: 116.4074,
    city: 'Beijing',
    country: 'China',
    timezone: 'Asia/Shanghai',
  },
  'Los Angeles': {
    latitude: 34.0522,
    longitude: -118.2437,
    city: 'Los Angeles',
    country: 'USA',
    timezone: 'America/Los_Angeles',
  },
};
