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
export declare class DateUtils {
    /**
     * Check if value is a valid date
     */
    static isValidDate(date: any): boolean;
    /**
     * Parse date from various formats
     */
    static parse(input: string | number | Date): Date | null;
    /**
     * Format date to string
     */
    static format(date: Date, pattern: string, options?: DateFormatOptions): string;
    /**
     * Format date using Intl.DateTimeFormat
     */
    static formatIntl(date: Date, options?: DateFormatOptions): string;
    /**
     * Get relative time string (e.g., "2 hours ago")
     */
    static getRelativeTime(date: Date, baseDate?: Date, locale?: string): string;
    /**
     * Add time to date
     */
    static add(date: Date, amount: number, unit: 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'): Date;
    /**
     * Subtract time from date
     */
    static subtract(date: Date, amount: number, unit: 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'): Date;
    /**
     * Get difference between two dates
     */
    static diff(date1: Date, date2: Date): DateDiffResult;
    /**
     * Check if date is between two dates
     */
    static isBetween(date: Date, start: Date, end: Date, options?: DateRangeOptions): boolean;
    /**
     * Check if two dates are the same day
     */
    static isSameDay(date1: Date, date2: Date): boolean;
    /**
     * Check if date is today
     */
    static isToday(date: Date): boolean;
    /**
     * Check if date is yesterday
     */
    static isYesterday(date: Date): boolean;
    /**
     * Check if date is tomorrow
     */
    static isTomorrow(date: Date): boolean;
    /**
     * Check if date is in the past
     */
    static isPast(date: Date): boolean;
    /**
     * Check if date is in the future
     */
    static isFuture(date: Date): boolean;
    /**
     * Check if year is leap year
     */
    static isLeapYear(year: number): boolean;
    /**
     * Get number of days in month
     */
    static getDaysInMonth(year: number, month: number): number;
    /**
     * Get start of day
     */
    static startOfDay(date: Date): Date;
    /**
     * Get end of day
     */
    static endOfDay(date: Date): Date;
    /**
     * Get start of week
     */
    static startOfWeek(date: Date, startOfWeek?: number): Date;
    /**
     * Get end of week
     */
    static endOfWeek(date: Date, startOfWeek?: number): Date;
    /**
     * Get start of month
     */
    static startOfMonth(date: Date): Date;
    /**
     * Get end of month
     */
    static endOfMonth(date: Date): Date;
    /**
     * Get start of year
     */
    static startOfYear(date: Date): Date;
    /**
     * Get end of year
     */
    static endOfYear(date: Date): Date;
    /**
     * Get age from birth date
     */
    static getAge(birthDate: Date, referenceDate?: Date): number;
    /**
     * Get timezone offset in minutes
     */
    static getTimezoneOffset(date?: Date): number;
    /**
     * Convert date to UTC
     */
    static toUTC(date: Date): Date;
    /**
     * Convert UTC date to local time
     */
    static fromUTC(date: Date): Date;
    /**
     * Get week number of year
     */
    static getWeekNumber(date: Date): number;
    /**
     * Get quarter of year
     */
    static getQuarter(date: Date): number;
    /**
     * Generate date range
     */
    static range(start: Date, end: Date, step?: number, unit?: 'days' | 'weeks' | 'months' | 'years'): Date[];
    /**
     * Get business days between dates (excluding weekends)
     */
    static getBusinessDays(start: Date, end: Date): number;
    /**
     * Format duration in milliseconds to human readable string
     */
    static formatDuration(milliseconds: number): string;
}
export declare const isValidDate: typeof DateUtils.isValidDate, parse: typeof DateUtils.parse, format: typeof DateUtils.format, formatIntl: typeof DateUtils.formatIntl, getRelativeTime: typeof DateUtils.getRelativeTime, add: typeof DateUtils.add, subtract: typeof DateUtils.subtract, diff: typeof DateUtils.diff, isBetween: typeof DateUtils.isBetween, isSameDay: typeof DateUtils.isSameDay, isToday: typeof DateUtils.isToday, isYesterday: typeof DateUtils.isYesterday, isTomorrow: typeof DateUtils.isTomorrow, isPast: typeof DateUtils.isPast, isFuture: typeof DateUtils.isFuture, isLeapYear: typeof DateUtils.isLeapYear, getDaysInMonth: typeof DateUtils.getDaysInMonth, startOfDay: typeof DateUtils.startOfDay, endOfDay: typeof DateUtils.endOfDay, startOfWeek: typeof DateUtils.startOfWeek, endOfWeek: typeof DateUtils.endOfWeek, startOfMonth: typeof DateUtils.startOfMonth, endOfMonth: typeof DateUtils.endOfMonth, startOfYear: typeof DateUtils.startOfYear, endOfYear: typeof DateUtils.endOfYear, getAge: typeof DateUtils.getAge, getTimezoneOffset: typeof DateUtils.getTimezoneOffset, toUTC: typeof DateUtils.toUTC, fromUTC: typeof DateUtils.fromUTC, getWeekNumber: typeof DateUtils.getWeekNumber, getQuarter: typeof DateUtils.getQuarter, range: typeof DateUtils.range, getBusinessDays: typeof DateUtils.getBusinessDays, formatDuration: typeof DateUtils.formatDuration;
//# sourceMappingURL=date-utils.d.ts.map