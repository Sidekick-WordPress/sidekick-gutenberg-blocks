export const MARGIN_SIDES = ['top', 'right', 'bottom', 'left'] as const;
export type Margin = Partial<Record<typeof MARGIN_SIDES[number], string>>;

export interface MarginAttributes {
    mobileMargin?: Margin;
    tabletMargin?: Margin;
    desktopMargin?: Margin;
    // Keep native styles registered so previously saved margins survive reloads.
    style?: { spacing?: { margin?: unknown; [key: string]: unknown }; [key: string]: unknown };
}

const normalizeValue = (value: unknown): string | undefined => {
    if (typeof value !== 'string' && typeof value !== 'number') return undefined;
    if (typeof value === 'number' && !Number.isFinite(value)) return undefined;
    const css = String(value).trim();
    if (!css || /[;{}<>\\\x00-\x1f\x7f]|\/\*|\*\//.test(css)) return undefined;
    if (/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(css)) {
        return Number.isFinite(Number(css)) ? `${css}px` : undefined;
    }
    return css.replace(/^var:preset\|spacing\|([a-z0-9-]+)$/i, 'var(--wp--preset--spacing--$1)');
};

// Legacy core margins can be a CSS shorthand; keep spaces inside calc()/var().
const expandShorthand = (value: string): string[] => {
    const parts: string[] = [];
    let depth = 0;
    let part = '';
    for (const char of value.trim()) {
        if (/\s/.test(char) && depth === 0) {
            if (part) parts.push(part);
            part = '';
        } else {
            part += char;
            if (char === '(') depth++;
            if (char === ')') depth--;
            if (depth < 0) return [];
        }
    }
    if (part) parts.push(part);
    if (depth !== 0 || !parts.length || parts.length > 4) return [];
    const [top, right = top, bottom = top, left = right] = parts;
    return [top, right, bottom, left];
};

export const normalizeMargin = (value: unknown): Margin => {
    let source: Record<string, unknown> = {};
    if (typeof value === 'string' || typeof value === 'number') {
        const css = normalizeValue(value);
        const parts = css === undefined ? [] : expandShorthand(css);
        source = Object.fromEntries(MARGIN_SIDES.map((side, index) => [side, parts[index]]));
    } else if (value && typeof value === 'object') {
        source = value as Record<string, unknown>;
    }
    const margin: Margin = {};
    for (const side of MARGIN_SIDES) {
        const css = normalizeValue(source[side]);
        if (css !== undefined) margin[side] = css;
    }
    return margin;
};

export const getResponsiveMargins = (attributes: MarginAttributes) => {
    // An explicit empty base object means reset, including after serialization.
    const mobile = normalizeMargin(attributes.mobileMargin !== undefined
        ? attributes.mobileMargin : attributes.style?.spacing?.margin);
    const tablet = normalizeMargin(attributes.tabletMargin);
    const desktop = normalizeMargin(attributes.desktopMargin);
    const resolvedTablet = {...mobile, ...tablet};
    const resolved = {mobile, tablet: resolvedTablet, desktop: {...resolvedTablet, ...desktop}};
    const cssVars: Record<string, string> = {};
    for (const [tier, values] of Object.entries({mobile, tablet, desktop})) {
        for (const side of MARGIN_SIDES) {
            // Reset absent raw values locally to prevent leakage from outer rows.
            cssVars[`--cols-margin-${side}-${tier}`] = values[side] ?? 'initial';
        }
    }
    return {mobile, tablet, desktop, resolved, cssVars};
};
