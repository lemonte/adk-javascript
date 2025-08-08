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
export declare class ValidationUtils {
    private static readonly EMAIL_REGEX;
    private static readonly URL_REGEX;
    private static readonly IPV4_REGEX;
    private static readonly IPV6_REGEX;
    private static readonly UUID_REGEX;
    private static readonly SLUG_REGEX;
    private static readonly HEX_COLOR_REGEX;
    private static readonly BASE64_REGEX;
    private static readonly JWT_REGEX;
    /**
     * Validate email address
     */
    static isEmail(email: string, options?: EmailValidationOptions): boolean;
    /**
     * Validate URL
     */
    static isUrl(url: string, options?: {
        protocols?: string[];
        requireProtocol?: boolean;
    }): boolean;
    /**
     * Validate IP address
     */
    static isIpAddress(ip: string, version?: 4 | 6): boolean;
    /**
     * Validate UUID
     */
    static isUuid(uuid: string, version?: 1 | 3 | 4 | 5): boolean;
    /**
     * Validate password strength
     */
    static isStrongPassword(password: string, options?: PasswordValidationOptions): ValidationResult;
    /**
     * Validate phone number
     */
    static isPhoneNumber(phone: string, options?: PhoneValidationOptions): boolean;
    /**
     * Validate credit card number
     */
    static isCreditCard(cardNumber: string, options?: CreditCardValidationOptions): boolean;
    /**
     * Luhn algorithm for credit card validation
     */
    private static luhnCheck;
    /**
     * Validate date
     */
    static isDate(date: any, options?: DateValidationOptions): boolean;
    /**
     * Validate number
     */
    static isNumber(value: any, options?: NumberValidationOptions): boolean;
    /**
     * Validate string
     */
    static isString(value: any, options?: StringValidationOptions): boolean;
    /**
     * Validate array
     */
    static isArray(value: any, options?: ArrayValidationOptions): boolean;
    /**
     * Validate object
     */
    static isObject(value: any, options?: ObjectValidationOptions): ValidationResult;
    /**
     * Validate against schema
     */
    static validateSchema(data: any, schema: ValidationSchema, options?: ValidatorOptions): ValidationResult;
    /**
     * Common validation rules
     */
    static rules: {
        required: (message?: string) => ValidationRule;
        email: (message?: string) => ValidationRule;
        url: (message?: string) => ValidationRule;
        minLength: (min: number, message?: string) => ValidationRule;
        maxLength: (max: number, message?: string) => ValidationRule;
        min: (min: number, message?: string) => ValidationRule;
        max: (max: number, message?: string) => ValidationRule;
        pattern: (regex: RegExp, message?: string) => ValidationRule;
        oneOf: (values: any[], message?: string) => ValidationRule;
        custom: (validator: (value: any) => boolean | string, message?: string) => ValidationRule;
    };
    /**
     * Validate slug (URL-friendly string)
     */
    static isSlug(value: string): boolean;
    /**
     * Validate hex color
     */
    static isHexColor(value: string): boolean;
    /**
     * Validate Base64 string
     */
    static isBase64(value: string): boolean;
    /**
     * Validate JWT token
     */
    static isJWT(value: string): boolean;
    /**
     * Validate JSON string
     */
    static isJSON(value: string): boolean;
    /**
     * Validate MAC address
     */
    static isMacAddress(value: string, separator?: string): boolean;
    /**
     * Validate port number
     */
    static isPort(value: number): boolean;
    /**
     * Validate latitude
     */
    static isLatitude(value: number): boolean;
    /**
     * Validate longitude
     */
    static isLongitude(value: number): boolean;
    /**
     * Validate MIME type
     */
    static isMimeType(value: string): boolean;
    /**
     * Validate semantic version
     */
    static isSemVer(value: string): boolean;
}
export declare const isEmail: typeof ValidationUtils.isEmail, isUrl: typeof ValidationUtils.isUrl, isIpAddress: typeof ValidationUtils.isIpAddress, isUuid: typeof ValidationUtils.isUuid, isStrongPassword: typeof ValidationUtils.isStrongPassword, isPhoneNumber: typeof ValidationUtils.isPhoneNumber, isCreditCard: typeof ValidationUtils.isCreditCard, isDate: typeof ValidationUtils.isDate, isNumber: typeof ValidationUtils.isNumber, isString: typeof ValidationUtils.isString, isArray: typeof ValidationUtils.isArray, isObject: typeof ValidationUtils.isObject, validateSchema: typeof ValidationUtils.validateSchema, rules: {
    required: (message?: string) => ValidationRule;
    email: (message?: string) => ValidationRule;
    url: (message?: string) => ValidationRule;
    minLength: (min: number, message?: string) => ValidationRule;
    maxLength: (max: number, message?: string) => ValidationRule;
    min: (min: number, message?: string) => ValidationRule;
    max: (max: number, message?: string) => ValidationRule;
    pattern: (regex: RegExp, message?: string) => ValidationRule;
    oneOf: (values: any[], message?: string) => ValidationRule;
    custom: (validator: (value: any) => boolean | string, message?: string) => ValidationRule;
}, isSlug: typeof ValidationUtils.isSlug, isHexColor: typeof ValidationUtils.isHexColor, isBase64: typeof ValidationUtils.isBase64, isJWT: typeof ValidationUtils.isJWT, isJSON: typeof ValidationUtils.isJSON, isMacAddress: typeof ValidationUtils.isMacAddress, isPort: typeof ValidationUtils.isPort, isLatitude: typeof ValidationUtils.isLatitude, isLongitude: typeof ValidationUtils.isLongitude, isMimeType: typeof ValidationUtils.isMimeType, isSemVer: typeof ValidationUtils.isSemVer;
//# sourceMappingURL=validation-utils.d.ts.map