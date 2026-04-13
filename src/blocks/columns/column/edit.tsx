import {__} from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import {useBlockProps, useInnerBlocksProps, InspectorControls} from '@wordpress/block-editor';
import {
    PanelBody,
    SelectControl,
    ColorPalette,
    BoxControl,
    BorderBoxControl,
    RangeControl,
    TextControl
} from '@wordpress/components';
import {BlockEditProps} from '@wordpress/blocks';
import type {CSSProperties} from 'react';
import ControlsMedia from "../../../components/edit-controls/ControlsMedia";

// Plugin
import namespace from '../../../namespace';
import {getPaddingStr, parsePadding} from "../../../helpers/styles";
import {PaddingAttribute} from "../../../models/attr-shapes/padding-margin";

// Block
import {ColumnAttributes} from './attributes';
import VersatileMessage from "../../../components/VersitileMessage";

// Helper to safely parse the Gutenberg Border object into React inline styles
const getBorderStyles = (borderAttr: any): CSSProperties => {
    if (!borderAttr) return {};

    // Handle "flat" border (all sides the same)
    if (borderAttr.width || borderAttr.color || borderAttr.style) {
        return {
            borderWidth: borderAttr.width,
            borderStyle: borderAttr.style,
            borderColor: borderAttr.color,
        };
    }

    // Handle "split" border (individual sides)
    return {
        borderTopWidth: borderAttr.top?.width,
        borderTopStyle: borderAttr.top?.style,
        borderTopColor: borderAttr.top?.color,
        borderRightWidth: borderAttr.right?.width,
        borderRightStyle: borderAttr.right?.style,
        borderRightColor: borderAttr.right?.color,
        borderBottomWidth: borderAttr.bottom?.width,
        borderBottomStyle: borderAttr.bottom?.style,
        borderBottomColor: borderAttr.bottom?.color,
        borderLeftWidth: borderAttr.left?.width,
        borderLeftStyle: borderAttr.left?.style,
        borderLeftColor: borderAttr.left?.color,
    };
};

export default function Edit({attributes, setAttributes, className, context}: BlockEditProps<ColumnAttributes>) {
    const {
            width,
            padding,
            mobilePadding,
            vAlign,
            mobileOrder,
            backgroundImage,
            backgroundColor,
            backgroundImageOpacity,
            backgroundSize,
            backgroundPosition,
            backgroundRepeat,
            backgroundFixedPosition,
            innerMaxWidth,
            contentHAlign,
            border,
            borderRadius, // <-- Restored
        } = attributes,
        { themeColors } = useSelect((select: any) => {
            const settings = select('core/block-editor').getSettings();
            return {
                themeColors: settings.colors || [],
            };
        }, []),
        desktopBreakpoint = context[`${namespace}/desktopBreakpoint`],
        safePadding = parsePadding(padding),
        safeMobilePadding = parsePadding(mobilePadding),
        hasDesktopPadding = padding && Object.values(padding).some(v => v !== undefined && v !== ''),
        cssPadMobile = getPaddingStr(mobilePadding, '10px'),
        cssPadDesktop = hasDesktopPadding ? getPaddingStr(padding, '10px') : 'var(--col-pad-mobile)',
        preciseWidth = width ? Number(width) : 0,
        isAuto = preciseWidth <= 0,
        computedWidth = isAuto
            ? undefined
            : `calc(${preciseWidth}% - (var(--current-gap) * ${(100 - preciseWidth) / 100}))`,
        flexValue = isAuto ? '1 1 0px' : `0 0 ${computedWidth}`,
        maxWidthValue = isAuto ? undefined : computedWidth,

        innerAlignMap: Record<string, string> = {
            left: 'flex-start',
            center: 'center',
            right: 'flex-end'
        },
        innerAlignSelf = innerAlignMap[contentHAlign] || 'flex-start',
        borderStyles = getBorderStyles(border),

        blockProps = useBlockProps({
            className,
            style: {
                '--col-pad-desktop': cssPadDesktop,
                '--col-pad-mobile': cssPadMobile,
                '--col-current-pad': 'var(--col-pad-desktop)',
                '--mobile-order': mobileOrder,
                padding: 'var(--col-current-pad)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: vAlign,
                alignItems: 'stretch',
                flex: flexValue,
                maxWidth: maxWidthValue,
                boxSizing: 'border-box',
                position: 'relative',
                overflow: 'hidden',
                minWidth: 0,
                height: 'auto',
                borderRadius: borderRadius || undefined, // <-- Applied Radius
                ...borderStyles, // <-- Applied Border Box
            } as CSSProperties
        }),
        innerBlocksProps = useInnerBlocksProps({
            style: {width: '100%', minWidth: '0'}
        });

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Column Settings', namespace)}>
                    <RangeControl
                        label={__('Width (%)', namespace)}
                        value={width}
                        onChange={(v) => setAttributes({width: v !== undefined ? v : 0})}
                        min={0} max={100}
                        allowReset={true}
                        help={__('Set to 0 to automatically share available space.', namespace)}
                    />

                    <SelectControl
                        label={__('Vertical Position', namespace)}
                        className={`${namespace}-custom-control`}
                        value={vAlign as any}
                        options={[
                            {label: 'Top', value: 'flex-start'},
                            {label: 'Middle', value: 'center'},
                            {label: 'Bottom', value: 'flex-end'},
                        ]}
                        onChange={(v) => setAttributes({vAlign: v})}
                    />

                    {/* Border Width/Style/Color Control */}
                    <BorderBoxControl
                        label={__('Borders', namespace)}
                        colors={themeColors}
                        value={border}
                        onChange={(v) => setAttributes({ border: v })}
                    />

                    {/* Border Radius Control */}
                    <TextControl
                        label={__('Border Radius', namespace)}
                        value={borderRadius}
                        onChange={(v) => setAttributes({borderRadius: v})}
                        help={__('e.g., 10px, 50%, or 10px 10px 0 0', namespace)}
                    />

                    <TextControl
                        label={__('Inner Content Max Width', namespace)}
                        value={innerMaxWidth}
                        onChange={(v) => setAttributes({innerMaxWidth: v})}
                        help={__('E.g., 500px, 80%, etc. Leave blank for default full width.', namespace)}
                    />

                    <SelectControl
                        label={__('Inner Content Align', namespace)}
                        className={`${namespace}-custom-control`}
                        value={contentHAlign as any}
                        options={[
                            {label: 'Left', value: 'left'},
                            {label: 'Center', value: 'center'},
                            {label: 'Right', value: 'right'},
                        ]}
                        onChange={(v) => setAttributes({contentHAlign: v})}
                    />
                </PanelBody>

                <ControlsMedia
                    panelLabel={__('Column Background Image', namespace)}
                    imageUrl={backgroundImage}
                    onSelectMedia={(media) => setAttributes({backgroundImage: media.url})}
                    onRemoveMedia={() => setAttributes({backgroundImage: ''})}
                    opacity={backgroundImageOpacity}
                    onChangeOpacity={(val) => setAttributes({backgroundImageOpacity: val})}
                    backgroundSize={backgroundSize}
                    onChangeBackgroundSize={(val) => setAttributes({backgroundSize: val})}
                    backgroundPosition={backgroundPosition}
                    onChangeBackgroundPosition={(val) => setAttributes({backgroundPosition: val})}
                    backgroundRepeat={backgroundRepeat}
                    onChangeBackgroundRepeat={(val) => setAttributes({backgroundRepeat: val})}
                    parallax={backgroundFixedPosition}
                    onChangeParallax={(val) => setAttributes({backgroundFixedPosition: val})}
                />

                <PanelBody title={__('Column Background Color', namespace)} initialOpen={false}>
                    <ColorPalette
                        colors={themeColors}
                        value={backgroundColor}
                        onChange={(v) => setAttributes({backgroundColor: v || ''})}
                        clearable={true}
                    />
                </PanelBody>

                <PanelBody title={__('Base Layout (All Screens)', namespace)} initialOpen={false}>
                    <BoxControl
                        label={__('Column Padding', namespace)}
                        values={safeMobilePadding}
                        onChange={(v) => {
                            const isReset = !v || Object.keys(v).length === 0 || Object.values(v).every(val => !val);

                            if (isReset) {
                                setAttributes({
                                    mobilePadding: {top: '0px', right: '0px', bottom: '0px', left: '0px'}
                                });
                            } else {
                                setAttributes({mobilePadding: v as PaddingAttribute});
                            }
                        }}
                    />

                    <RangeControl
                        label={__('Mobile Flex Order', namespace)}
                        value={mobileOrder}
                        onChange={(v) => setAttributes({mobileOrder: v !== undefined ? v : 0})}
                        min={-10} max={10}
                        allowReset={true}
                        help={__('Change the display order on mobile. Lower numbers appear first. 0 is default.', namespace)}
                    />
                </PanelBody>

                <PanelBody title={__('Desktop Overrides', namespace)} initialOpen={false}>
                    <VersatileMessage
                        msg={`Optional overrides for screens WIDER than ${desktopBreakpoint}px. If left blank, base layout values are used.`}
                        type="normal" textAlign="center"/>

                    <BoxControl
                        label={__('Column Padding', namespace)}
                        values={safePadding}
                        onChange={(v) => {
                            const isReset = !v || Object.keys(v).length === 0 || Object.values(v).every(val => !val);
                            setAttributes({
                                padding: isReset ? undefined : v as PaddingAttribute
                            });
                        }}
                    />
                </PanelBody>
            </InspectorControls>

            <div {...blockProps}>
                {backgroundColor && (
                    <div
                        className="u-full_cover_absolute"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor,
                            pointerEvents: 'none',
                            zIndex: 0,
                        }}
                    />
                )}

                {backgroundImage && (
                    <div
                        className="u-full_cover_absolute"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: `url(${backgroundImage})`,
                            backgroundSize: backgroundSize || 'cover',
                            backgroundPosition: backgroundPosition || 'center',
                            backgroundRepeat: backgroundRepeat || 'no-repeat',
                            backgroundAttachment: backgroundFixedPosition ? 'fixed' : 'scroll',
                            opacity: (backgroundImageOpacity ?? 100) / 100,
                            pointerEvents: 'none',
                            zIndex: 0,
                        }}
                    />
                )}

                <div style={{
                    position: 'relative',
                    zIndex: 1,
                    width: '100%',
                    minWidth: '0',
                    maxWidth: innerMaxWidth || undefined,
                    alignSelf: innerAlignSelf
                }}>
                    <div {...innerBlocksProps} />
                </div>
            </div>
        </>
    );
}
