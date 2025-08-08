/**
 * Cryptographic utilities for encryption, hashing, and security
 */
export interface EncryptionConfig {
    algorithm?: string;
    keyLength?: number;
    ivLength?: number;
    encoding?: BufferEncoding;
}
export interface HashConfig {
    algorithm?: string;
    encoding?: BufferEncoding;
    salt?: string;
    iterations?: number;
}
export interface SignatureConfig {
    algorithm?: string;
    encoding?: BufferEncoding;
}
/**
 * Cryptographic utility class
 */
export declare class CryptoUtils {
    private static readonly DEFAULT_ENCRYPTION_ALGORITHM;
    private static readonly DEFAULT_HASH_ALGORITHM;
    private static readonly DEFAULT_ENCODING;
    /**
     * Generate random bytes
     */
    static generateRandomBytes(length: number): Buffer;
    /**
     * Generate random string
     */
    static generateRandomString(length: number, encoding?: BufferEncoding): string;
    /**
     * Generate cryptographically secure random ID
     */
    static generateSecureId(length?: number): string;
    /**
     * Hash data using specified algorithm
     */
    static hash(data: string | Buffer, config?: HashConfig): string;
    /**
     * Hash data with salt
     */
    static hashWithSalt(data: string | Buffer, salt?: string, algorithm?: string): {
        hash: string;
        salt: string;
    };
    /**
     * Verify hash with salt
     */
    static verifyHash(data: string | Buffer, hash: string, salt: string, algorithm?: string): boolean;
    /**
     * PBKDF2 key derivation
     */
    static deriveKey(password: string, salt: string, iterations?: number, keyLength?: number, algorithm?: string): Promise<Buffer>;
    /**
     * HMAC signature
     */
    static hmac(data: string | Buffer, key: string | Buffer, config?: SignatureConfig): string;
    /**
     * Verify HMAC signature
     */
    static verifyHmac(data: string | Buffer, signature: string, key: string | Buffer, config?: SignatureConfig): boolean;
    /**
     * Simple encryption (for demo purposes - use proper encryption in production)
     */
    static encrypt(data: string, key: string, config?: EncryptionConfig): {
        encrypted: string;
        iv: string;
    };
    /**
     * Simple decryption (for demo purposes - use proper encryption in production)
     */
    static decrypt(encryptedData: string, key: string, iv: string, config?: EncryptionConfig): string;
    /**
     * Constant time string comparison to prevent timing attacks
     */
    static constantTimeCompare(a: string, b: string): boolean;
    /**
     * Generate JWT-style token (simplified)
     */
    static generateToken(payload: Record<string, any>, secret: string, expiresIn?: number): string;
    /**
     * Verify JWT-style token (simplified)
     */
    static verifyToken(token: string, secret: string): {
        valid: boolean;
        payload?: any;
        error?: string;
    };
    /**
     * Base64 URL encode
     */
    static base64UrlEncode(data: string): string;
    /**
     * Base64 URL decode
     */
    static base64UrlDecode(data: string): string;
    /**
     * Generate checksum for data integrity
     */
    static checksum(data: string | Buffer, algorithm?: string): string;
    /**
     * Verify data integrity with checksum
     */
    static verifyChecksum(data: string | Buffer, expectedChecksum: string, algorithm?: string): boolean;
    /**
     * Generate API key
     */
    static generateApiKey(prefix?: string, length?: number): string;
    /**
     * Generate UUID v4
     */
    static generateUuid(): string;
    /**
     * Hash password with bcrypt-like approach (simplified)
     */
    static hashPassword(password: string, saltRounds?: number): Promise<string>;
    /**
     * Verify password hash
     */
    static verifyPassword(password: string, hash: string): Promise<boolean>;
}
/**
 * Password strength checker
 */
export declare class PasswordStrength {
    static check(password: string): {
        score: number;
        strength: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong';
        feedback: string[];
    };
    static generate(length?: number): string;
}
export declare const generateRandomBytes: typeof CryptoUtils.generateRandomBytes, generateRandomString: typeof CryptoUtils.generateRandomString, generateSecureId: typeof CryptoUtils.generateSecureId, hash: typeof CryptoUtils.hash, hashWithSalt: typeof CryptoUtils.hashWithSalt, verifyHash: typeof CryptoUtils.verifyHash, hmac: typeof CryptoUtils.hmac, verifyHmac: typeof CryptoUtils.verifyHmac, encrypt: typeof CryptoUtils.encrypt, decrypt: typeof CryptoUtils.decrypt, constantTimeCompare: typeof CryptoUtils.constantTimeCompare, generateToken: typeof CryptoUtils.generateToken, verifyToken: typeof CryptoUtils.verifyToken, base64UrlEncode: typeof CryptoUtils.base64UrlEncode, base64UrlDecode: typeof CryptoUtils.base64UrlDecode, checksum: typeof CryptoUtils.checksum, verifyChecksum: typeof CryptoUtils.verifyChecksum, generateApiKey: typeof CryptoUtils.generateApiKey, generateUuid: typeof CryptoUtils.generateUuid, hashPassword: typeof CryptoUtils.hashPassword, verifyPassword: typeof CryptoUtils.verifyPassword;
//# sourceMappingURL=crypto.d.ts.map