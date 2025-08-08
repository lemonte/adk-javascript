/**
 * Color utilities for comprehensive color manipulation and conversion
 */
export interface RgbColor {
    r: number;
    g: number;
    b: number;
    a?: number;
}
export interface HslColor {
    h: number;
    s: number;
    l: number;
    a?: number;
}
export interface HsvColor {
    h: number;
    s: number;
    v: number;
    a?: number;
}
export interface HwbColor {
    h: number;
    w: number;
    b: number;
    a?: number;
}
export interface CmykColor {
    c: number;
    m: number;
    y: number;
    k: number;
}
export interface LabColor {
    l: number;
    a: number;
    b: number;
}
export interface XyzColor {
    x: number;
    y: number;
    z: number;
}
export interface ColorHarmony {
    complementary: string[];
    triadic: string[];
    tetradic: string[];
    analogous: string[];
    splitComplementary: string[];
    monochromatic: string[];
}
export interface ColorPalette {
    primary: string;
    secondary: string[];
    accent: string[];
    neutral: string[];
}
export interface ColorAnalysis {
    brightness: number;
    luminance: number;
    contrast: number;
    temperature: 'warm' | 'cool' | 'neutral';
    isLight: boolean;
    isDark: boolean;
}
export interface GradientStop {
    color: string;
    position: number;
}
export interface GradientOptions {
    type?: 'linear' | 'radial' | 'conic';
    direction?: string;
    stops: GradientStop[];
}
/**
 * Color utilities class
 */
export declare class ColorUtils {
    private static readonly COLOR_NAMES;
    /**
     * Parse color string to RGB
     */
    static parseColor(color: string): RgbColor | null;
    /**
     * Convert hex to RGB
     */
    static hexToRgb(hex: string): RgbColor | null;
    /**
     * Convert RGB to hex
     */
    static rgbToHex(rgb: RgbColor, includeAlpha?: boolean): string;
    /**
     * Convert RGB to HSL
     */
    static rgbToHsl(rgb: RgbColor): HslColor;
    /**
     * Convert HSL to RGB
     */
    static hslToRgb(hsl: HslColor): RgbColor;
    /**
     * Convert RGB to HSV
     */
    static rgbToHsv(rgb: RgbColor): HsvColor;
    /**
     * Convert HSV to RGB
     */
    static hsvToRgb(hsv: HsvColor): RgbColor;
    /**
     * Convert RGB to CMYK
     */
    static rgbToCmyk(rgb: RgbColor): CmykColor;
    /**
     * Convert CMYK to RGB
     */
    static cmykToRgb(cmyk: CmykColor): RgbColor;
    /**
     * Get color luminance (relative brightness)
     */
    static getLuminance(color: string | RgbColor): number;
    /**
     * Calculate contrast ratio between two colors
     */
    static getContrastRatio(color1: string | RgbColor, color2: string | RgbColor): number;
    /**
     * Check if color meets WCAG contrast requirements
     */
    static meetsContrastRequirement(foreground: string | RgbColor, background: string | RgbColor, level?: 'AA' | 'AAA', size?: 'normal' | 'large'): boolean;
    /**
     * Check if color is light
     */
    static isLight(color: string | RgbColor): boolean;
    /**
     * Check if color is dark
     */
    static isDark(color: string | RgbColor): boolean;
    /**
     * Get complementary color
     */
    static getComplementary(color: string): string;
    /**
     * Generate color harmony
     */
    static getColorHarmony(color: string): ColorHarmony;
    /**
     * Lighten color
     */
    static lighten(color: string, amount: number): string;
    /**
     * Darken color
     */
    static darken(color: string, amount: number): string;
    /**
     * Saturate color
     */
    static saturate(color: string, amount: number): string;
    /**
     * Desaturate color
     */
    static desaturate(color: string, amount: number): string;
    /**
     * Adjust color hue
     */
    static adjustHue(color: string, degrees: number): string;
    /**
     * Mix two colors
     */
    static mix(color1: string, color2: string, weight?: number): string;
    /**
     * Generate color palette
     */
    static generatePalette(baseColor: string, count?: number): string[];
    /**
     * Generate random color
     */
    static random(options?: {
        hue?: number;
        saturation?: number;
        lightness?: number;
        alpha?: number;
    }): string;
    /**
     * Convert color to CSS string
     */
    static toCss(color: string | RgbColor | HslColor, format?: 'hex' | 'rgb' | 'hsl'): string;
    /**
     * Generate CSS gradient
     */
    static generateGradient(options: GradientOptions): string;
    /**
     * Analyze color properties
     */
    static analyzeColor(color: string): ColorAnalysis | null;
    /**
     * Get accessible text color for background
     */
    static getAccessibleTextColor(backgroundColor: string, options?: {
        level?: 'AA' | 'AAA';
        preferDark?: boolean;
    }): string;
}
export declare const parseColor: typeof ColorUtils.parseColor, hexToRgb: typeof ColorUtils.hexToRgb, rgbToHex: typeof ColorUtils.rgbToHex, rgbToHsl: typeof ColorUtils.rgbToHsl, hslToRgb: typeof ColorUtils.hslToRgb, rgbToHsv: typeof ColorUtils.rgbToHsv, hsvToRgb: typeof ColorUtils.hsvToRgb, rgbToCmyk: typeof ColorUtils.rgbToCmyk, cmykToRgb: typeof ColorUtils.cmykToRgb, getLuminance: typeof ColorUtils.getLuminance, getContrastRatio: typeof ColorUtils.getContrastRatio, meetsContrastRequirement: typeof ColorUtils.meetsContrastRequirement, isLight: typeof ColorUtils.isLight, isDark: typeof ColorUtils.isDark, getComplementary: typeof ColorUtils.getComplementary, getColorHarmony: typeof ColorUtils.getColorHarmony, lighten: typeof ColorUtils.lighten, darken: typeof ColorUtils.darken, saturate: typeof ColorUtils.saturate, desaturate: typeof ColorUtils.desaturate, adjustHue: typeof ColorUtils.adjustHue, mix: typeof ColorUtils.mix, generatePalette: typeof ColorUtils.generatePalette, random: typeof ColorUtils.random, toCss: typeof ColorUtils.toCss, generateGradient: typeof ColorUtils.generateGradient, analyzeColor: typeof ColorUtils.analyzeColor, getAccessibleTextColor: typeof ColorUtils.getAccessibleTextColor;
//# sourceMappingURL=color-utils.d.ts.map