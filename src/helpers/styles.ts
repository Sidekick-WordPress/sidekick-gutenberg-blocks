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
