import {__} from '@wordpress/i18n';
import {
    useSettings,
    LineHeightControl,
    __experimentalFontFamilyControl as FontFamilyControl,
    __experimentalFontAppearanceControl as FontAppearanceControl,
    __experimentalLetterSpacingControl as LetterSpacingControl,
    __experimentalTextTransformControl as TextTransformControl,
    __experimentalTextDecorationControl as TextDecorationControl,
} from '@wordpress/block-editor';
import {Button, FontSizePicker, PanelBody, TextControl} from '@wordpress/components';
import namespace from '../../namespace';
import {MenuTypography} from './attributes';
import {typographyPresets} from './typography';

interface FontFamilyPreset {
    slug: string;
    name: string;
    fontFamily: string;
    fontFace?: Array<{fontStyle?: string; fontWeight?: string}>;
}

interface FontSizePreset {
    slug: string;
    name: string;
    size: string | number;
}

interface Props {
    title: string;
    help: string;
    value?: MenuTypography;
    onChange: (value: MenuTypography) => void;
}

export default function TypographyPanel({title, help, value = {}, onChange}: Props) {
    const [familyPresets, sizePresets, defaultFontSizes] = useSettings(
        'typography.fontFamilies', 'typography.fontSizes', 'typography.defaultFontSizes',
    );
    const fontFamilies = typographyPresets<FontFamilyPreset>(familyPresets);
    const fontSizes = typographyPresets<FontSizePreset>(sizePresets, defaultFontSizes !== false);
    const familySlug = value.fontFamily?.match(/^var:preset\|font-family\|(.+)$/)?.[1];
    const selectedFamily = fontFamilies.find((font) => familySlug
        ? font.slug === familySlug : font.fontFamily === value.fontFamily);
    const sizeSlug = String(value.fontSize ?? '').match(/^var:preset\|font-size\|(.+)$/)?.[1];
    const update = (changes: Partial<MenuTypography>) => onChange({...value, ...changes});

    return (
        <PanelBody className="sgb-inspector-panel" title={title} initialOpen={false}>
            <p>{help}</p>
            <div className="sgb-nav-menu-typography-controls">
                {fontFamilies.length ? (
                    <FontFamilyControl
                        __next40pxDefaultSize __nextHasNoMarginBottom
                        fontFamilies={fontFamilies}
                        value={selectedFamily?.fontFamily ?? value.fontFamily ?? ''}
                        onChange={(fontFamily: string) => {
                            const preset = fontFamilies.find((font) => font.fontFamily === fontFamily);
                            update({fontFamily: preset ? `var:preset|font-family|${preset.slug}` : fontFamily || undefined});
                        }}
                    />
                ) : (
                    <TextControl
                        __next40pxDefaultSize __nextHasNoMarginBottom
                        label={__('Font family', namespace)}
                        placeholder={__('Inherit', namespace)}
                        value={value.fontFamily ?? ''}
                        onChange={(fontFamily) => update({fontFamily: fontFamily || undefined})}
                    />
                )}
                <FontSizePicker
                    __next40pxDefaultSize __nextHasNoMarginBottom
                    fontSizes={fontSizes}
                    value={sizeSlug ?? value.fontSize}
                    valueMode={sizeSlug ? 'slug' : 'literal'}
                    onChange={(fontSize, extra) => update({fontSize: extra?.slug
                        ? `var:preset|font-size|${extra.slug}`
                        : typeof fontSize === 'number' ? `${fontSize}px` : fontSize})}
                    withReset
                />
                <FontAppearanceControl
                    __next40pxDefaultSize
                    value={{fontStyle: value.fontStyle, fontWeight: value.fontWeight}}
                    fontFamilyFaces={selectedFamily?.fontFace}
                    onChange={update}
                />
                <LineHeightControl __next40pxDefaultSize __unstableInputWidth="auto" value={value.lineHeight}
                    onChange={(lineHeight?: string) => update({lineHeight})}/>
                <LetterSpacingControl __next40pxDefaultSize __unstableInputWidth="auto" value={value.letterSpacing}
                    onChange={(letterSpacing?: string) => update({letterSpacing})}/>
                <TextTransformControl value={value.textTransform}
                    onChange={(textTransform?: string) => update({textTransform})}/>
                <TextDecorationControl value={value.textDecoration}
                    onChange={(textDecoration?: string) => update({textDecoration})}/>
                <Button variant="secondary" onClick={() => onChange({})}>
                    {__('Reset typography', namespace)}
                </Button>
            </div>
        </PanelBody>
    );
}
