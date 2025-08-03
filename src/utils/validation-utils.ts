/**
 * Validation utilities for comprehensive data validation
 */

export interface ValidationRule<T = any> {
  validate: (value: T) => boolean | string;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface ValidationSchema {
  [key: string]: ValidationRule | ValidationRule[] | ValidationSchema;
}

export interface ValidatorOptions {
  stopOnFirstError?: boolean;
  includeWarnings?: boolean;
  customMessages?: Record<string, string>;
}

export interface EmailValidationOptions {
  allowDisplayName?: boolean;
  requireDisplayName?: boolean;
  allowUtf8LocalPart?: boolean;
  requireTld?: boolean;
  blacklistedChars?: string[];
  domainBlacklist?: string[];
}

export interface PasswordValidationOptions {
  minLength?: number;
  maxLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSpecialChars?: boolean;
  specialChars?: string;
  forbiddenPatterns?: RegExp[];
  forbiddenWords?: string[];
}

export interface PhoneValidationOptions {
  country?: string;
  format?: 'international' | 'national' | 'e164' | 'rfc3966';
  allowExtensions?: boolean;
}

export interface CreditCardValidationOptions {
  acceptedTypes?: string[];
  validateLuhn?: boolean;
}

export interface DateValidationOptions {
  minDate?: Date;
  maxDate?: Date;
  allowFuture?: boolean;
  allowPast?: boolean;
  format?: string;
}

export interface NumberValidationOptions {
  min?: number;
  max?: number;
  integer?: boolean;
  positive?: boolean;
  negative?: boolean;
  multipleOf?: number;
}

export interface StringValidationOptions {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  allowEmpty?: boolean;
  trim?: boolean;
  caseSensitive?: boolean;
}

export interface ArrayValidationOptions {
  minLength?: number;
  maxLength?: number;
  uniqueItems?: boolean;
  itemValidator?: ValidationRule;
}

export interface ObjectValidationOptions {
  allowUnknownKeys?: boolean;
  requiredKeys?: string[];
  schema?: ValidationSchema;
}

/**
 * Validation utilities class
 */
export class ValidationUtils {
  // Common regex patterns
  private static readonly EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  private static readonly URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
  private static readonly IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  private static readonly IPV6_REGEX = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
  private static readonly UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  private static readonly SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  private static readonly HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  private static readonly BASE64_REGEX = /^[A-Za-z0-9+/]*={0,2}$/;
  private static readonly JWT_REGEX = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;

  /**
   * Validate email address
   */
  static isEmail(email: string, options: EmailValidationOptions = {}): boolean {
    if (typeof email !== 'string') return false;
    
    const {
      allowDisplayName = false,
      requireDisplayName = false,
      allowUtf8LocalPart = false,
      requireTld = true,
      blacklistedChars = [],
      domainBlacklist = []
    } = options;
    
    let emailToValidate = email.trim();
    
    // Handle display name
    if (allowDisplayName || requireDisplayName) {
      const displayNameMatch = emailToValidate.match(/^(.+?)\s*<(.+)>$/);
      if (displayNameMatch) {
        emailToValidate = displayNameMatch[2];
      } else if (requireDisplayName) {
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
  static isUrl(url: string, options: { protocols?: string[], requireProtocol?: boolean } = {}): boolean {
    if (typeof url !== 'string') return false;
    
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
  static isIpAddress(ip: string, version?: 4 | 6): boolean {
    if (typeof ip !== 'string') return false;
    
    if (version === 4) {
      return this.IPV4_REGEX.test(ip);
    } else if (version === 6) {
      return this.IPV6_REGEX.test(ip);
    } else {
      return this.IPV4_REGEX.test(ip) || this.IPV6_REGEX.test(ip);
    }
  }

  /**
   * Validate UUID
   */
  static isUuid(uuid: string, version?: 1 | 3 | 4 | 5): boolean {
    if (typeof uuid !== 'string') return false;
    
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
  static isStrongPassword(password: string, options: PasswordValidationOptions = {}): ValidationResult {
    const {
      minLength = 8,
      maxLength = 128,
      requireUppercase = true,
      requireLowercase = true,
      requireNumbers = true,
      requireSpecialChars = true,
      specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?',
      forbiddenPatterns = [],
      forbiddenWords = []
    } = options;
    
    const errors: string[] = [];
    
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
  static isPhoneNumber(phone: string, options: PhoneValidationOptions = {}): boolean {
    if (typeof phone !== 'string') return false;
    
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
  static isCreditCard(cardNumber: string, options: CreditCardValidationOptions = {}): boolean {
    if (typeof cardNumber !== 'string') return false;
    
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
  private static luhnCheck(cardNumber: string): boolean {
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
  static isDate(date: any, options: DateValidationOptions = {}): boolean {
    const {
      minDate,
      maxDate,
      allowFuture = true,
      allowPast = true
    } = options;
    
    let dateObj: Date;
    
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string' || typeof date === 'number') {
      dateObj = new Date(date);
    } else {
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
  static isNumber(value: any, options: NumberValidationOptions = {}): boolean {
    const {
      min,
      max,
      integer = false,
      positive = false,
      negative = false,
      multipleOf
    } = options;
    
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
  static isString(value: any, options: StringValidationOptions = {}): boolean {
    const {
      minLength = 0,
      maxLength = Infinity,
      pattern,
      allowEmpty = true,
      trim = false
    } = options;
    
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
  static isArray(value: any, options: ArrayValidationOptions = {}): boolean {
    const {
      minLength = 0,
      maxLength = Infinity,
      uniqueItems = false,
      itemValidator
    } = options;
    
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
  static isObject(value: any, options: ObjectValidationOptions = {}): ValidationResult {
    const {
      allowUnknownKeys = true,
      requiredKeys = [],
      schema
    } = options;
    
    const errors: string[] = [];
    
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
  static validateSchema(data: any, schema: ValidationSchema, options: ValidatorOptions = {}): ValidationResult {
    const {
      stopOnFirstError = false,
      includeWarnings = false,
      customMessages = {}
    } = options;
    
    const errors: string[] = [];
    const warnings: string[] = [];
    
    const validateValue = (value: any, rules: ValidationRule | ValidationRule[] | ValidationSchema, path: string = '') => {
      if (Array.isArray(rules)) {
        // Multiple rules for the same field
        for (const rule of rules) {
          const result = rule.validate(value);
          if (result !== true) {
            const message = customMessages[path] || rule.message || (typeof result === 'string' ? result : `Validation failed for ${path}`);
            errors.push(message);
            if (stopOnFirstError) return;
          }
        }
      } else if (typeof rules.validate === 'function') {
        // Single rule
        const result = rules.validate(value);
        if (result !== true) {
          const message = customMessages[path] || rules.message || (typeof result === 'string' ? result : `Validation failed for ${path}`);
          errors.push(String(message));
          if (stopOnFirstError) return;
        }
      } else {
        // Nested schema
        if (typeof value === 'object' && value !== null) {
          for (const [key, nestedRules] of Object.entries(rules)) {
            const nestedPath = path ? `${path}.${key}` : key;
            validateValue(value[key], nestedRules, nestedPath);
            if (stopOnFirstError && errors.length > 0) return;
          }
        }
      }
    };
    
    validateValue(data, schema);
    
    const result: ValidationResult = {
      isValid: errors.length === 0,
      errors
    };
    
    if (includeWarnings) {
      result.warnings = warnings;
    }
    
    return result;
  }

  /**
   * Common validation rules
   */
  static rules = {
    required: (message = 'Field is required'): ValidationRule => ({
      validate: (value) => value !== null && value !== undefined && value !== '',
      message
    }),
    
    email: (message = 'Invalid email address'): ValidationRule => ({
      validate: (value) => this.isEmail(value),
      message
    }),
    
    url: (message = 'Invalid URL'): ValidationRule => ({
      validate: (value) => this.isUrl(value),
      message
    }),
    
    minLength: (min: number, message?: string): ValidationRule => ({
      validate: (value) => typeof value === 'string' && value.length >= min,
      message: message || `Must be at least ${min} characters long`
    }),
    
    maxLength: (max: number, message?: string): ValidationRule => ({
      validate: (value) => typeof value === 'string' && value.length <= max,
      message: message || `Must be no more than ${max} characters long`
    }),
    
    min: (min: number, message?: string): ValidationRule => ({
      validate: (value) => typeof value === 'number' && value >= min,
      message: message || `Must be at least ${min}`
    }),
    
    max: (max: number, message?: string): ValidationRule => ({
      validate: (value) => typeof value === 'number' && value <= max,
      message: message || `Must be no more than ${max}`
    }),
    
    pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule => ({
      validate: (value) => typeof value === 'string' && regex.test(value),
      message
    }),
    
    oneOf: (values: any[], message?: string): ValidationRule => ({
      validate: (value) => values.includes(value),
      message: message || `Must be one of: ${values.join(', ')}`
    }),
    
    custom: (validator: (value: any) => boolean | string, message = 'Validation failed'): ValidationRule => ({
      validate: validator,
      message
    })
  };

  /**
   * Validate slug (URL-friendly string)
   */
  static isSlug(value: string): boolean {
    return typeof value === 'string' && this.SLUG_REGEX.test(value);
  }

  /**
   * Validate hex color
   */
  static isHexColor(value: string): boolean {
    return typeof value === 'string' && this.HEX_COLOR_REGEX.test(value);
  }

  /**
   * Validate Base64 string
   */
  static isBase64(value: string): boolean {
    if (typeof value !== 'string') return false;
    
    // Check if length is multiple of 4
    if (value.length % 4 !== 0) return false;
    
    return this.BASE64_REGEX.test(value);
  }

  /**
   * Validate JWT token
   */
  static isJWT(value: string): boolean {
    return typeof value === 'string' && this.JWT_REGEX.test(value);
  }

  /**
   * Validate JSON string
   */
  static isJSON(value: string): boolean {
    if (typeof value !== 'string') return false;
    
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate MAC address
   */
  static isMacAddress(value: string, separator?: string): boolean {
    if (typeof value !== 'string') return false;
    
    const sep = separator || '[:-]';
    const macRegex = new RegExp(`^([0-9A-Fa-f]{2}${sep}){5}([0-9A-Fa-f]{2})$`);
    
    return macRegex.test(value);
  }

  /**
   * Validate port number
   */
  static isPort(value: number): boolean {
    return this.isNumber(value, { integer: true, min: 1, max: 65535 });
  }

  /**
   * Validate latitude
   */
  static isLatitude(value: number): boolean {
    return this.isNumber(value, { min: -90, max: 90 });
  }

  /**
   * Validate longitude
   */
  static isLongitude(value: number): boolean {
    return this.isNumber(value, { min: -180, max: 180 });
  }

  /**
   * Validate MIME type
   */
  static isMimeType(value: string): boolean {
    if (typeof value !== 'string') return false;
    
    const mimeRegex = /^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*$/;
    
    return mimeRegex.test(value);
  }

  /**
   * Validate semantic version
   */
  static isSemVer(value: string): boolean {
    if (typeof value !== 'string') return false;
    
    const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
    
    return semverRegex.test(value);
  }
}

// Export commonly used functions
export const {
  isEmail,
  isUrl,
  isIpAddress,
  isUuid,
  isStrongPassword,
  isPhoneNumber,
  isCreditCard,
  isDate,
  isNumber,
  isString,
  isArray,
  isObject,
  validateSchema,
  rules,
  isSlug,
  isHexColor,
  isBase64,
  isJWT,
  isJSON,
  isMacAddress,
  isPort,
  isLatitude,
  isLongitude,
  isMimeType,
  isSemVer,
} = ValidationUtils;