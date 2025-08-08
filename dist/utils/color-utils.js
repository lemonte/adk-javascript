"use strict";
/**
 * Color utilities for comprehensive color manipulation and conversion
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccessibleTextColor = exports.analyzeColor = exports.generateGradient = exports.toCss = exports.random = exports.generatePalette = exports.mix = exports.adjustHue = exports.desaturate = exports.saturate = exports.darken = exports.lighten = exports.getColorHarmony = exports.getComplementary = exports.isDark = exports.isLight = exports.meetsContrastRequirement = exports.getContrastRatio = exports.getLuminance = exports.cmykToRgb = exports.rgbToCmyk = exports.hsvToRgb = exports.rgbToHsv = exports.hslToRgb = exports.rgbToHsl = exports.rgbToHex = exports.hexToRgb = exports.parseColor = exports.ColorUtils = void 0;
/**
 * Color utilities class
 */
class ColorUtils {
    /**
     * Parse color string to RGB
     */
    static parseColor(color) {
        if (!color || typeof color !== 'string') {
            return null;
        }
        const normalizedColor = color.trim().toLowerCase();
        // Handle named colors
        if (this.COLOR_NAMES[normalizedColor]) {
            return this.parseColor(this.COLOR_NAMES[normalizedColor]);
        }
        // Handle hex colors
        if (normalizedColor.startsWith('#')) {
            return this.hexToRgb(normalizedColor);
        }
        // Handle rgb/rgba
        const rgbMatch = normalizedColor.match(/rgba?\(([^)]+)\)/);
        if (rgbMatch) {
            const values = rgbMatch[1].split(',').map(v => parseFloat(v.trim()));
            return {
                r: Math.round(values[0] || 0),
                g: Math.round(values[1] || 0),
                b: Math.round(values[2] || 0),
                a: values[3] !== undefined ? values[3] : 1
            };
        }
        // Handle hsl/hsla
        const hslMatch = normalizedColor.match(/hsla?\(([^)]+)\)/);
        if (hslMatch) {
            const values = hslMatch[1].split(',').map(v => parseFloat(v.trim()));
            const hsl = {
                h: values[0] || 0,
                s: (values[1] || 0) / 100,
                l: (values[2] || 0) / 100,
                a: values[3] !== undefined ? values[3] : 1
            };
            return this.hslToRgb(hsl);
        }
        return null;
    }
    /**
     * Convert hex to RGB
     */
    static hexToRgb(hex) {
        const cleanHex = hex.replace('#', '');
        if (!/^[0-9a-f]{3,8}$/i.test(cleanHex)) {
            return null;
        }
        let r, g, b, a = 1;
        if (cleanHex.length === 3) {
            // Short hex format (#rgb)
            r = parseInt(cleanHex[0] + cleanHex[0], 16);
            g = parseInt(cleanHex[1] + cleanHex[1], 16);
            b = parseInt(cleanHex[2] + cleanHex[2], 16);
        }
        else if (cleanHex.length === 4) {
            // Short hex format with alpha (#rgba)
            r = parseInt(cleanHex[0] + cleanHex[0], 16);
            g = parseInt(cleanHex[1] + cleanHex[1], 16);
            b = parseInt(cleanHex[2] + cleanHex[2], 16);
            a = parseInt(cleanHex[3] + cleanHex[3], 16) / 255;
        }
        else if (cleanHex.length === 6) {
            // Full hex format (#rrggbb)
            r = parseInt(cleanHex.slice(0, 2), 16);
            g = parseInt(cleanHex.slice(2, 4), 16);
            b = parseInt(cleanHex.slice(4, 6), 16);
        }
        else if (cleanHex.length === 8) {
            // Full hex format with alpha (#rrggbbaa)
            r = parseInt(cleanHex.slice(0, 2), 16);
            g = parseInt(cleanHex.slice(2, 4), 16);
            b = parseInt(cleanHex.slice(4, 6), 16);
            a = parseInt(cleanHex.slice(6, 8), 16) / 255;
        }
        else {
            return null;
        }
        return { r, g, b, a };
    }
    /**
     * Convert RGB to hex
     */
    static rgbToHex(rgb, includeAlpha = false) {
        const toHex = (n) => {
            const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        let hex = `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
        if (includeAlpha && rgb.a !== undefined && rgb.a !== 1) {
            hex += toHex(rgb.a * 255);
        }
        return hex;
    }
    /**
     * Convert RGB to HSL
     */
    static rgbToHsl(rgb) {
        const r = rgb.r / 255;
        const g = rgb.g / 255;
        const b = rgb.b / 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;
        const sum = max + min;
        const l = sum / 2;
        let h, s;
        if (diff === 0) {
            h = s = 0;
        }
        else {
            s = l > 0.5 ? diff / (2 - sum) : diff / sum;
            switch (max) {
                case r:
                    h = (g - b) / diff + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / diff + 2;
                    break;
                case b:
                    h = (r - g) / diff + 4;
                    break;
                default:
                    h = 0;
            }
            h /= 6;
        }
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100),
            a: rgb.a
        };
    }
    /**
     * Convert HSL to RGB
     */
    static hslToRgb(hsl) {
        const h = hsl.h / 360;
        const s = hsl.s / 100;
        const l = hsl.l / 100;
        const hue2rgb = (p, q, t) => {
            if (t < 0)
                t += 1;
            if (t > 1)
                t -= 1;
            if (t < 1 / 6)
                return p + (q - p) * 6 * t;
            if (t < 1 / 2)
                return q;
            if (t < 2 / 3)
                return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        }
        else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255),
            a: hsl.a
        };
    }
    /**
     * Convert RGB to HSV
     */
    static rgbToHsv(rgb) {
        const r = rgb.r / 255;
        const g = rgb.g / 255;
        const b = rgb.b / 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;
        const v = max;
        const s = max === 0 ? 0 : diff / max;
        let h;
        if (diff === 0) {
            h = 0;
        }
        else {
            switch (max) {
                case r:
                    h = (g - b) / diff + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / diff + 2;
                    break;
                case b:
                    h = (r - g) / diff + 4;
                    break;
                default:
                    h = 0;
            }
            h /= 6;
        }
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            v: Math.round(v * 100),
            a: rgb.a
        };
    }
    /**
     * Convert HSV to RGB
     */
    static hsvToRgb(hsv) {
        const h = hsv.h / 360;
        const s = hsv.s / 100;
        const v = hsv.v / 100;
        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);
        let r, g, b;
        switch (i % 6) {
            case 0:
                r = v;
                g = t;
                b = p;
                break;
            case 1:
                r = q;
                g = v;
                b = p;
                break;
            case 2:
                r = p;
                g = v;
                b = t;
                break;
            case 3:
                r = p;
                g = q;
                b = v;
                break;
            case 4:
                r = t;
                g = p;
                b = v;
                break;
            case 5:
                r = v;
                g = p;
                b = q;
                break;
            default: r = g = b = 0;
        }
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255),
            a: hsv.a
        };
    }
    /**
     * Convert RGB to CMYK
     */
    static rgbToCmyk(rgb) {
        const r = rgb.r / 255;
        const g = rgb.g / 255;
        const b = rgb.b / 255;
        const k = 1 - Math.max(r, g, b);
        const c = k === 1 ? 0 : (1 - r - k) / (1 - k);
        const m = k === 1 ? 0 : (1 - g - k) / (1 - k);
        const y = k === 1 ? 0 : (1 - b - k) / (1 - k);
        return {
            c: Math.round(c * 100),
            m: Math.round(m * 100),
            y: Math.round(y * 100),
            k: Math.round(k * 100)
        };
    }
    /**
     * Convert CMYK to RGB
     */
    static cmykToRgb(cmyk) {
        const c = cmyk.c / 100;
        const m = cmyk.m / 100;
        const y = cmyk.y / 100;
        const k = cmyk.k / 100;
        const r = 255 * (1 - c) * (1 - k);
        const g = 255 * (1 - m) * (1 - k);
        const b = 255 * (1 - y) * (1 - k);
        return {
            r: Math.round(r),
            g: Math.round(g),
            b: Math.round(b)
        };
    }
    /**
     * Get color luminance (relative brightness)
     */
    static getLuminance(color) {
        const rgb = typeof color === 'string' ? this.parseColor(color) : color;
        if (!rgb)
            return 0;
        const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
    /**
     * Calculate contrast ratio between two colors
     */
    static getContrastRatio(color1, color2) {
        const lum1 = this.getLuminance(color1);
        const lum2 = this.getLuminance(color2);
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        return (brightest + 0.05) / (darkest + 0.05);
    }
    /**
     * Check if color meets WCAG contrast requirements
     */
    static meetsContrastRequirement(foreground, background, level = 'AA', size = 'normal') {
        const ratio = this.getContrastRatio(foreground, background);
        const requirements = {
            'AA': { normal: 4.5, large: 3 },
            'AAA': { normal: 7, large: 4.5 }
        };
        return ratio >= requirements[level][size];
    }
    /**
     * Check if color is light
     */
    static isLight(color) {
        return this.getLuminance(color) > 0.5;
    }
    /**
     * Check if color is dark
     */
    static isDark(color) {
        return !this.isLight(color);
    }
    /**
     * Get complementary color
     */
    static getComplementary(color) {
        const rgb = this.parseColor(color);
        if (!rgb)
            return color;
        const hsl = this.rgbToHsl(rgb);
        hsl.h = (hsl.h + 180) % 360;
        const complementaryRgb = this.hslToRgb(hsl);
        return this.rgbToHex(complementaryRgb);
    }
    /**
     * Generate color harmony
     */
    static getColorHarmony(color) {
        const rgb = this.parseColor(color);
        if (!rgb) {
            return {
                complementary: [],
                triadic: [],
                tetradic: [],
                analogous: [],
                splitComplementary: [],
                monochromatic: []
            };
        }
        const hsl = this.rgbToHsl(rgb);
        const baseHue = hsl.h;
        const generateColor = (hue, saturation, lightness) => {
            const newHsl = {
                h: (hue + 360) % 360,
                s: saturation !== undefined ? saturation : hsl.s,
                l: lightness !== undefined ? lightness : hsl.l,
                a: hsl.a
            };
            return this.rgbToHex(this.hslToRgb(newHsl));
        };
        return {
            complementary: [generateColor(baseHue + 180)],
            triadic: [generateColor(baseHue + 120), generateColor(baseHue + 240)],
            tetradic: [generateColor(baseHue + 90), generateColor(baseHue + 180), generateColor(baseHue + 270)],
            analogous: [generateColor(baseHue - 30), generateColor(baseHue + 30)],
            splitComplementary: [generateColor(baseHue + 150), generateColor(baseHue + 210)],
            monochromatic: [
                generateColor(baseHue, hsl.s, Math.max(0, hsl.l - 20)),
                generateColor(baseHue, hsl.s, Math.max(0, hsl.l - 10)),
                generateColor(baseHue, hsl.s, Math.min(100, hsl.l + 10)),
                generateColor(baseHue, hsl.s, Math.min(100, hsl.l + 20))
            ]
        };
    }
    /**
     * Lighten color
     */
    static lighten(color, amount) {
        const rgb = this.parseColor(color);
        if (!rgb)
            return color;
        const hsl = this.rgbToHsl(rgb);
        hsl.l = Math.min(100, hsl.l + amount);
        return this.rgbToHex(this.hslToRgb(hsl));
    }
    /**
     * Darken color
     */
    static darken(color, amount) {
        const rgb = this.parseColor(color);
        if (!rgb)
            return color;
        const hsl = this.rgbToHsl(rgb);
        hsl.l = Math.max(0, hsl.l - amount);
        return this.rgbToHex(this.hslToRgb(hsl));
    }
    /**
     * Saturate color
     */
    static saturate(color, amount) {
        const rgb = this.parseColor(color);
        if (!rgb)
            return color;
        const hsl = this.rgbToHsl(rgb);
        hsl.s = Math.min(100, hsl.s + amount);
        return this.rgbToHex(this.hslToRgb(hsl));
    }
    /**
     * Desaturate color
     */
    static desaturate(color, amount) {
        const rgb = this.parseColor(color);
        if (!rgb)
            return color;
        const hsl = this.rgbToHsl(rgb);
        hsl.s = Math.max(0, hsl.s - amount);
        return this.rgbToHex(this.hslToRgb(hsl));
    }
    /**
     * Adjust color hue
     */
    static adjustHue(color, degrees) {
        const rgb = this.parseColor(color);
        if (!rgb)
            return color;
        const hsl = this.rgbToHsl(rgb);
        hsl.h = (hsl.h + degrees + 360) % 360;
        return this.rgbToHex(this.hslToRgb(hsl));
    }
    /**
     * Mix two colors
     */
    static mix(color1, color2, weight = 0.5) {
        const rgb1 = this.parseColor(color1);
        const rgb2 = this.parseColor(color2);
        if (!rgb1 || !rgb2)
            return color1;
        const w = weight * 2 - 1;
        const a = (rgb1.a || 1) - (rgb2.a || 1);
        const w1 = (((w * a === -1) ? w : (w + a) / (1 + w * a)) + 1) / 2;
        const w2 = 1 - w1;
        const mixed = {
            r: Math.round(rgb1.r * w1 + rgb2.r * w2),
            g: Math.round(rgb1.g * w1 + rgb2.g * w2),
            b: Math.round(rgb1.b * w1 + rgb2.b * w2),
            a: (rgb1.a || 1) * weight + (rgb2.a || 1) * (1 - weight)
        };
        return this.rgbToHex(mixed, mixed.a !== 1);
    }
    /**
     * Generate color palette
     */
    static generatePalette(baseColor, count = 5) {
        const rgb = this.parseColor(baseColor);
        if (!rgb)
            return [baseColor];
        const hsl = this.rgbToHsl(rgb);
        const palette = [];
        for (let i = 0; i < count; i++) {
            const lightness = (100 / (count - 1)) * i;
            const newHsl = {
                h: hsl.h,
                s: hsl.s,
                l: lightness,
                a: hsl.a
            };
            palette.push(this.rgbToHex(this.hslToRgb(newHsl)));
        }
        return palette;
    }
    /**
     * Generate random color
     */
    static random(options = {}) {
        const { hue = Math.floor(Math.random() * 360), saturation = Math.floor(Math.random() * 101), lightness = Math.floor(Math.random() * 101), alpha = 1 } = options;
        const hsl = { h: hue, s: saturation, l: lightness, a: alpha };
        const rgb = this.hslToRgb(hsl);
        return this.rgbToHex(rgb, alpha !== 1);
    }
    /**
     * Convert color to CSS string
     */
    static toCss(color, format = 'hex') {
        let rgb;
        if (typeof color === 'string') {
            const parsed = this.parseColor(color);
            if (!parsed)
                return color;
            rgb = parsed;
        }
        else if ('r' in color) {
            rgb = color;
        }
        else {
            rgb = this.hslToRgb(color);
        }
        switch (format) {
            case 'hex':
                return this.rgbToHex(rgb, rgb.a !== undefined && rgb.a !== 1);
            case 'rgb':
                if (rgb.a !== undefined && rgb.a !== 1) {
                    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`;
                }
                return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
            case 'hsl':
                const hsl = this.rgbToHsl(rgb);
                if (hsl.a !== undefined && hsl.a !== 1) {
                    return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${hsl.a})`;
                }
                return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
            default:
                return this.rgbToHex(rgb);
        }
    }
    /**
     * Generate CSS gradient
     */
    static generateGradient(options) {
        const { type = 'linear', direction = 'to right', stops } = options;
        const stopStrings = stops
            .sort((a, b) => a.position - b.position)
            .map(stop => `${stop.color} ${stop.position}%`);
        switch (type) {
            case 'linear':
                return `linear-gradient(${direction}, ${stopStrings.join(', ')})`;
            case 'radial':
                return `radial-gradient(${direction}, ${stopStrings.join(', ')})`;
            case 'conic':
                return `conic-gradient(${direction}, ${stopStrings.join(', ')})`;
            default:
                return `linear-gradient(${direction}, ${stopStrings.join(', ')})`;
        }
    }
    /**
     * Analyze color properties
     */
    static analyzeColor(color) {
        const rgb = this.parseColor(color);
        if (!rgb)
            return null;
        const luminance = this.getLuminance(rgb);
        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        const hsl = this.rgbToHsl(rgb);
        // Determine color temperature
        let temperature;
        if (hsl.h >= 0 && hsl.h < 60 || hsl.h >= 300 && hsl.h <= 360) {
            temperature = 'warm'; // Red, orange, yellow, magenta
        }
        else if (hsl.h >= 120 && hsl.h < 240) {
            temperature = 'cool'; // Green, cyan, blue
        }
        else {
            temperature = 'neutral';
        }
        return {
            brightness,
            luminance,
            contrast: this.getContrastRatio(rgb, { r: 255, g: 255, b: 255 }),
            temperature,
            isLight: this.isLight(rgb),
            isDark: this.isDark(rgb)
        };
    }
    /**
     * Get accessible text color for background
     */
    static getAccessibleTextColor(backgroundColor, options = {}) {
        const { level = 'AA', preferDark = true } = options;
        const darkText = '#000000';
        const lightText = '#ffffff';
        const darkContrast = this.getContrastRatio(darkText, backgroundColor);
        const lightContrast = this.getContrastRatio(lightText, backgroundColor);
        const minRatio = level === 'AAA' ? 7 : 4.5;
        if (darkContrast >= minRatio && lightContrast >= minRatio) {
            return preferDark ? darkText : lightText;
        }
        else if (darkContrast >= minRatio) {
            return darkText;
        }
        else if (lightContrast >= minRatio) {
            return lightText;
        }
        else {
            // Neither meets requirements, return the better one
            return darkContrast > lightContrast ? darkText : lightText;
        }
    }
}
exports.ColorUtils = ColorUtils;
// Color name mappings
ColorUtils.COLOR_NAMES = {
    aliceblue: '#f0f8ff',
    antiquewhite: '#faebd7',
    aqua: '#00ffff',
    aquamarine: '#7fffd4',
    azure: '#f0ffff',
    beige: '#f5f5dc',
    bisque: '#ffe4c4',
    black: '#000000',
    blanchedalmond: '#ffebcd',
    blue: '#0000ff',
    blueviolet: '#8a2be2',
    brown: '#a52a2a',
    burlywood: '#deb887',
    cadetblue: '#5f9ea0',
    chartreuse: '#7fff00',
    chocolate: '#d2691e',
    coral: '#ff7f50',
    cornflowerblue: '#6495ed',
    cornsilk: '#fff8dc',
    crimson: '#dc143c',
    cyan: '#00ffff',
    darkblue: '#00008b',
    darkcyan: '#008b8b',
    darkgoldenrod: '#b8860b',
    darkgray: '#a9a9a9',
    darkgreen: '#006400',
    darkkhaki: '#bdb76b',
    darkmagenta: '#8b008b',
    darkolivegreen: '#556b2f',
    darkorange: '#ff8c00',
    darkorchid: '#9932cc',
    darkred: '#8b0000',
    darksalmon: '#e9967a',
    darkseagreen: '#8fbc8f',
    darkslateblue: '#483d8b',
    darkslategray: '#2f4f4f',
    darkturquoise: '#00ced1',
    darkviolet: '#9400d3',
    deeppink: '#ff1493',
    deepskyblue: '#00bfff',
    dimgray: '#696969',
    dodgerblue: '#1e90ff',
    firebrick: '#b22222',
    floralwhite: '#fffaf0',
    forestgreen: '#228b22',
    fuchsia: '#ff00ff',
    gainsboro: '#dcdcdc',
    ghostwhite: '#f8f8ff',
    gold: '#ffd700',
    goldenrod: '#daa520',
    gray: '#808080',
    green: '#008000',
    greenyellow: '#adff2f',
    honeydew: '#f0fff0',
    hotpink: '#ff69b4',
    indianred: '#cd5c5c',
    indigo: '#4b0082',
    ivory: '#fffff0',
    khaki: '#f0e68c',
    lavender: '#e6e6fa',
    lavenderblush: '#fff0f5',
    lawngreen: '#7cfc00',
    lemonchiffon: '#fffacd',
    lightblue: '#add8e6',
    lightcoral: '#f08080',
    lightcyan: '#e0ffff',
    lightgoldenrodyellow: '#fafad2',
    lightgray: '#d3d3d3',
    lightgreen: '#90ee90',
    lightpink: '#ffb6c1',
    lightsalmon: '#ffa07a',
    lightseagreen: '#20b2aa',
    lightskyblue: '#87cefa',
    lightslategray: '#778899',
    lightsteelblue: '#b0c4de',
    lightyellow: '#ffffe0',
    lime: '#00ff00',
    limegreen: '#32cd32',
    linen: '#faf0e6',
    magenta: '#ff00ff',
    maroon: '#800000',
    mediumaquamarine: '#66cdaa',
    mediumblue: '#0000cd',
    mediumorchid: '#ba55d3',
    mediumpurple: '#9370db',
    mediumseagreen: '#3cb371',
    mediumslateblue: '#7b68ee',
    mediumspringgreen: '#00fa9a',
    mediumturquoise: '#48d1cc',
    mediumvioletred: '#c71585',
    midnightblue: '#191970',
    mintcream: '#f5fffa',
    mistyrose: '#ffe4e1',
    moccasin: '#ffe4b5',
    navajowhite: '#ffdead',
    navy: '#000080',
    oldlace: '#fdf5e6',
    olive: '#808000',
    olivedrab: '#6b8e23',
    orange: '#ffa500',
    orangered: '#ff4500',
    orchid: '#da70d6',
    palegoldenrod: '#eee8aa',
    palegreen: '#98fb98',
    paleturquoise: '#afeeee',
    palevioletred: '#db7093',
    papayawhip: '#ffefd5',
    peachpuff: '#ffdab9',
    peru: '#cd853f',
    pink: '#ffc0cb',
    plum: '#dda0dd',
    powderblue: '#b0e0e6',
    purple: '#800080',
    red: '#ff0000',
    rosybrown: '#bc8f8f',
    royalblue: '#4169e1',
    saddlebrown: '#8b4513',
    salmon: '#fa8072',
    sandybrown: '#f4a460',
    seagreen: '#2e8b57',
    seashell: '#fff5ee',
    sienna: '#a0522d',
    silver: '#c0c0c0',
    skyblue: '#87ceeb',
    slateblue: '#6a5acd',
    slategray: '#708090',
    snow: '#fffafa',
    springgreen: '#00ff7f',
    steelblue: '#4682b4',
    tan: '#d2b48c',
    teal: '#008080',
    thistle: '#d8bfd8',
    tomato: '#ff6347',
    turquoise: '#40e0d0',
    violet: '#ee82ee',
    wheat: '#f5deb3',
    white: '#ffffff',
    whitesmoke: '#f5f5f5',
    yellow: '#ffff00',
    yellowgreen: '#9acd32'
};
// Export commonly used functions
exports.parseColor = ColorUtils.parseColor, exports.hexToRgb = ColorUtils.hexToRgb, exports.rgbToHex = ColorUtils.rgbToHex, exports.rgbToHsl = ColorUtils.rgbToHsl, exports.hslToRgb = ColorUtils.hslToRgb, exports.rgbToHsv = ColorUtils.rgbToHsv, exports.hsvToRgb = ColorUtils.hsvToRgb, exports.rgbToCmyk = ColorUtils.rgbToCmyk, exports.cmykToRgb = ColorUtils.cmykToRgb, exports.getLuminance = ColorUtils.getLuminance, exports.getContrastRatio = ColorUtils.getContrastRatio, exports.meetsContrastRequirement = ColorUtils.meetsContrastRequirement, exports.isLight = ColorUtils.isLight, exports.isDark = ColorUtils.isDark, exports.getComplementary = ColorUtils.getComplementary, exports.getColorHarmony = ColorUtils.getColorHarmony, exports.lighten = ColorUtils.lighten, exports.darken = ColorUtils.darken, exports.saturate = ColorUtils.saturate, exports.desaturate = ColorUtils.desaturate, exports.adjustHue = ColorUtils.adjustHue, exports.mix = ColorUtils.mix, exports.generatePalette = ColorUtils.generatePalette, exports.random = ColorUtils.random, exports.toCss = ColorUtils.toCss, exports.generateGradient = ColorUtils.generateGradient, exports.analyzeColor = ColorUtils.analyzeColor, exports.getAccessibleTextColor = ColorUtils.getAccessibleTextColor;
//# sourceMappingURL=color-utils.js.map