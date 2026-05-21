import { PaddingAttribute } from "../models/attr-shapes/padding-margin";

export const parsePadding = (p: any): PaddingAttribute | {} => {
    // 1. Handle legacy number attributes
    if (typeof p === 'number') {
        return { top: `${p}px`, right: `${p}px`, bottom: `${p}px`, left: `${p}px` };
    }

    // 2. Handle empty states (like after hitting reset)
    if (!p || typeof p !== 'object') {
        return {};
    }

    // 3. Fix Gutenberg's missing unit bug
    const safeObj: Record<string, string> = {};

    for (const [key, value] of Object.entries(p)) {
        if (value !== undefined && value !== '') {
            // If the value is purely a number (e.g., "20" or 20), append "px".
            // If it already has a unit (e.g., "20px" or "2em"), leave it alone.
            safeObj[key] = !isNaN(Number(value)) ? `${value}px` : String(value);
        }
    }

    return safeObj as PaddingAttribute;
};

export const ensureUnit = (val: string | number | undefined, defaultUnit = 'px') => {
    if (val === undefined || val === '' || val === null) return '';
    if (!isNaN(Number(val))) return `${val}${defaultUnit}`;
    return String(val);
};

export const getPaddingStr = (p: PaddingAttribute | undefined, fallback = '0px') => {
    const parsed = parsePadding(p) as PaddingAttribute;

    return `${parsed.top || fallback} ${parsed.right || fallback} ${parsed.bottom || fallback} ${parsed.left || fallback}`;
};

// Column-width presets like 1/3 or 1/6 are repeating decimals. The RangeControl
// snaps to integers, so a user nudging the slider to "33" actually wants
// 33.333333 — without this, three "33%" columns + gaps come out to ~99% and
// leave a visible sliver. Whole-number inputs in this map get the float
// equivalent; any value already containing a fraction passes through.
const COLUMN_WIDTH_FRACTIONS: Record<number, number> = {
    16: 16.666667,
    17: 16.666667,
    33: 33.333333,
    66: 66.666667,
    67: 66.666667,
    83: 83.333333,
};

export const normalizeColumnWidth = (w: number | undefined | null): number | undefined => {
    if (w === undefined || w === null || w === '' as any) return undefined;
    const num = Number(w);
    if (!Number.isFinite(num)) return undefined;
    if (Number.isInteger(num) && num in COLUMN_WIDTH_FRACTIONS) {
        return COLUMN_WIDTH_FRACTIONS[num];
    }
    return num;
};
