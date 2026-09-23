import metadata from './block.json';
import {NavMenuAttributes} from './attributes';

export const DEFAULT_PADDING = metadata.attributes.style.default.spacing.padding;

// Dynamic blocks do not run save-markup deprecations. Upgrade their attributes
// when opened, and keep the equivalent PHP fallback for posts not yet re-saved.
export function migrateMenuStyles(attributes: NavMenuAttributes): NavMenuAttributes {
    if (attributes.styleVersion === 1) {
        // An explicit empty style survives serialization. Undefined would be
        // omitted and restore block.json's insertion defaults on the next load.
        return attributes.style === undefined ? {...attributes, style: {}} : attributes;
    }

    const style = attributes.style ?? {};
    const subMenuStyle = attributes.subMenuStyle ?? {};
    return {
        ...attributes,
        styleVersion: 1,
        style: {
            ...style,
            spacing: {
                ...style.spacing,
                padding: attributes.parentPadding ?? style.spacing?.padding ?? {...DEFAULT_PADDING},
            },
            typography: {
                ...(attributes.textTransform ? {textTransform: attributes.textTransform} : {}),
                ...(attributes.fontWeight ? {fontWeight: attributes.fontWeight} : {}),
                ...style.typography,
            },
        },
        subMenuStyle: {
            ...subMenuStyle,
            spacing: {
                ...subMenuStyle.spacing,
                padding: subMenuStyle.spacing?.padding ?? attributes.subMenuPadding ?? {...DEFAULT_PADDING},
            },
            border: {
                ...subMenuStyle.border,
                radius: subMenuStyle.border?.radius ?? `${attributes.subMenuBorderRadius ?? 0}px`,
            },
        },
        subMenuWidth: typeof attributes.subMenuWidth === 'number'
            ? `${attributes.subMenuWidth}px`
            : attributes.subMenuWidth ?? '240px',
        parentPadding: undefined,
        subMenuPadding: undefined,
        subMenuBorderRadius: undefined,
        textTransform: undefined,
        fontWeight: undefined,
    };
}
