import {normalizeMargin} from './margins';
import type {PaddingAttribute} from '../../models/attr-shapes/padding-margin';

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
