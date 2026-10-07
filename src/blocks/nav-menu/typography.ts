import {MenuTypography, NavMenuAttributes} from './attributes';

// WordPress settings can expose either a flat preset list or lists by origin.
export function typographyPresets<T extends {slug: string}>(
    presets?: T[] | {default?: T[]; theme?: T[]; custom?: T[]},
    includeDefaults = true,
): T[] {
    const values = Array.isArray(presets) ? presets : [
        ...(includeDefaults ? presets?.default ?? [] : []),
        ...(presets?.theme ?? []),
        ...(presets?.custom ?? []),
    ];
    return Array.from(new Map(values.map((preset) => [preset.slug, preset])).values());
}

// Preserve the preset slugs saved by the original native typography controls.
export function desktopTypography(attributes: NavMenuAttributes): MenuTypography {
    return {
        ...attributes.style?.typography,
        ...(attributes.fontFamily ? {fontFamily: `var:preset|font-family|${attributes.fontFamily}`} : {}),
        ...(attributes.fontSize ? {fontSize: `var:preset|font-size|${attributes.fontSize}`} : {}),
    };
}

export function mobileTypography(attributes: NavMenuAttributes): MenuTypography {
    // An explicit empty object means the user reset the new controls. Only
    // menus that have never used them fall back to the legacy size attribute.
    return attributes.mobileMenuStyle?.typography ?? {fontSize: `${attributes.mobileFontSize ?? 24}px`};
}
