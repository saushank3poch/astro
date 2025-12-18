/**
 * Date and Time Utilities for Astrological Calculations
 * Handles timezone conversions, solar calendar calculations, and date formatting
 */

export interface DateTimeInfo {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  timezone: string;
}

/**
 * Convert date string and time string to a full DateTime object
 */
export function parseDateTimeStrings(
  dateStr: string,
  timeStr: string,
  timezone: string = 'UTC'
): DateTimeInfo {
  const date = new Date(dateStr);
  const [hours, minutes, seconds = 0] = timeStr.split(':').map(Number);

  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1, // Convert to 1-based month
    day: date.getDate(),
    hour: hours,
    minute: minutes,
    second: seconds,
    timezone,
  };
}

/**
 * Calculate Julian Day Number for astronomical calculations
 * Used by Western astrology for precise planetary positions
 */
export function calculateJulianDay(
  year: number,
  month: number,
  day: number,
  hour: number = 0,
  minute: number = 0,
  second: number = 0
): number {
  // Convert month and year for January and February
  if (month <= 2) {
    year -= 1;
    month += 12;
  }

  // Calculate Julian Day
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);

  const JD = Math.floor(365.25 * (year + 4716)) +
    Math.floor(30.6001 * (month + 1)) +
    day + B - 1524.5;

  // Add time component
  const timeComponent = (hour + minute / 60 + second / 3600) / 24;

  return JD + timeComponent;
}

/**
 * Convert local time to UTC
 */
export function toUTC(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timezoneOffset: number // in hours
): Date {
  const date = new Date(Date.UTC(year, month - 1, day, hour - timezoneOffset, minute));
  return date;
}

/**
 * Get Chinese lunar year start date
 * Simplified calculation - in production, use a lunar calendar library
 */
export function getChineseNewYear(year: number): Date {
  // Chinese New Year dates (2020-2030)
  // In production, use a proper lunar calendar library
  const chineseNewYears: { [key: number]: Date } = {
    2020: new Date(2020, 0, 25),
    2021: new Date(2021, 1, 12),
    2022: new Date(2022, 1, 1),
    2023: new Date(2023, 0, 22),
    2024: new Date(2024, 1, 10),
    2025: new Date(2025, 0, 29),
    2026: new Date(2026, 1, 17),
    2027: new Date(2027, 1, 6),
    2028: new Date(2028, 0, 26),
    2029: new Date(2029, 1, 13),
    2030: new Date(2030, 1, 3),
  };

  return chineseNewYears[year] || estimateChineseNewYear(year);
}

/**
 * Estimate Chinese New Year for years not in the lookup table
 * Falls between Jan 21 and Feb 20
 */
function estimateChineseNewYear(year: number): Date {
  // Simple approximation based on lunar cycle
  // 19-year Metonic cycle
  const baseYear = 2000;
  const baseDate = new Date(2000, 1, 5); // Feb 5, 2000
  const yearDiff = year - baseYear;

  // Average lunar year is 354.37 days
  const daysOffset = Math.round(yearDiff * 354.37) % 365;

  const estimatedDate = new Date(year, 0, 1);
  estimatedDate.setDate(estimatedDate.getDate() + daysOffset);

  // Ensure it's between Jan 21 and Feb 20
  if (estimatedDate.getMonth() === 0 && estimatedDate.getDate() < 21) {
    estimatedDate.setDate(estimatedDate.getDate() + 30);
  } else if (estimatedDate.getMonth() === 1 && estimatedDate.getDate() > 20) {
    estimatedDate.setDate(estimatedDate.getDate() - 30);
  }

  return estimatedDate;
}

/**
 * Get the Chinese zodiac year for a given date
 * Must account for Chinese New Year
 */
export function getChineseZodiacYear(birthDate: Date): number {
  const year = birthDate.getFullYear();
  const chineseNewYear = getChineseNewYear(year);

  // If birthday is before Chinese New Year, use previous year
  if (birthDate < chineseNewYear) {
    return year - 1;
  }

  return year;
}

/**
 * Calculate solar terms for Bazi calculations
 * Simplified version - returns estimated dates
 */
export function getSolarTermDate(year: number, termIndex: number): Date {
  // Solar terms start from Spring Equinox (around March 20-21)
  // There are 24 solar terms in a year
  const springEquinox = new Date(year, 2, 20); // Approximate
  const daysPerTerm = 365.25 / 24;

  const termDate = new Date(springEquinox);
  termDate.setDate(termDate.getDate() + Math.round(daysPerTerm * termIndex));

  return termDate;
}

/**
 * Convert a date to sidereal time (for house calculations)
 */
export function calculateSiderealTime(
  julianDay: number,
  longitude: number
): number {
  // Calculate Greenwich Sidereal Time
  const T = (julianDay - 2451545.0) / 36525;
  const theta0 = 280.46061837 + 360.98564736629 * (julianDay - 2451545.0) +
    0.000387933 * T * T - (T * T * T) / 38710000;

  // Convert to local sidereal time
  const LST = (theta0 + longitude) % 360;

  return LST;
}

/**
 * Format date for display
 */
export function formatDateTime(date: Date, timezone?: string): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  };

  return date.toLocaleDateString('en-US', options);
}
