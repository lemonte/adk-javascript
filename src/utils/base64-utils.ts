/**
 * Base64 utilities for encoding and decoding
 */

export interface Base64Options {
  urlSafe?: boolean;
  padding?: boolean;
}

export interface Base64EncodeOptions extends Base64Options {
  encoding?: BufferEncoding;
}

export interface Base64DecodeOptions extends Base64Options {
  encoding?: BufferEncoding;
}

/**
 * Base64 utilities class
 */
export class Base64Utils {
  private static readonly STANDARD_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  private static readonly URL_SAFE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  private static readonly PADDING_CHAR = '=';

  /**
   * Encode string to base64
   */
  static encode(input: string, options: Base64EncodeOptions = {}): string {
    const { urlSafe = false, padding = true, encoding = 'utf8' } = options;
    
    if (typeof Buffer !== 'undefined') {
      // Node.js environment
      let result = Buffer.from(input, encoding).toString('base64');
      
      if (urlSafe) {
        result = result.replace(/\+/g, '-').replace(/\//g, '_');
      }
      
      if (!padding) {
        result = result.replace(/=/g, '');
      }
      
      return result;
    } else {
      // Browser environment
      const encoded = btoa(unescape(encodeURIComponent(input)));
      
      if (urlSafe) {
        let result = encoded.replace(/\+/g, '-').replace(/\//g, '_');
        
        if (!padding) {
          result = result.replace(/=/g, '');
        }
        
        return result;
      }
      
      return padding ? encoded : encoded.replace(/=/g, '');
    }
  }

  /**
   * Decode base64 string
   */
  static decode(input: string, options: Base64DecodeOptions = {}): string {
    const { urlSafe = false, encoding = 'utf8' } = options;
    
    let normalized = input;
    
    if (urlSafe) {
      normalized = normalized.replace(/-/g, '+').replace(/_/g, '/');
    }
    
    // Add padding if missing
    const padding = normalized.length % 4;
    if (padding > 0) {
      normalized += '='.repeat(4 - padding);
    }
    
    if (typeof Buffer !== 'undefined') {
      // Node.js environment
      return Buffer.from(normalized, 'base64').toString(encoding);
    } else {
      // Browser environment
      try {
        return decodeURIComponent(escape(atob(normalized)));
      } catch (error) {
        throw new Error('Invalid base64 string');
      }
    }
  }

  /**
   * Encode buffer to base64
   */
  static encodeBuffer(buffer: ArrayBuffer | Uint8Array, options: Base64Options = {}): string {
    const { urlSafe = false, padding = true } = options;
    
    const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;
    const chars = urlSafe ? this.URL_SAFE_CHARS : this.STANDARD_CHARS;
    
    let result = '';
    let i = 0;
    
    while (i < bytes.length) {
      const a = bytes[i++];
      const b = i < bytes.length ? bytes[i++] : 0;
      const c = i < bytes.length ? bytes[i++] : 0;
      
      const bitmap = (a << 16) | (b << 8) | c;
      
      result += chars.charAt((bitmap >> 18) & 63);
      result += chars.charAt((bitmap >> 12) & 63);
      result += chars.charAt((bitmap >> 6) & 63);
      result += chars.charAt(bitmap & 63);
    }
    
    // Add padding
    const paddingLength = (3 - (bytes.length % 3)) % 3;
    
    if (padding && paddingLength > 0) {
      result = result.slice(0, -paddingLength) + this.PADDING_CHAR.repeat(paddingLength);
    } else if (!padding) {
      result = result.slice(0, result.length - paddingLength);
    }
    
    return result;
  }

  /**
   * Decode base64 to buffer
   */
  static decodeBuffer(input: string, options: Base64Options = {}): Uint8Array {
    const { urlSafe = false } = options;
    
    let normalized = input;
    
    if (urlSafe) {
      normalized = normalized.replace(/-/g, '+').replace(/_/g, '/');
    }
    
    // Add padding if missing
    const padding = normalized.length % 4;
    if (padding > 0) {
      normalized += '='.repeat(4 - padding);
    }
    
    const chars = urlSafe ? this.URL_SAFE_CHARS : this.STANDARD_CHARS;
    const lookup = new Array(256).fill(-1);
    
    // Build lookup table
    for (let i = 0; i < chars.length; i++) {
      lookup[chars.charCodeAt(i)] = i;
    }
    
    const bufferLength = Math.floor((normalized.length * 3) / 4);
    const buffer = new Uint8Array(bufferLength);
    
    let bufferIndex = 0;
    let i = 0;
    
    while (i < normalized.length) {
      const a = lookup[normalized.charCodeAt(i++)];
      const b = lookup[normalized.charCodeAt(i++)];
      const c = lookup[normalized.charCodeAt(i++)];
      const d = lookup[normalized.charCodeAt(i++)];
      
      if (a === -1 || b === -1 || c === -1 || d === -1) {
        throw new Error('Invalid base64 character');
      }
      
      const bitmap = (a << 18) | (b << 12) | (c << 6) | d;
      
      if (bufferIndex < buffer.length) {
        buffer[bufferIndex++] = (bitmap >> 16) & 255;
      }
      if (bufferIndex < buffer.length) {
        buffer[bufferIndex++] = (bitmap >> 8) & 255;
      }
      if (bufferIndex < buffer.length) {
        buffer[bufferIndex++] = bitmap & 255;
      }
    }
    
    return buffer;
  }

  /**
   * Check if string is valid base64
   */
  static isValid(input: string, options: Base64Options = {}): boolean {
    const { urlSafe = false } = options;
    
    if (!input || typeof input !== 'string') {
      return false;
    }
    
    const chars = urlSafe ? this.URL_SAFE_CHARS : this.STANDARD_CHARS;
    const pattern = urlSafe
      ? /^[A-Za-z0-9_-]*={0,2}$/
      : /^[A-Za-z0-9+/]*={0,2}$/;
    
    if (!pattern.test(input)) {
      return false;
    }
    
    // Check length
    const withoutPadding = input.replace(/=/g, '');
    if (withoutPadding.length % 4 === 1) {
      return false;
    }
    
    try {
      this.decode(input, options);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Encode URL-safe base64
   */
  static encodeUrl(input: string, options: Omit<Base64EncodeOptions, 'urlSafe'> = {}): string {
    return this.encode(input, { ...options, urlSafe: true });
  }

  /**
   * Decode URL-safe base64
   */
  static decodeUrl(input: string, options: Omit<Base64DecodeOptions, 'urlSafe'> = {}): string {
    return this.decode(input, { ...options, urlSafe: true });
  }

  /**
   * Encode without padding
   */
  static encodeNoPadding(input: string, options: Omit<Base64EncodeOptions, 'padding'> = {}): string {
    return this.encode(input, { ...options, padding: false });
  }

  /**
   * Encode URL-safe without padding
   */
  static encodeUrlNoPadding(input: string, options: Omit<Base64EncodeOptions, 'urlSafe' | 'padding'> = {}): string {
    return this.encode(input, { ...options, urlSafe: true, padding: false });
  }

  /**
   * Get base64 string length for given input length
   */
  static getEncodedLength(inputLength: number, options: Base64Options = {}): number {
    const { padding = true } = options;
    
    if (padding) {
      return Math.ceil(inputLength / 3) * 4;
    } else {
      return Math.ceil((inputLength * 4) / 3);
    }
  }

  /**
   * Get decoded length for base64 string
   */
  static getDecodedLength(base64String: string): number {
    const withoutPadding = base64String.replace(/=/g, '');
    return Math.floor((withoutPadding.length * 3) / 4);
  }

  /**
   * Compare two base64 strings
   */
  static compare(a: string, b: string, options: Base64Options = {}): boolean {
    try {
      const decodedA = this.decode(a, options);
      const decodedB = this.decode(b, options);
      return decodedA === decodedB;
    } catch {
      return false;
    }
  }

  /**
   * Normalize base64 string (add padding, convert to standard format)
   */
  static normalize(input: string, options: Base64Options = {}): string {
    const { urlSafe = false, padding = true } = options;
    
    try {
      const decoded = this.decode(input, { urlSafe: true }); // Try URL-safe first
      return this.encode(decoded, { urlSafe, padding });
    } catch {
      try {
        const decoded = this.decode(input, { urlSafe: false }); // Try standard
        return this.encode(decoded, { urlSafe, padding });
      } catch {
        throw new Error('Invalid base64 string');
      }
    }
  }

  /**
   * Convert between URL-safe and standard base64
   */
  static convert(input: string, toUrlSafe: boolean, options: Base64Options = {}): string {
    const { padding = true } = options;
    
    try {
      const decoded = this.decode(input, { urlSafe: !toUrlSafe });
      return this.encode(decoded, { urlSafe: toUrlSafe, padding });
    } catch {
      throw new Error('Invalid base64 string');
    }
  }

  /**
   * Encode JSON object to base64
   */
  static encodeJson(obj: any, options: Base64EncodeOptions = {}): string {
    const json = JSON.stringify(obj);
    return this.encode(json, options);
  }

  /**
   * Decode base64 to JSON object
   */
  static decodeJson<T = any>(input: string, options: Base64DecodeOptions = {}): T {
    const json = this.decode(input, options);
    return JSON.parse(json);
  }

  /**
   * Create base64 data URL
   */
  static createDataUrl(data: string, mimeType = 'text/plain', options: Base64EncodeOptions = {}): string {
    const encoded = this.encode(data, options);
    return `data:${mimeType};base64,${encoded}`;
  }

  /**
   * Parse base64 data URL
   */
  static parseDataUrl(dataUrl: string, options: Base64DecodeOptions = {}): { mimeType: string; data: string } {
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    
    if (!match) {
      throw new Error('Invalid data URL format');
    }
    
    const [, mimeType, base64Data] = match;
    const data = this.decode(base64Data, options);
    
    return { mimeType, data };
  }
}

// Export commonly used functions
export const {
  encode,
  decode,
  encodeBuffer,
  decodeBuffer,
  isValid,
  encodeUrl,
  decodeUrl,
  encodeNoPadding,
  encodeUrlNoPadding,
  getEncodedLength,
  getDecodedLength,
  compare,
  normalize,
  convert,
  encodeJson,
  decodeJson,
  createDataUrl,
  parseDataUrl,
} = Base64Utils;