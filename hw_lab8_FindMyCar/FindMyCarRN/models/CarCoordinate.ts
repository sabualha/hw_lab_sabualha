export interface CarCoordinate {
  latitude: number;
  longitude: number;
}

/**
 * Placeholder coordinate used before anything has been saved
 * (and after the location is cleared). (0, 0) is treated as "no location".
 */
export const defaultCarCoordinate: CarCoordinate = {
  latitude: 0.0,
  longitude: 0.0,
};

/**
 * Checks whether a coordinate represents a real saved location.
 * @param coordinate - The coordinate to check.
 * @returns true if either latitude or longitude is non-zero,
 *          false if it is still the default (0, 0).
 */
export function isValidCoordinate(coordinate: CarCoordinate): boolean {
  return coordinate.latitude !== 0 || coordinate.longitude !== 0;
}

/**
 * Formats a coordinate as a human-readable string with six decimal places,
 * e.g. "(40.444644, -79.945424)".
 * @param coordinate - The coordinate to format.
 * @returns The formatted "(lat, lon)" string.
 */
export function formatCoordinate(coordinate: CarCoordinate): string {
  // toFixed(6) rounds/pads each value to exactly six decimal places
  const lat = coordinate.latitude.toFixed(6);
  const lon = coordinate.longitude.toFixed(6);
  return `(${lat}, ${lon})`;
}
