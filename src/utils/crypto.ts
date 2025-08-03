/**
 * Cryptographic utilities for encryption, hashing, and security
 */

import { createHash, createHmac, randomBytes, createCipheriv, createDecipheriv, pbkdf2 } from 'crypto';

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
export class CryptoUtils {
  private static readonly DEFAULT_ENCRYPTION_ALGORITHM = 'aes-256-cbc';
  private static readonly DEFAULT_HASH_ALGORITHM = 'sha256';
  private static readonly DEFAULT_ENCODING: BufferEncoding = 'hex';

  /**
   * Generate random bytes
   */
  static generateRandomBytes(length: number): Buffer {
    return randomBytes(length);
  }

  /**
   * Generate random string
   */
  static generateRandomString(length: number, encoding: BufferEncoding = 'hex'): string {
    const bytes = Math.ceil(length / 2);
    return randomBytes(bytes).toString(encoding).slice(0, length);
  }

  /**
   * Generate cryptographically secure random ID
   */
  static generateSecureId(length = 32): string {
    return this.generateRandomString(length, 'base64url');
  }

  /**
   * Hash data using specified algorithm
   */
  static hash(
    data: string | Buffer,
    config: HashConfig = {}
  ): string {
    const {
      algorithm = this.DEFAULT_HASH_ALGORITHM,
      encoding = this.DEFAULT_ENCODING,
      salt,
    } = config;

    const hash = createHash(algorithm);
    
    if (salt) {
      hash.update(salt);
    }
    
    hash.update(data);
    return hash.digest(encoding as any);
  }

  /**
   * Hash data with salt
   */
  static hashWithSalt(
    data: string | Buffer,
    salt?: string,
    algorithm = this.DEFAULT_HASH_ALGORITHM
  ): { hash: string; salt: string } {
    const actualSalt = salt || this.generateRandomString(32);
    const hash = this.hash(data, { algorithm, salt: actualSalt });
    
    return { hash, salt: actualSalt };
  }

  /**
   * Verify hash with salt
   */
  static verifyHash(
    data: string | Buffer,
    hash: string,
    salt: string,
    algorithm = this.DEFAULT_HASH_ALGORITHM
  ): boolean {
    const computedHash = this.hash(data, { algorithm, salt });
    return this.constantTimeCompare(hash, computedHash);
  }

  /**
   * PBKDF2 key derivation
   */
  static async deriveKey(
    password: string,
    salt: string,
    iterations = 100000,
    keyLength = 32,
    algorithm = 'sha256'
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const crypto = require('crypto');
      crypto.pbkdf2(password, salt, iterations, keyLength, algorithm, (err: any, derivedKey: Buffer) => {
        if (err) reject(err);
        else resolve(derivedKey);
      });
    });
  }

  /**
   * HMAC signature
   */
  static hmac(
    data: string | Buffer,
    key: string | Buffer,
    config: SignatureConfig = {}
  ): string {
    const {
      algorithm = this.DEFAULT_HASH_ALGORITHM,
      encoding = this.DEFAULT_ENCODING,
    } = config;

    return createHmac(algorithm, key)
      .update(data)
      .digest(encoding as any);
  }

  /**
   * Verify HMAC signature
   */
  static verifyHmac(
    data: string | Buffer,
    signature: string,
    key: string | Buffer,
    config: SignatureConfig = {}
  ): boolean {
    const computedSignature = this.hmac(data, key, config);
    return this.constantTimeCompare(signature, computedSignature);
  }

  /**
   * Simple encryption (for demo purposes - use proper encryption in production)
   */
  static encrypt(
    data: string,
    key: string,
    config: EncryptionConfig = {}
  ): { encrypted: string; iv: string } {
    const {
      algorithm = this.DEFAULT_ENCRYPTION_ALGORITHM,
      encoding = this.DEFAULT_ENCODING,
    } = config;

    const iv = randomBytes(16);
    const keyBuffer = createHash('sha256').update(key).digest();
    const cipher = createCipheriv(algorithm, keyBuffer, iv);
    
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
  static decrypt(
    encryptedData: string,
    key: string,
    iv: string,
    config: EncryptionConfig = {}
  ): string {
    const {
      algorithm = this.DEFAULT_ENCRYPTION_ALGORITHM,
      encoding = this.DEFAULT_ENCODING,
    } = config;

    const keyBuffer = createHash('sha256').update(key).digest();
    const ivBuffer = Buffer.from(iv, encoding);
    const decipher = createDecipheriv(algorithm, keyBuffer, ivBuffer);
    
    let decrypted = decipher.update(encryptedData, encoding, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Constant time string comparison to prevent timing attacks
   */
  static constantTimeCompare(a: string, b: string): boolean {
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
  static generateToken(
    payload: Record<string, any>,
    secret: string,
    expiresIn?: number
  ): string {
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
    
    const signature = this.hmac(
      `${encodedHeader}.${encodedPayload}`,
      secret,
      { encoding: 'base64url' }
    );

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * Verify JWT-style token (simplified)
   */
  static verifyToken(
    token: string,
    secret: string
  ): { valid: boolean; payload?: any; error?: string } {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return { valid: false, error: 'Invalid token format' };
      }

      const [encodedHeader, encodedPayload, signature] = parts;
      
      // Verify signature
      const expectedSignature = this.hmac(
        `${encodedHeader}.${encodedPayload}`,
        secret,
        { encoding: 'base64url' }
      );

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
    } catch (error) {
      return { valid: false, error: 'Token parsing failed' };
    }
  }

  /**
   * Base64 URL encode
   */
  static base64UrlEncode(data: string): string {
    return Buffer.from(data)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Base64 URL decode
   */
  static base64UrlDecode(data: string): string {
    // Add padding if needed
    const padded = data + '='.repeat((4 - (data.length % 4)) % 4);
    
    return Buffer.from(
      padded.replace(/-/g, '+').replace(/_/g, '/'),
      'base64'
    ).toString();
  }

  /**
   * Generate checksum for data integrity
   */
  static checksum(
    data: string | Buffer,
    algorithm = 'md5'
  ): string {
    return createHash(algorithm).update(data).digest('hex');
  }

  /**
   * Verify data integrity with checksum
   */
  static verifyChecksum(
    data: string | Buffer,
    expectedChecksum: string,
    algorithm = 'md5'
  ): boolean {
    const actualChecksum = this.checksum(data, algorithm);
    return this.constantTimeCompare(expectedChecksum, actualChecksum);
  }

  /**
   * Generate API key
   */
  static generateApiKey(prefix = 'ak', length = 32): string {
    const randomPart = this.generateRandomString(length, 'base64url');
    return `${prefix}_${randomPart}`;
  }

  /**
   * Generate UUID v4
   */
  static generateUuid(): string {
    const bytes = randomBytes(16);
    
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
  static async hashPassword(
    password: string,
    saltRounds = 12
  ): Promise<string> {
    const salt = this.generateRandomString(16);
    const iterations = Math.pow(2, saltRounds);
    
    const key = await this.deriveKey(password, salt, iterations, 32);
    const hash = key.toString('hex');
    
    return `$2b$${saltRounds.toString().padStart(2, '0')}$${salt}${hash}`;
  }

  /**
   * Verify password hash
   */
  static async verifyPassword(
    password: string,
    hash: string
  ): Promise<boolean> {
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
    } catch {
      return false;
    }
  }
}

/**
 * Password strength checker
 */
export class PasswordStrength {
  static check(password: string): {
    score: number;
    strength: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong';
    feedback: string[];
  } {
    let score = 0;
    const feedback: string[] = [];

    // Length check
    if (password.length >= 8) score += 1;
    else feedback.push('Use at least 8 characters');

    if (password.length >= 12) score += 1;
    else if (password.length >= 8) feedback.push('Consider using 12+ characters');

    // Character variety
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Include lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Include uppercase letters');

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('Include numbers');

    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    else feedback.push('Include special characters');

    // Common patterns
    if (!/(..).*\1/.test(password)) score += 1;
    else feedback.push('Avoid repeated patterns');

    if (!/123|abc|qwe|password|admin/i.test(password)) score += 1;
    else feedback.push('Avoid common words and sequences');

    const strengthLevels = ['very-weak', 'weak', 'fair', 'good', 'strong'] as const;
    const strengthIndex = Math.min(Math.floor(score / 2), 4);

    return {
      score,
      strength: strengthLevels[strengthIndex],
      feedback,
    };
  }

  static generate(length = 16): string {
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

// Export commonly used functions
export const {
  generateRandomBytes,
  generateRandomString,
  generateSecureId,
  hash,
  hashWithSalt,
  verifyHash,
  hmac,
  verifyHmac,
  encrypt,
  decrypt,
  constantTimeCompare,
  generateToken,
  verifyToken,
  base64UrlEncode,
  base64UrlDecode,
  checksum,
  verifyChecksum,
  generateApiKey,
  generateUuid,
  hashPassword,
  verifyPassword,
} = CryptoUtils;