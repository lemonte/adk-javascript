"use strict";
/**
 * Cryptographic utilities for encryption, hashing, and security
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPassword = exports.hashPassword = exports.generateUuid = exports.generateApiKey = exports.verifyChecksum = exports.checksum = exports.base64UrlDecode = exports.base64UrlEncode = exports.verifyToken = exports.generateToken = exports.constantTimeCompare = exports.decrypt = exports.encrypt = exports.verifyHmac = exports.hmac = exports.verifyHash = exports.hashWithSalt = exports.hash = exports.generateSecureId = exports.generateRandomString = exports.generateRandomBytes = exports.PasswordStrength = exports.CryptoUtils = void 0;
const crypto_1 = require("crypto");
/**
 * Cryptographic utility class
 */
class CryptoUtils {
    /**
     * Generate random bytes
     */
    static generateRandomBytes(length) {
        return (0, crypto_1.randomBytes)(length);
    }
    /**
     * Generate random string
     */
    static generateRandomString(length, encoding = 'hex') {
        const bytes = Math.ceil(length / 2);
        return (0, crypto_1.randomBytes)(bytes).toString(encoding).slice(0, length);
    }
    /**
     * Generate cryptographically secure random ID
     */
    static generateSecureId(length = 32) {
        return this.generateRandomString(length, 'base64url');
    }
    /**
     * Hash data using specified algorithm
     */
    static hash(data, config = {}) {
        const { algorithm = this.DEFAULT_HASH_ALGORITHM, encoding = this.DEFAULT_ENCODING, salt, } = config;
        const hash = (0, crypto_1.createHash)(algorithm);
        if (salt) {
            hash.update(salt);
        }
        hash.update(data);
        return hash.digest(encoding);
    }
    /**
     * Hash data with salt
     */
    static hashWithSalt(data, salt, algorithm = this.DEFAULT_HASH_ALGORITHM) {
        const actualSalt = salt || this.generateRandomString(32);
        const hash = this.hash(data, { algorithm, salt: actualSalt });
        return { hash, salt: actualSalt };
    }
    /**
     * Verify hash with salt
     */
    static verifyHash(data, hash, salt, algorithm = this.DEFAULT_HASH_ALGORITHM) {
        const computedHash = this.hash(data, { algorithm, salt });
        return this.constantTimeCompare(hash, computedHash);
    }
    /**
     * PBKDF2 key derivation
     */
    static async deriveKey(password, salt, iterations = 100000, keyLength = 32, algorithm = 'sha256') {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto');
            crypto.pbkdf2(password, salt, iterations, keyLength, algorithm, (err, derivedKey) => {
                if (err)
                    reject(err);
                else
                    resolve(derivedKey);
            });
        });
    }
    /**
     * HMAC signature
     */
    static hmac(data, key, config = {}) {
        const { algorithm = this.DEFAULT_HASH_ALGORITHM, encoding = this.DEFAULT_ENCODING, } = config;
        return (0, crypto_1.createHmac)(algorithm, key)
            .update(data)
            .digest(encoding);
    }
    /**
     * Verify HMAC signature
     */
    static verifyHmac(data, signature, key, config = {}) {
        const computedSignature = this.hmac(data, key, config);
        return this.constantTimeCompare(signature, computedSignature);
    }
    /**
     * Simple encryption (for demo purposes - use proper encryption in production)
     */
    static encrypt(data, key, config = {}) {
        const { algorithm = this.DEFAULT_ENCRYPTION_ALGORITHM, encoding = this.DEFAULT_ENCODING, } = config;
        const iv = (0, crypto_1.randomBytes)(16);
        const keyBuffer = (0, crypto_1.createHash)('sha256').update(key).digest();
        const cipher = (0, crypto_1.createCipheriv)(algorithm, keyBuffer, iv);
        let encrypted = cipher.update(data, 'utf8', encoding);
        encrypted += cipher.final(encoding);
        return {
            encrypted,
            iv: iv.toString(encoding),
        };
    }
    /**
     * Simple decryption (for demo purposes - use proper encryption in production)
     */
    static decrypt(encryptedData, key, iv, config = {}) {
        const { algorithm = this.DEFAULT_ENCRYPTION_ALGORITHM, encoding = this.DEFAULT_ENCODING, } = config;
        const keyBuffer = (0, crypto_1.createHash)('sha256').update(key).digest();
        const ivBuffer = Buffer.from(iv, encoding);
        const decipher = (0, crypto_1.createDecipheriv)(algorithm, keyBuffer, ivBuffer);
        let decrypted = decipher.update(encryptedData, encoding, 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    /**
     * Constant time string comparison to prevent timing attacks
     */
    static constantTimeCompare(a, b) {
        if (a.length !== b.length) {
            return false;
        }
        let result = 0;
        for (let i = 0; i < a.length; i++) {
            result |= a.charCodeAt(i) ^ b.charCodeAt(i);
        }
        return result === 0;
    }
    /**
     * Generate JWT-style token (simplified)
     */
    static generateToken(payload, secret, expiresIn) {
        const header = {
            alg: 'HS256',
            typ: 'JWT',
        };
        const now = Math.floor(Date.now() / 1000);
        const tokenPayload = {
            ...payload,
            iat: now,
            ...(expiresIn && { exp: now + expiresIn }),
        };
        const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
        const encodedPayload = this.base64UrlEncode(JSON.stringify(tokenPayload));
        const signature = this.hmac(`${encodedHeader}.${encodedPayload}`, secret, { encoding: 'base64url' });
        return `${encodedHeader}.${encodedPayload}.${signature}`;
    }
    /**
     * Verify JWT-style token (simplified)
     */
    static verifyToken(token, secret) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                return { valid: false, error: 'Invalid token format' };
            }
            const [encodedHeader, encodedPayload, signature] = parts;
            // Verify signature
            const expectedSignature = this.hmac(`${encodedHeader}.${encodedPayload}`, secret, { encoding: 'base64url' });
            if (!this.constantTimeCompare(signature, expectedSignature)) {
                return { valid: false, error: 'Invalid signature' };
            }
            // Decode payload
            const payload = JSON.parse(this.base64UrlDecode(encodedPayload));
            // Check expiration
            if (payload.exp && Date.now() / 1000 > payload.exp) {
                return { valid: false, error: 'Token expired' };
            }
            return { valid: true, payload };
        }
        catch (error) {
            return { valid: false, error: 'Token parsing failed' };
        }
    }
    /**
     * Base64 URL encode
     */
    static base64UrlEncode(data) {
        return Buffer.from(data)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }
    /**
     * Base64 URL decode
     */
    static base64UrlDecode(data) {
        // Add padding if needed
        const padded = data + '='.repeat((4 - (data.length % 4)) % 4);
        return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
    }
    /**
     * Generate checksum for data integrity
     */
    static checksum(data, algorithm = 'md5') {
        return (0, crypto_1.createHash)(algorithm).update(data).digest('hex');
    }
    /**
     * Verify data integrity with checksum
     */
    static verifyChecksum(data, expectedChecksum, algorithm = 'md5') {
        const actualChecksum = this.checksum(data, algorithm);
        return this.constantTimeCompare(expectedChecksum, actualChecksum);
    }
    /**
     * Generate API key
     */
    static generateApiKey(prefix = 'ak', length = 32) {
        const randomPart = this.generateRandomString(length, 'base64url');
        return `${prefix}_${randomPart}`;
    }
    /**
     * Generate UUID v4
     */
    static generateUuid() {
        const bytes = (0, crypto_1.randomBytes)(16);
        // Set version (4) and variant bits
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        const hex = bytes.toString('hex');
        return [
            hex.slice(0, 8),
            hex.slice(8, 12),
            hex.slice(12, 16),
            hex.slice(16, 20),
            hex.slice(20, 32),
        ].join('-');
    }
    /**
     * Hash password with bcrypt-like approach (simplified)
     */
    static async hashPassword(password, saltRounds = 12) {
        const salt = this.generateRandomString(16);
        const iterations = Math.pow(2, saltRounds);
        const key = await this.deriveKey(password, salt, iterations, 32);
        const hash = key.toString('hex');
        return `$2b$${saltRounds.toString().padStart(2, '0')}$${salt}${hash}`;
    }
    /**
     * Verify password hash
     */
    static async verifyPassword(password, hash) {
        try {
            const parts = hash.split('$');
            if (parts.length !== 4 || parts[0] !== '' || parts[1] !== '2b') {
                return false;
            }
            const saltRounds = parseInt(parts[2], 10);
            const saltAndHash = parts[3];
            const salt = saltAndHash.slice(0, 16);
            const expectedHash = saltAndHash.slice(16);
            const iterations = Math.pow(2, saltRounds);
            const key = await this.deriveKey(password, salt, iterations, 32);
            const actualHash = key.toString('hex');
            return this.constantTimeCompare(expectedHash, actualHash);
        }
        catch {
            return false;
        }
    }
}
exports.CryptoUtils = CryptoUtils;
CryptoUtils.DEFAULT_ENCRYPTION_ALGORITHM = 'aes-256-cbc';
CryptoUtils.DEFAULT_HASH_ALGORITHM = 'sha256';
CryptoUtils.DEFAULT_ENCODING = 'hex';
/**
 * Password strength checker
 */
class PasswordStrength {
    static check(password) {
        let score = 0;
        const feedback = [];
        // Length check
        if (password.length >= 8)
            score += 1;
        else
            feedback.push('Use at least 8 characters');
        if (password.length >= 12)
            score += 1;
        else if (password.length >= 8)
            feedback.push('Consider using 12+ characters');
        // Character variety
        if (/[a-z]/.test(password))
            score += 1;
        else
            feedback.push('Include lowercase letters');
        if (/[A-Z]/.test(password))
            score += 1;
        else
            feedback.push('Include uppercase letters');
        if (/[0-9]/.test(password))
            score += 1;
        else
            feedback.push('Include numbers');
        if (/[^a-zA-Z0-9]/.test(password))
            score += 1;
        else
            feedback.push('Include special characters');
        // Common patterns
        if (!/(..).*\1/.test(password))
            score += 1;
        else
            feedback.push('Avoid repeated patterns');
        if (!/123|abc|qwe|password|admin/i.test(password))
            score += 1;
        else
            feedback.push('Avoid common words and sequences');
        const strengthLevels = ['very-weak', 'weak', 'fair', 'good', 'strong'];
        const strengthIndex = Math.min(Math.floor(score / 2), 4);
        return {
            score,
            strength: strengthLevels[strengthIndex],
            feedback,
        };
    }
    static generate(length = 16) {
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        const allChars = lowercase + uppercase + numbers + symbols;
        // Ensure at least one character from each category
        let password = '';
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += symbols[Math.floor(Math.random() * symbols.length)];
        // Fill the rest randomly
        for (let i = 4; i < length; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }
        // Shuffle the password
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }
}
exports.PasswordStrength = PasswordStrength;
// Export commonly used functions
exports.generateRandomBytes = CryptoUtils.generateRandomBytes, exports.generateRandomString = CryptoUtils.generateRandomString, exports.generateSecureId = CryptoUtils.generateSecureId, exports.hash = CryptoUtils.hash, exports.hashWithSalt = CryptoUtils.hashWithSalt, exports.verifyHash = CryptoUtils.verifyHash, exports.hmac = CryptoUtils.hmac, exports.verifyHmac = CryptoUtils.verifyHmac, exports.encrypt = CryptoUtils.encrypt, exports.decrypt = CryptoUtils.decrypt, exports.constantTimeCompare = CryptoUtils.constantTimeCompare, exports.generateToken = CryptoUtils.generateToken, exports.verifyToken = CryptoUtils.verifyToken, exports.base64UrlEncode = CryptoUtils.base64UrlEncode, exports.base64UrlDecode = CryptoUtils.base64UrlDecode, exports.checksum = CryptoUtils.checksum, exports.verifyChecksum = CryptoUtils.verifyChecksum, exports.generateApiKey = CryptoUtils.generateApiKey, exports.generateUuid = CryptoUtils.generateUuid, exports.hashPassword = CryptoUtils.hashPassword, exports.verifyPassword = CryptoUtils.verifyPassword;
//# sourceMappingURL=crypto.js.map