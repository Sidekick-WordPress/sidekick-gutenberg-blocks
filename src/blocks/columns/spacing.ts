import {normalizeMargin} from './margins';
import type {PaddingAttribute} from '../../models/attr-shapes/padding-margin';
import namespace from '../../namespace';

export const ZERO_SPACING: PaddingAttribute = {top: '0', right: '0', bottom: '0', left: '0'};

// Native spacing controls recognize preset tokens and unitless zero. CSS values
// are resolved separately so a saved preset remains a named notch after reload.
export const getSpacingControlValues = (value: unknown): PaddingAttribute => {
    const normalized = normalizeMargin(value);
    return Object.fromEntries(Object.entries(normalized).map(([side, css]) => [
        side,
        /^[-+]?0(?:\.0+)?(?:[a-z%]+)?$/i.test(css) ? '0'
            : css.replace(/^var\(--wp--preset--spacing--([a-z0-9-]+)\)$/i, 'var:preset|spacing|$1'),
    ]));
};

// Base padding has no inherited tier. Save cleared sides as explicit zero so
// PHP block serialization cannot turn an empty object into an invalid array.
export const getBasePaddingValues = (value: unknown): PaddingAttribute => ({
    ...ZERO_SPACING,
    ...getSpacingControlValues(value),
});

export const recoverClearedColumnsPadding = (
    attributes: Record<string, unknown>,
    blockType: {name: string},
    _innerHTML: string,
    rawAttributes: Record<string, unknown> = {},
) => {
    if (blockType.name !== `${namespace}/columns`) return attributes;
    const savedPadding = rawAttributes?.mobilePadding;
    if (!savedPadding || typeof savedPadding !== 'object'
        || Object.keys(savedPadding).length !== 0) return attributes;

    // The parser has already replaced a saved [] with the 20px schema default.
    // Inspect the raw comment to recover a deliberate reset without changing
    // the default for older blocks whose mobilePadding attribute is absent.
    return {...attributes, mobilePadding: getBasePaddingValues(savedPadding)};
};
