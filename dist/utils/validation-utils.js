"use strict";
/**
 * Validation utilities for comprehensive data validation
 */
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSemVer = exports.isMimeType = exports.isLongitude = exports.isLatitude = exports.isPort = exports.isMacAddress = exports.isJSON = exports.isJWT = exports.isBase64 = exports.isHexColor = exports.isSlug = exports.rules = exports.validateSchema = exports.isObject = exports.isArray = exports.isString = exports.isNumber = exports.isDate = exports.isCreditCard = exports.isPhoneNumber = exports.isStrongPassword = exports.isUuid = exports.isIpAddress = exports.isUrl = exports.isEmail = exports.ValidationUtils = void 0;
/**
 * Validation utilities class
 */
class ValidationUtils {
    /**
     * Validate email address
     */
    static isEmail(email, options = {}) {
        if (typeof email !== 'string')
            return false;
        const { allowDisplayName = false, requireDisplayName = false, allowUtf8LocalPart = false, requireTld = true, blacklistedChars = [], domainBlacklist = [] } = options;
        let emailToValidate = email.trim();
        // Handle display name
        if (allowDisplayName || requireDisplayName) {
            const displayNameMatch = emailToValidate.match(/^(.+?)\s*<(.+)>$/);
            if (displayNameMatch) {
                emailToValidate = displayNameMatch[2];
            }
            else if (requireDisplayName) {
                return false;
            }
        }
        // Check for blacklisted characters
        if (blacklistedChars.length > 0) {
            for (const char of blacklistedChars) {
                if (emailToValidate.includes(char)) {
                    return false;
                }
            }
        }
        // Basic email validation
        if (!this.EMAIL_REGEX.test(emailToValidate)) {
            return false;
        }
        const [localPart, domain] = emailToValidate.split('@');
        // UTF-8 local part validation
        if (!allowUtf8LocalPart && !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(localPart)) {
            return false;
        }
        // TLD validation
        if (requireTld && !domain.includes('.')) {
            return false;
        }
        // Domain blacklist
        if (domainBlacklist.includes(domain.toLowerCase())) {
            return false;
        }
        return true;
    }
    /**
     * Validate URL
     */
    static isUrl(url, options = {}) {
        if (typeof url !== 'string')
            return false;
        const { protocols = ['http', 'https'], requireProtocol = true } = options;
        if (requireProtocol) {
            const protocolMatch = url.match(/^([a-z][a-z0-9+.-]*):/);
            if (!protocolMatch || !protocols.includes(protocolMatch[1])) {
                return false;
            }
        }
        return this.URL_REGEX.test(url);
    }
    /**
     * Validate IP address
     */
    static isIpAddress(ip, version) {
        if (typeof ip !== 'string')
            return false;
        if (version === 4) {
            return this.IPV4_REGEX.test(ip);
        }
        else if (version === 6) {
            return this.IPV6_REGEX.test(ip);
        }
        else {
            return this.IPV4_REGEX.test(ip) || this.IPV6_REGEX.test(ip);
        }
    }
    /**
     * Validate UUID
     */
    static isUuid(uuid, version) {
        if (typeof uuid !== 'string')
            return false;
        if (!this.UUID_REGEX.test(uuid)) {
            return false;
        }
        if (version) {
            const versionChar = uuid.charAt(14);
            return versionChar === version.toString();
        }
        return true;
    }
    /**
     * Validate password strength
     */
    static isStrongPassword(password, options = {}) {
        const { minLength = 8, maxLength = 128, requireUppercase = true, requireLowercase = true, requireNumbers = true, requireSpecialChars = true, specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?', forbiddenPatterns = [], forbiddenWords = [] } = options;
        const errors = [];
        if (typeof password !== 'string') {
            errors.push('Password must be a string');
            return { isValid: false, errors };
        }
        if (password.length < minLength) {
            errors.push(`Password must be at least ${minLength} characters long`);
        }
        if (password.length > maxLength) {
            errors.push(`Password must be no more than ${maxLength} characters long`);
        }
        if (requireUppercase && !/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (requireLowercase && !/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (requireNumbers && !/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        if (requireSpecialChars) {
            const specialCharsRegex = new RegExp(`[${specialChars.replace(/[\-\]\\]/g, '\\$&')}]`);
            if (!specialCharsRegex.test(password)) {
                errors.push('Password must contain at least one special character');
            }
        }
        // Check forbidden patterns
        for (const pattern of forbiddenPatterns) {
            if (pattern.test(password)) {
                errors.push('Password contains forbidden pattern');
                break;
            }
        }
        // Check forbidden words
        const lowerPassword = password.toLowerCase();
        for (const word of forbiddenWords) {
            if (lowerPassword.includes(word.toLowerCase())) {
                errors.push('Password contains forbidden word');
                break;
            }
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * Validate phone number
     */
    static isPhoneNumber(phone, options = {}) {
        if (typeof phone !== 'string')
            return false;
        const { allowExtensions = false } = options;
        // Remove common formatting
        let cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
        // Handle extensions
        if (allowExtensions) {
            cleanPhone = cleanPhone.replace(/x\d+$/i, '');
        }
        // Basic phone number validation (international format)
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        return phoneRegex.test(cleanPhone);
    }
    /**
     * Validate credit card number
     */
    static isCreditCard(cardNumber, options = {}) {
        if (typeof cardNumber !== 'string')
            return false;
        const { validateLuhn = true } = options;
        // Remove spaces and hyphens
        const cleanNumber = cardNumber.replace(/[\s\-]/g, '');
        // Check if it's all digits
        if (!/^\d+$/.test(cleanNumber)) {
            return false;
        }
        // Check length (13-19 digits for most cards)
        if (cleanNumber.length < 13 || cleanNumber.length > 19) {
            return false;
        }
        // Luhn algorithm validation
        if (validateLuhn && !this.luhnCheck(cleanNumber)) {
            return false;
        }
        return true;
    }
    /**
     * Luhn algorithm for credit card validation
     */
    static luhnCheck(cardNumber) {
        let sum = 0;
        let alternate = false;
        for (let i = cardNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cardNumber.charAt(i), 10);
            if (alternate) {
                digit *= 2;
                if (digit > 9) {
                    digit = (digit % 10) + 1;
                }
            }
            sum += digit;
            alternate = !alternate;
        }
        return sum % 10 === 0;
    }
    /**
     * Validate date
     */
    static isDate(date, options = {}) {
        const { minDate, maxDate, allowFuture = true, allowPast = true } = options;
        let dateObj;
        if (date instanceof Date) {
            dateObj = date;
        }
        else if (typeof date === 'string' || typeof date === 'number') {
            dateObj = new Date(date);
        }
        else {
            return false;
        }
        // Check if date is valid
        if (isNaN(dateObj.getTime())) {
            return false;
        }
        const now = new Date();
        // Check future/past restrictions
        if (!allowFuture && dateObj > now) {
            return false;
        }
        if (!allowPast && dateObj < now) {
            return false;
        }
        // Check min/max date
        if (minDate && dateObj < minDate) {
            return false;
        }
        if (maxDate && dateObj > maxDate) {
            return false;
        }
        return true;
    }
    /**
     * Validate number
     */
    static isNumber(value, options = {}) {
        const { min, max, integer = false, positive = false, negative = false, multipleOf } = options;
        if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
            return false;
        }
        if (integer && !Number.isInteger(value)) {
            return false;
        }
        if (positive && value <= 0) {
            return false;
        }
        if (negative && value >= 0) {
            return false;
        }
        if (min !== undefined && value < min) {
            return false;
        }
        if (max !== undefined && value > max) {
            return false;
        }
        if (multipleOf !== undefined && value % multipleOf !== 0) {
            return false;
        }
        return true;
    }
    /**
     * Validate string
     */
    static isString(value, options = {}) {
        const { minLength = 0, maxLength = Infinity, pattern, allowEmpty = true, trim = false } = options;
        if (typeof value !== 'string') {
            return false;
        }
        let str = trim ? value.trim() : value;
        if (!allowEmpty && str.length === 0) {
            return false;
        }
        if (str.length < minLength || str.length > maxLength) {
            return false;
        }
        if (pattern && !pattern.test(str)) {
            return false;
        }
        return true;
    }
    /**
     * Validate array
     */
    static isArray(value, options = {}) {
        const { minLength = 0, maxLength = Infinity, uniqueItems = false, itemValidator } = options;
        if (!Array.isArray(value)) {
            return false;
        }
        if (value.length < minLength || value.length > maxLength) {
            return false;
        }
        if (uniqueItems) {
            const seen = new Set();
            for (const item of value) {
                const key = typeof item === 'object' ? JSON.stringify(item) : item;
                if (seen.has(key)) {
                    return false;
                }
                seen.add(key);
            }
        }
        if (itemValidator) {
            for (const item of value) {
                const result = itemValidator.validate(item);
                if (result !== true && result !== '') {
                    return false;
                }
            }
        }
        return true;
    }
    /**
     * Validate object
     */
    static isObject(value, options = {}) {
        const { allowUnknownKeys = true, requiredKeys = [], schema } = options;
        const errors = [];
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
            errors.push('Value must be an object');
            return { isValid: false, errors };
        }
        // Check required keys
        for (const key of requiredKeys) {
            if (!(key in value)) {
                errors.push(`Missing required key: ${key}`);
            }
        }
        // Check unknown keys
        if (!allowUnknownKeys && schema) {
            for (const key in value) {
                if (!(key in schema)) {
                    errors.push(`Unknown key: ${key}`);
                }
            }
        }
        // Validate against schema
        if (schema) {
            const schemaResult = this.validateSchema(value, schema);
            errors.push(...schemaResult.errors);
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * Validate against schema
     */
    static validateSchema(data, schema, options = {}) {
        const { stopOnFirstError = false, includeWarnings = false, customMessages = {} } = options;
        const errors = [];
        const warnings = [];
        const validateValue = (value, rules, path = '') => {
            if (Array.isArray(rules)) {
                // Multiple rules for the same field
                for (const rule of rules) {
                    const result = rule.validate(value);
                    if (result !== true) {
                        const message = customMessages[path] || rule.message || (typeof result === 'string' ? result : `Validation failed for ${path}`);
                        errors.push(message);
                        if (stopOnFirstError)
                            return;
                    }
                }
            }
            else if (typeof rules.validate === 'function') {
                // Single rule
                const result = rules.validate(value);
                if (result !== true) {
                    const message = customMessages[path] || rules.message || (typeof result === 'string' ? result : `Validation failed for ${path}`);
                    errors.push(String(message));
                    if (stopOnFirstError)
                        return;
                }
            }
            else {
                // Nested schema
                if (typeof value === 'object' && value !== null) {
                    for (const [key, nestedRules] of Object.entries(rules)) {
                        const nestedPath = path ? `${path}.${key}` : key;
                        validateValue(value[key], nestedRules, nestedPath);
                        if (stopOnFirstError && errors.length > 0)
                            return;
                    }
                }
            }
        };
        validateValue(data, schema);
        const result = {
            isValid: errors.length === 0,
            errors
        };
        if (includeWarnings) {
            result.warnings = warnings;
        }
        return result;
    }
    /**
     * Validate slug (URL-friendly string)
     */
    static isSlug(value) {
        return typeof value === 'string' && this.SLUG_REGEX.test(value);
    }
    /**
     * Validate hex color
     */
    static isHexColor(value) {
        return typeof value === 'string' && this.HEX_COLOR_REGEX.test(value);
    }
    /**
     * Validate Base64 string
     */
    static isBase64(value) {
        if (typeof value !== 'string')
            return false;
        // Check if length is multiple of 4
        if (value.length % 4 !== 0)
            return false;
        return this.BASE64_REGEX.test(value);
    }
    /**
     * Validate JWT token
     */
    static isJWT(value) {
        return typeof value === 'string' && this.JWT_REGEX.test(value);
    }
    /**
     * Validate JSON string
     */
    static isJSON(value) {
        if (typeof value !== 'string')
            return false;
        try {
            JSON.parse(value);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Validate MAC address
     */
    static isMacAddress(value, separator) {
        if (typeof value !== 'string')
            return false;
        const sep = separator || '[:-]';
        const macRegex = new RegExp(`^([0-9A-Fa-f]{2}${sep}){5}([0-9A-Fa-f]{2})$`);
        return macRegex.test(value);
    }
    /**
     * Validate port number
     */
    static isPort(value) {
        return this.isNumber(value, { integer: true, min: 1, max: 65535 });
    }
    /**
     * Validate latitude
     */
    static isLatitude(value) {
        return this.isNumber(value, { min: -90, max: 90 });
    }
    /**
     * Validate longitude
     */
    static isLongitude(value) {
        return this.isNumber(value, { min: -180, max: 180 });
    }
    /**
     * Validate MIME type
     */
    static isMimeType(value) {
        if (typeof value !== 'string')
            return false;
        const mimeRegex = /^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*$/;
        return mimeRegex.test(value);
    }
    /**
     * Validate semantic version
     */
    static isSemVer(value) {
        if (typeof value !== 'string')
            return false;
        const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
        return semverRegex.test(value);
    }
}
exports.ValidationUtils = ValidationUtils;
_a = ValidationUtils;
// Common regex patterns
ValidationUtils.EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
ValidationUtils.URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
ValidationUtils.IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
ValidationUtils.IPV6_REGEX = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
ValidationUtils.UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
ValidationUtils.SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
ValidationUtils.HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
ValidationUtils.BASE64_REGEX = /^[A-Za-z0-9+/]*={0,2}$/;
ValidationUtils.JWT_REGEX = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
/**
 * Common validation rules
 */
ValidationUtils.rules = {
    required: (message = 'Field is required') => ({
        validate: (value) => value !== null && value !== undefined && value !== '',
        message
    }),
    email: (message = 'Invalid email address') => ({
        validate: (value) => _a.isEmail(value),
        message
    }),
    url: (message = 'Invalid URL') => ({
        validate: (value) => _a.isUrl(value),
        message
    }),
    minLength: (min, message) => ({
        validate: (value) => typeof value === 'string' && value.length >= min,
        message: message || `Must be at least ${min} characters long`
    }),
    maxLength: (max, message) => ({
        validate: (value) => typeof value === 'string' && value.length <= max,
        message: message || `Must be no more than ${max} characters long`
    }),
    min: (min, message) => ({
        validate: (value) => typeof value === 'number' && value >= min,
        message: message || `Must be at least ${min}`
    }),
    max: (max, message) => ({
        validate: (value) => typeof value === 'number' && value <= max,
        message: message || `Must be no more than ${max}`
    }),
    pattern: (regex, message = 'Invalid format') => ({
        validate: (value) => typeof value === 'string' && regex.test(value),
        message
    }),
    oneOf: (values, message) => ({
        validate: (value) => values.includes(value),
        message: message || `Must be one of: ${values.join(', ')}`
    }),
    custom: (validator, message = 'Validation failed') => ({
        validate: validator,
        message
    })
};
// Export commonly used functions
exports.isEmail = ValidationUtils.isEmail, exports.isUrl = ValidationUtils.isUrl, exports.isIpAddress = ValidationUtils.isIpAddress, exports.isUuid = ValidationUtils.isUuid, exports.isStrongPassword = ValidationUtils.isStrongPassword, exports.isPhoneNumber = ValidationUtils.isPhoneNumber, exports.isCreditCard = ValidationUtils.isCreditCard, exports.isDate = ValidationUtils.isDate, exports.isNumber = ValidationUtils.isNumber, exports.isString = ValidationUtils.isString, exports.isArray = ValidationUtils.isArray, exports.isObject = ValidationUtils.isObject, exports.validateSchema = ValidationUtils.validateSchema, exports.rules = ValidationUtils.rules, exports.isSlug = ValidationUtils.isSlug, exports.isHexColor = ValidationUtils.isHexColor, exports.isBase64 = ValidationUtils.isBase64, exports.isJWT = ValidationUtils.isJWT, exports.isJSON = ValidationUtils.isJSON, exports.isMacAddress = ValidationUtils.isMacAddress, exports.isPort = ValidationUtils.isPort, exports.isLatitude = ValidationUtils.isLatitude, exports.isLongitude = ValidationUtils.isLongitude, exports.isMimeType = ValidationUtils.isMimeType, exports.isSemVer = ValidationUtils.isSemVer;
//# sourceMappingURL=validation-utils.js.map