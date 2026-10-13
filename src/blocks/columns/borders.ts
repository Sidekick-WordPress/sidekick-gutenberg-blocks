import type {CSSProperties} from 'react';

export const BORDER_SIDES = ['top', 'right', 'bottom', 'left'] as const;
export const BORDER_PROPERTIES = ['width', 'style', 'color'] as const;
type BorderSide = typeof BORDER_SIDES[number];
type BorderProperty = typeof BORDER_PROPERTIES[number];
type BorderStyle = {
    width?: CSSProperties['borderWidth'];
    style?: CSSProperties['borderStyle'];
    color?: CSSProperties['borderColor'];
};
export type BorderValue = BorderStyle & Partial<Record<BorderSide, BorderStyle>>;
export interface BorderAttributes {
    border?: BorderValue;
    tabletBorder?: BorderValue;
    desktopBorder?: BorderValue;
}
type ResolvedBorder = Record<BorderSide, Record<BorderProperty, string>>;

const DEFAULT_BORDER = {width: '0px', style: 'solid', color: 'currentColor'};
const BORDER_STYLES = new Set(['none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset']);

const normalizeBorderProperty = (property: BorderProperty, value: unknown): string | undefined => {
    if (typeof value !== 'string' && typeof value !== 'number') return undefined;
    if (typeof value === 'number' && !Number.isFinite(value)) return undefined;
    const css = String(value).trim();
    if (!css || /[;{}<>\\\x00-\x1f\x7f]|\/\*|\*\//.test(css)) return undefined;
    if (property === 'style') return BORDER_STYLES.has(css) ? css : undefined;
    if (property === 'width') {
        if (typeof value === 'number' || /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(css)) {
            const width = Number(css);
            return Number.isFinite(width) && width >= 0 ? `${width}px` : undefined;
        }
        if (css.startsWith('-')) return undefined;
    }
    return property === 'color'
        ? css.replace(/^var:preset\|color\|([a-z0-9-]+)$/i, 'var(--wp--preset--color--$1)') : css;
};

const asObject = (value: unknown): Record<string, unknown> =>
    value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};

export const getResponsiveBorders = (attributes: BorderAttributes) => {
    const resolved = {} as Record<'mobile' | 'tablet' | 'desktop', ResolvedBorder>;
    const cssVars: Record<string, string> = {};
    let previous: ResolvedBorder | undefined;
    for (const [tier, input] of [
        ['mobile', attributes.border],
        ['tablet', attributes.tabletBorder],
        ['desktop', attributes.desktopBorder],
    ] as const) {
        const border = asObject(input);
        const current = {} as ResolvedBorder;
        for (const side of BORDER_SIDES) {
            const sideBorder = asObject(border[side]);
            current[side] = {...DEFAULT_BORDER};
            for (const property of BORDER_PROPERTIES) {
                const value = normalizeBorderProperty(property, sideBorder[property])
                    ?? normalizeBorderProperty(property, border[property])
                    ?? previous?.[side][property]
                    ?? DEFAULT_BORDER[property];
                current[side][property] = value;
                // Define every value locally so nested containers cannot inherit
                // borders from their parent, even without CSS @property support.
                cssVars[`--cols-border-${side}-${property}-${tier}`] = value;
            }
        }
        resolved[tier] = current;
        previous = current;
    }
    return {resolved, cssVars};
};
