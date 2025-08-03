/**
 * Date utilities for date manipulation and formatting
 */

export interface DateFormatOptions {
  locale?: string;
  timeZone?: string;
  format?: 'short' | 'medium' | 'long' | 'full';
  includeTime?: boolean;
}

export interface DateRangeOptions {
  inclusive?: boolean;
  unit?: 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';
}

export interface DateDiffResult {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
  totalMilliseconds: number;
}

/**
 * Date utilities class
 */
export class DateUtils {
  /**
   * Check if value is a valid date
   */
  static isValidDate(date: any): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Parse date from various formats
   */
  static parse(input: string | number | Date): Date | null {
    if (input instanceof Date) {
      return this.isValidDate(input) ? input : null;
    }
    
    if (typeof input === 'number') {
      const date = new Date(input);
      return this.isValidDate(date) ? date : null;
    }
    
    if (typeof input === 'string') {
      // Try ISO format first
      let date = new Date(input);
      if (this.isValidDate(date)) {
        return date;
      }
      
      // Try common formats
      const formats = [
        /^(\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD
        /^(\d{2})\/(\d{2})\/(\d{4})$/, // MM/DD/YYYY
        /^(\d{2})-(\d{2})-(\d{4})$/, // MM-DD-YYYY
        /^(\d{4})\/(\d{2})\/(\d{2})$/, // YYYY/MM/DD
      ];
      
      for (const format of formats) {
        const match = input.match(format);
        if (match) {
          const [, part1, part2, part3] = match;
          
          // Try different interpretations
          const attempts = [
            new Date(parseInt(part1), parseInt(part2) - 1, parseInt(part3)),
            new Date(parseInt(part3), parseInt(part1) - 1, parseInt(part2)),
            new Date(parseInt(part3), parseInt(part2) - 1, parseInt(part1)),
          ];
          
          for (const attempt of attempts) {
            if (this.isValidDate(attempt)) {
              return attempt;
            }
          }
        }
      }
    }
    
    return null;
  }

  /**
   * Format date to string
   */
  static format(
    date: Date,
    pattern: string,
    options: DateFormatOptions = {}
  ): string {
    if (!this.isValidDate(date)) {
      throw new Error('Invalid date');
    }
    
    const { locale = 'en-US', timeZone } = options;
    
    // Common format patterns
    const formatMap: Record<string, () => string> = {
      'YYYY': () => date.getFullYear().toString(),
      'YY': () => date.getFullYear().toString().slice(-2),
      'MM': () => (date.getMonth() + 1).toString().padStart(2, '0'),
      'M': () => (date.getMonth() + 1).toString(),
      'DD': () => date.getDate().toString().padStart(2, '0'),
      'D': () => date.getDate().toString(),
      'HH': () => date.getHours().toString().padStart(2, '0'),
      'H': () => date.getHours().toString(),
      'hh': () => (date.getHours() % 12 || 12).toString().padStart(2, '0'),
      'h': () => (date.getHours() % 12 || 12).toString(),
      'mm': () => date.getMinutes().toString().padStart(2, '0'),
      'm': () => date.getMinutes().toString(),
      'ss': () => date.getSeconds().toString().padStart(2, '0'),
      's': () => date.getSeconds().toString(),
      'SSS': () => date.getMilliseconds().toString().padStart(3, '0'),
      'A': () => date.getHours() >= 12 ? 'PM' : 'AM',
      'a': () => date.getHours() >= 12 ? 'pm' : 'am',
    };
    
    let result = pattern;
    
    // Replace patterns in order of length (longest first)
    const sortedPatterns = Object.keys(formatMap).sort((a, b) => b.length - a.length);
    
    for (const pattern of sortedPatterns) {
      result = result.replace(new RegExp(pattern, 'g'), formatMap[pattern]());
    }
    
    return result;
  }

  /**
   * Format date using Intl.DateTimeFormat
   */
  static formatIntl(
    date: Date,
    options: DateFormatOptions = {}
  ): string {
    if (!this.isValidDate(date)) {
      throw new Error('Invalid date');
    }
    
    const {
      locale = 'en-US',
      timeZone,
      format = 'medium',
      includeTime = false,
    } = options;
    
    const formatOptions: Intl.DateTimeFormatOptions = {
      timeZone,
    };
    
    switch (format) {
      case 'short':
        formatOptions.dateStyle = 'short';
        break;
      case 'medium':
        formatOptions.dateStyle = 'medium';
        break;
      case 'long':
        formatOptions.dateStyle = 'long';
        break;
      case 'full':
        formatOptions.dateStyle = 'full';
        break;
    }
    
    if (includeTime) {
      formatOptions.timeStyle = format;
    }
    
    return new Intl.DateTimeFormat(locale, formatOptions).format(date);
  }

  /**
   * Get relative time string (e.g., "2 hours ago")
   */
  static getRelativeTime(
    date: Date,
    baseDate: Date = new Date(),
    locale = 'en-US'
  ): string {
    if (!this.isValidDate(date) || !this.isValidDate(baseDate)) {
      throw new Error('Invalid date');
    }
    
    const diff = baseDate.getTime() - date.getTime();
    const absDiff = Math.abs(diff);
    const isPast = diff > 0;
    
    const units = [
      { unit: 'year', ms: 365 * 24 * 60 * 60 * 1000 },
      { unit: 'month', ms: 30 * 24 * 60 * 60 * 1000 },
      { unit: 'week', ms: 7 * 24 * 60 * 60 * 1000 },
      { unit: 'day', ms: 24 * 60 * 60 * 1000 },
      { unit: 'hour', ms: 60 * 60 * 1000 },
      { unit: 'minute', ms: 60 * 1000 },
      { unit: 'second', ms: 1000 },
    ];
    
    for (const { unit, ms } of units) {
      const value = Math.floor(absDiff / ms);
      if (value >= 1) {
        const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
        return rtf.format(isPast ? -value : value, unit as Intl.RelativeTimeFormatUnit);
      }
    }
    
    return 'now';
  }

  /**
   * Add time to date
   */
  static add(
    date: Date,
    amount: number,
    unit: 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'
  ): Date {
    if (!this.isValidDate(date)) {
      throw new Error('Invalid date');
    }
    
    const result = new Date(date);
    
    switch (unit) {
      case 'milliseconds':
        result.setMilliseconds(result.getMilliseconds() + amount);
        break;
      case 'seconds':
        result.setSeconds(result.getSeconds() + amount);
        break;
      case 'minutes':
        result.setMinutes(result.getMinutes() + amount);
        break;
      case 'hours':
        result.setHours(result.getHours() + amount);
        break;
      case 'days':
        result.setDate(result.getDate() + amount);
        break;
      case 'weeks':
        result.setDate(result.getDate() + amount * 7);
        break;
      case 'months':
        result.setMonth(result.getMonth() + amount);
        break;
      case 'years':
        result.setFullYear(result.getFullYear() + amount);
        break;
    }
    
    return result;
  }

  /**
   * Subtract time from date
   */
  static subtract(
    date: Date,
    amount: number,
    unit: 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'
  ): Date {
    return this.add(date, -amount, unit);
  }

  /**
   * Get difference between two dates
   */
  static diff(date1: Date, date2: Date): DateDiffResult {
    if (!this.isValidDate(date1) || !this.isValidDate(date2)) {
      throw new Error('Invalid date');
    }
    
    const totalMilliseconds = Math.abs(date1.getTime() - date2.getTime());
    const totalSeconds = Math.floor(totalMilliseconds / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);
    
    const years = Math.floor(totalDays / 365);
    const months = Math.floor((totalDays % 365) / 30);
    const days = totalDays % 30;
    const hours = totalHours % 24;
    const minutes = totalMinutes % 60;
    const seconds = totalSeconds % 60;
    const milliseconds = totalMilliseconds % 1000;
    
    return {
      years,
      months,
      days,
      hours,
      minutes,
      seconds,
      milliseconds,
      totalDays,
      totalHours,
      totalMinutes,
      totalSeconds,
      totalMilliseconds,
    };
  }

  /**
   * Check if date is between two dates
   */
  static isBetween(
    date: Date,
    start: Date,
    end: Date,
    options: DateRangeOptions = {}
  ): boolean {
    if (!this.isValidDate(date) || !this.isValidDate(start) || !this.isValidDate(end)) {
      throw new Error('Invalid date');
    }
    
    const { inclusive = true } = options;
    const dateTime = date.getTime();
    const startTime = start.getTime();
    const endTime = end.getTime();
    
    if (inclusive) {
      return dateTime >= startTime && dateTime <= endTime;
    } else {
      return dateTime > startTime && dateTime < endTime;
    }
  }

  /**
   * Check if two dates are the same day
   */
  static isSameDay(date1: Date, date2: Date): boolean {
    if (!this.isValidDate(date1) || !this.isValidDate(date2)) {
      return false;
    }
    
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  /**
   * Check if date is today
   */
  static isToday(date: Date): boolean {
    return this.isSameDay(date, new Date());
  }

  /**
   * Check if date is yesterday
   */
  static isYesterday(date: Date): boolean {
    const yesterday = this.subtract(new Date(), 1, 'days');
    return this.isSameDay(date, yesterday);
  }

  /**
   * Check if date is tomorrow
   */
  static isTomorrow(date: Date): boolean {
    const tomorrow = this.add(new Date(), 1, 'days');
    return this.isSameDay(date, tomorrow);
  }

  /**
   * Check if date is in the past
   */
  static isPast(date: Date): boolean {
    return date.getTime() < Date.now();
  }

  /**
   * Check if date is in the future
   */
  static isFuture(date: Date): boolean {
    return date.getTime() > Date.now();
  }

  /**
   * Check if year is leap year
   */
  static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  /**
   * Get number of days in month
   */
  static getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  /**
   * Get start of day
   */
  static startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * Get end of day
   */
  static endOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  /**
   * Get start of week
   */
  static startOfWeek(date: Date, startOfWeek = 0): Date {
    const result = new Date(date);
    const day = result.getDay();
    const diff = (day < startOfWeek ? 7 : 0) + day - startOfWeek;
    result.setDate(result.getDate() - diff);
    return this.startOfDay(result);
  }

  /**
   * Get end of week
   */
  static endOfWeek(date: Date, startOfWeek = 0): Date {
    const start = this.startOfWeek(date, startOfWeek);
    return this.endOfDay(this.add(start, 6, 'days'));
  }

  /**
   * Get start of month
   */
  static startOfMonth(date: Date): Date {
    const result = new Date(date);
    result.setDate(1);
    return this.startOfDay(result);
  }

  /**
   * Get end of month
   */
  static endOfMonth(date: Date): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + 1, 0);
    return this.endOfDay(result);
  }

  /**
   * Get start of year
   */
  static startOfYear(date: Date): Date {
    const result = new Date(date);
    result.setMonth(0, 1);
    return this.startOfDay(result);
  }

  /**
   * Get end of year
   */
  static endOfYear(date: Date): Date {
    const result = new Date(date);
    result.setMonth(11, 31);
    return this.endOfDay(result);
  }

  /**
   * Get age from birth date
   */
  static getAge(birthDate: Date, referenceDate: Date = new Date()): number {
    if (!this.isValidDate(birthDate) || !this.isValidDate(referenceDate)) {
      throw new Error('Invalid date');
    }
    
    let age = referenceDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = referenceDate.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Get timezone offset in minutes
   */
  static getTimezoneOffset(date: Date = new Date()): number {
    return date.getTimezoneOffset();
  }

  /**
   * Convert date to UTC
   */
  static toUTC(date: Date): Date {
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  }

  /**
   * Convert UTC date to local time
   */
  static fromUTC(date: Date): Date {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  }

  /**
   * Get week number of year
   */
  static getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  /**
   * Get quarter of year
   */
  static getQuarter(date: Date): number {
    return Math.floor((date.getMonth() + 3) / 3);
  }

  /**
   * Generate date range
   */
  static range(
    start: Date,
    end: Date,
    step: number = 1,
    unit: 'days' | 'weeks' | 'months' | 'years' = 'days'
  ): Date[] {
    if (!this.isValidDate(start) || !this.isValidDate(end)) {
      throw new Error('Invalid date');
    }
    
    const dates: Date[] = [];
    let current = new Date(start);
    
    while (current <= end) {
      dates.push(new Date(current));
      current = this.add(current, step, unit);
    }
    
    return dates;
  }

  /**
   * Get business days between dates (excluding weekends)
   */
  static getBusinessDays(start: Date, end: Date): number {
    if (!this.isValidDate(start) || !this.isValidDate(end)) {
      throw new Error('Invalid date');
    }
    
    let count = 0;
    const current = new Date(start);
    
    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  }

  /**
   * Format duration in milliseconds to human readable string
   */
  static formatDuration(milliseconds: number): string {
    const units = [
      { name: 'year', ms: 365 * 24 * 60 * 60 * 1000 },
      { name: 'month', ms: 30 * 24 * 60 * 60 * 1000 },
      { name: 'day', ms: 24 * 60 * 60 * 1000 },
      { name: 'hour', ms: 60 * 60 * 1000 },
      { name: 'minute', ms: 60 * 1000 },
      { name: 'second', ms: 1000 },
    ];
    
    for (const unit of units) {
      const value = Math.floor(milliseconds / unit.ms);
      if (value >= 1) {
        return `${value} ${unit.name}${value > 1 ? 's' : ''}`;
      }
    }
    
    return `${milliseconds} millisecond${milliseconds !== 1 ? 's' : ''}`;
  }
}

// Export commonly used functions
export const {
  isValidDate,
  parse,
  format,
  formatIntl,
  getRelativeTime,
  add,
  subtract,
  diff,
  isBetween,
  isSameDay,
  isToday,
  isYesterday,
  isTomorrow,
  isPast,
  isFuture,
  isLeapYear,
  getDaysInMonth,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  getAge,
  getTimezoneOffset,
  toUTC,
  fromUTC,
  getWeekNumber,
  getQuarter,
  range,
  getBusinessDays,
  formatDuration,
} = DateUtils;