"use strict";
/**
 * Date utilities for date manipulation and formatting
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDuration = exports.getBusinessDays = exports.range = exports.getQuarter = exports.getWeekNumber = exports.fromUTC = exports.toUTC = exports.getTimezoneOffset = exports.getAge = exports.endOfYear = exports.startOfYear = exports.endOfMonth = exports.startOfMonth = exports.endOfWeek = exports.startOfWeek = exports.endOfDay = exports.startOfDay = exports.getDaysInMonth = exports.isLeapYear = exports.isFuture = exports.isPast = exports.isTomorrow = exports.isYesterday = exports.isToday = exports.isSameDay = exports.isBetween = exports.diff = exports.subtract = exports.add = exports.getRelativeTime = exports.formatIntl = exports.format = exports.parse = exports.isValidDate = exports.DateUtils = void 0;
/**
 * Date utilities class
 */
class DateUtils {
    /**
     * Check if value is a valid date
     */
    static isValidDate(date) {
        return date instanceof Date && !isNaN(date.getTime());
    }
    /**
     * Parse date from various formats
     */
    static parse(input) {
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
    static format(date, pattern, options = {}) {
        if (!this.isValidDate(date)) {
            throw new Error('Invalid date');
        }
        const { locale = 'en-US', timeZone } = options;
        // Common format patterns
        const formatMap = {
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
    static formatIntl(date, options = {}) {
        if (!this.isValidDate(date)) {
            throw new Error('Invalid date');
        }
        const { locale = 'en-US', timeZone, format = 'medium', includeTime = false, } = options;
        const formatOptions = {
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
    static getRelativeTime(date, baseDate = new Date(), locale = 'en-US') {
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
                return rtf.format(isPast ? -value : value, unit);
            }
        }
        return 'now';
    }
    /**
     * Add time to date
     */
    static add(date, amount, unit) {
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
    static subtract(date, amount, unit) {
        return this.add(date, -amount, unit);
    }
    /**
     * Get difference between two dates
     */
    static diff(date1, date2) {
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
    static isBetween(date, start, end, options = {}) {
        if (!this.isValidDate(date) || !this.isValidDate(start) || !this.isValidDate(end)) {
            throw new Error('Invalid date');
        }
        const { inclusive = true } = options;
        const dateTime = date.getTime();
        const startTime = start.getTime();
        const endTime = end.getTime();
        if (inclusive) {
            return dateTime >= startTime && dateTime <= endTime;
        }
        else {
            return dateTime > startTime && dateTime < endTime;
        }
    }
    /**
     * Check if two dates are the same day
     */
    static isSameDay(date1, date2) {
        if (!this.isValidDate(date1) || !this.isValidDate(date2)) {
            return false;
        }
        return (date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate());
    }
    /**
     * Check if date is today
     */
    static isToday(date) {
        return this.isSameDay(date, new Date());
    }
    /**
     * Check if date is yesterday
     */
    static isYesterday(date) {
        const yesterday = this.subtract(new Date(), 1, 'days');
        return this.isSameDay(date, yesterday);
    }
    /**
     * Check if date is tomorrow
     */
    static isTomorrow(date) {
        const tomorrow = this.add(new Date(), 1, 'days');
        return this.isSameDay(date, tomorrow);
    }
    /**
     * Check if date is in the past
     */
    static isPast(date) {
        return date.getTime() < Date.now();
    }
    /**
     * Check if date is in the future
     */
    static isFuture(date) {
        return date.getTime() > Date.now();
    }
    /**
     * Check if year is leap year
     */
    static isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }
    /**
     * Get number of days in month
     */
    static getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }
    /**
     * Get start of day
     */
    static startOfDay(date) {
        const result = new Date(date);
        result.setHours(0, 0, 0, 0);
        return result;
    }
    /**
     * Get end of day
     */
    static endOfDay(date) {
        const result = new Date(date);
        result.setHours(23, 59, 59, 999);
        return result;
    }
    /**
     * Get start of week
     */
    static startOfWeek(date, startOfWeek = 0) {
        const result = new Date(date);
        const day = result.getDay();
        const diff = (day < startOfWeek ? 7 : 0) + day - startOfWeek;
        result.setDate(result.getDate() - diff);
        return this.startOfDay(result);
    }
    /**
     * Get end of week
     */
    static endOfWeek(date, startOfWeek = 0) {
        const start = this.startOfWeek(date, startOfWeek);
        return this.endOfDay(this.add(start, 6, 'days'));
    }
    /**
     * Get start of month
     */
    static startOfMonth(date) {
        const result = new Date(date);
        result.setDate(1);
        return this.startOfDay(result);
    }
    /**
     * Get end of month
     */
    static endOfMonth(date) {
        const result = new Date(date);
        result.setMonth(result.getMonth() + 1, 0);
        return this.endOfDay(result);
    }
    /**
     * Get start of year
     */
    static startOfYear(date) {
        const result = new Date(date);
        result.setMonth(0, 1);
        return this.startOfDay(result);
    }
    /**
     * Get end of year
     */
    static endOfYear(date) {
        const result = new Date(date);
        result.setMonth(11, 31);
        return this.endOfDay(result);
    }
    /**
     * Get age from birth date
     */
    static getAge(birthDate, referenceDate = new Date()) {
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
    static getTimezoneOffset(date = new Date()) {
        return date.getTimezoneOffset();
    }
    /**
     * Convert date to UTC
     */
    static toUTC(date) {
        return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    }
    /**
     * Convert UTC date to local time
     */
    static fromUTC(date) {
        return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    }
    /**
     * Get week number of year
     */
    static getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    }
    /**
     * Get quarter of year
     */
    static getQuarter(date) {
        return Math.floor((date.getMonth() + 3) / 3);
    }
    /**
     * Generate date range
     */
    static range(start, end, step = 1, unit = 'days') {
        if (!this.isValidDate(start) || !this.isValidDate(end)) {
            throw new Error('Invalid date');
        }
        const dates = [];
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
    static getBusinessDays(start, end) {
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
    static formatDuration(milliseconds) {
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
exports.DateUtils = DateUtils;
// Export commonly used functions
exports.isValidDate = DateUtils.isValidDate, exports.parse = DateUtils.parse, exports.format = DateUtils.format, exports.formatIntl = DateUtils.formatIntl, exports.getRelativeTime = DateUtils.getRelativeTime, exports.add = DateUtils.add, exports.subtract = DateUtils.subtract, exports.diff = DateUtils.diff, exports.isBetween = DateUtils.isBetween, exports.isSameDay = DateUtils.isSameDay, exports.isToday = DateUtils.isToday, exports.isYesterday = DateUtils.isYesterday, exports.isTomorrow = DateUtils.isTomorrow, exports.isPast = DateUtils.isPast, exports.isFuture = DateUtils.isFuture, exports.isLeapYear = DateUtils.isLeapYear, exports.getDaysInMonth = DateUtils.getDaysInMonth, exports.startOfDay = DateUtils.startOfDay, exports.endOfDay = DateUtils.endOfDay, exports.startOfWeek = DateUtils.startOfWeek, exports.endOfWeek = DateUtils.endOfWeek, exports.startOfMonth = DateUtils.startOfMonth, exports.endOfMonth = DateUtils.endOfMonth, exports.startOfYear = DateUtils.startOfYear, exports.endOfYear = DateUtils.endOfYear, exports.getAge = DateUtils.getAge, exports.getTimezoneOffset = DateUtils.getTimezoneOffset, exports.toUTC = DateUtils.toUTC, exports.fromUTC = DateUtils.fromUTC, exports.getWeekNumber = DateUtils.getWeekNumber, exports.getQuarter = DateUtils.getQuarter, exports.range = DateUtils.range, exports.getBusinessDays = DateUtils.getBusinessDays, exports.formatDuration = DateUtils.formatDuration;
//# sourceMappingURL=date-utils.js.map