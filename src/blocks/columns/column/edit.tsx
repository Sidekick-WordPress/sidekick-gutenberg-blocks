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
    TextControl,
    TabPanel
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

const getBorderStyles = (borderAttr: any): CSSProperties => {
    if (!borderAttr) return {};

    if (borderAttr.width || borderAttr.color || borderAttr.style) {
        return {
            borderWidth: borderAttr.width,
            borderStyle: borderAttr.style,
            borderColor: borderAttr.color,
        };
    }

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
            width, tabletWidth, desktopWidth,
            mobilePadding, tabletPadding, padding,
            vAlign, tabletVAlign, desktopVAlign,
            mobileOrder,
            backgroundImage, backgroundColor,
            tabletBackgroundImage, tabletBackgroundColor,
            desktopBackgroundImage, desktopBackgroundColor,
            backgroundImageOpacity,
            backgroundSize, backgroundPosition, backgroundRepeat, backgroundFixedPosition,
            innerMaxWidth, tabletInnerMaxWidth, desktopInnerMaxWidth,
            contentHAlign, tabletContentHAlign, desktopContentHAlign,
            border, borderRadius,

            // Advanced Layout
            extendTop, extendBottom, translateX, translateY,
            tabExtendTop, tabExtendBottom, tabTranslateX, tabTranslateY,
            deskExtendTop, deskExtendBottom, deskTranslateX, deskTranslateY, 
            zIndex
        } = attributes,
        { themeColors } = useSelect((select: any) => {
            const settings = select('core/block-editor').getSettings();
            return { themeColors: settings.colors || [] };
        }, []),
        
        tabletBreakpoint = context[`${namespace}/tabletBreakpoint`] || 768,
        desktopBreakpoint = context[`${namespace}/desktopBreakpoint`] || 1024,

        // Detection Logic
        hasTabletPadding = tabletPadding && Object.values(tabletPadding).some(v => v !== undefined && v !== ''),
        hasDesktopPadding = padding && Object.values(padding).some(v => v !== undefined && v !== ''),
        
        hasTabletWidth = tabletWidth !== undefined && (tabletWidth as any) !== '',
        hasDesktopWidth = desktopWidth !== undefined && (desktopWidth as any) !== '',

        hasTabletVAlign = !!tabletVAlign,
        hasDesktopVAlign = !!desktopVAlign,

        hasTabletInnerMax = !!tabletInnerMaxWidth,
        hasDesktopInnerMax = !!desktopInnerMaxWidth,

        hasTabletHAlign = !!tabletContentHAlign,
        hasDesktopHAlign = !!desktopContentHAlign,

        hasTabletBgImage = !!tabletBackgroundImage,
        hasTabletBgColor = !!tabletBackgroundColor,
        hasDesktopBgImage = !!desktopBackgroundImage,
        hasDesktopBgColor = !!desktopBackgroundColor,

        // CSS Variables for Padding
        cssPadMobile = getPaddingStr(mobilePadding, '10px'),
        cssPadTablet = hasTabletPadding ? getPaddingStr(tabletPadding, '10px') : 'var(--col-pad-mobile)',
        cssPadDesktop = hasDesktopPadding ? getPaddingStr(padding, '10px') : 'var(--col-pad-tablet)',

        // CSS Variables for Width
        valWidthMobile = width ?? 100,
        valWidthTablet = hasTabletWidth ? tabletWidth : valWidthMobile,
        valWidthDesktop = hasDesktopWidth ? desktopWidth : valWidthTablet,

        // CSS Variables for Backgrounds
        cssBgImageMobile = backgroundImage ? `url(${backgroundImage})` : 'none',
        cssBgImageTablet = hasTabletBgImage ? `url(${tabletBackgroundImage})` : 'var(--col-bg-image-mobile)',
        cssBgImageDesktop = hasDesktopBgImage ? `url(${desktopBackgroundImage})` : 'var(--col-bg-image-tablet)',

        cssBgColorMobile = backgroundColor || 'transparent',
        cssBgColorTablet = hasTabletBgColor ? tabletBackgroundColor : 'var(--col-bg-color-mobile)',
        cssBgColorDesktop = hasDesktopBgColor ? desktopBackgroundColor : 'var(--col-bg-color-tablet)',

        innerAlignMap: Record<string, string> = { left: 'flex-start', center: 'center', right: 'flex-end' },
        borderStyles = getBorderStyles(border);

    // ONLY pass variables inline. The SCSS does the actual CSS manipulation (margin/transform).
    const customStyles: Record<string, any> = {
        '--col-pad-desktop': cssPadDesktop,
        '--col-pad-tablet': cssPadTablet,
        '--col-pad-mobile': cssPadMobile,
        '--mobile-order': mobileOrder,

        // Responsive Widths
        '--col-w-mobile': valWidthMobile,
        '--col-w-tablet': valWidthTablet,
        '--col-w-desktop': valWidthDesktop,

        // Responsive VAlign
        '--col-valign-mobile': vAlign,
        '--col-valign-tablet': hasTabletVAlign ? tabletVAlign : 'var(--col-valign-mobile)',
        '--col-valign-desktop': hasDesktopVAlign ? desktopVAlign : 'var(--col-valign-tablet)',

        // Responsive Inner Max Width
        '--col-inner-max-mobile': innerMaxWidth || '100%',
        '--col-inner-max-tablet': hasTabletInnerMax ? tabletInnerMaxWidth : 'var(--col-inner-max-mobile)',
        '--col-inner-max-desktop': hasDesktopInnerMax ? desktopInnerMaxWidth : 'var(--col-inner-max-tablet)',

        // Responsive HAlign
        '--col-halign-mobile': innerAlignMap[contentHAlign] || 'flex-start',
        '--col-halign-tablet': hasTabletHAlign ? innerAlignMap[tabletContentHAlign] : 'var(--col-halign-mobile)',
        '--col-halign-desktop': hasDesktopHAlign ? innerAlignMap[desktopContentHAlign] : 'var(--col-halign-tablet)',

        // Responsive Backgrounds
        '--col-bg-image-mobile': cssBgImageMobile,
        '--col-bg-image-tablet': cssBgImageTablet,
        '--col-bg-image-desktop': cssBgImageDesktop,
        '--col-bg-color-mobile': cssBgColorMobile,
        '--col-bg-color-tablet': cssBgColorTablet,
        '--col-bg-color-desktop': cssBgColorDesktop,

        // Advanced Layout Base
        '--base-ext-top': extendTop || '0px',
        '--base-ext-bottom': extendBottom || '0px',
        '--base-trans-x': translateX || '0px',
        '--base-trans-y': translateY || '0px',

        // Advanced Layout Tablet Overrides
        '--tab-ext-top': tabExtendTop || 'var(--base-ext-top)',
        '--tab-ext-bottom': tabExtendBottom || 'var(--base-ext-bottom)',
        '--tab-trans-x': tabTranslateX || 'var(--base-trans-x)',
        '--tab-trans-y': tabTranslateY || 'var(--base-trans-y)',

        // Advanced Layout Desktop Overrides
        '--desk-ext-top': deskExtendTop || 'var(--tab-ext-top)',
        '--desk-ext-bottom': deskExtendBottom || 'var(--tab-ext-bottom)',
        '--desk-trans-x': deskTranslateX || 'var(--tab-trans-x)',
        '--desk-trans-y': deskTranslateY || 'var(--tab-trans-y)',

        padding: 'var(--col-current-pad)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'var(--current-valign)',
        alignItems: 'stretch',
        backgroundColor: 'var(--current-bg-color)',
        
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
        minWidth: 0,
        height: 'auto',
        borderRadius: borderRadius || undefined,
        ...borderStyles,
    };

    const blockProps = useBlockProps({
        className: `${className} ${ (extendTop || tabExtendTop || deskExtendTop) ? 'has-advanced-layout' : ''}`,
        style: customStyles as CSSProperties
    });

    const innerBlocksProps = useInnerBlocksProps({ 
        style: {
            width: '100%', 
            minWidth: '0',
            maxWidth: 'var(--current-inner-max)',
            alignSelf: 'var(--current-halign)'
        } 
    });

    const renderLayoutTab = (tabName: string) => {
        switch (tabName) {
            case 'mobile':
                return (
                    <div style={{ paddingTop: '16px' }}>
                        <RangeControl
                            label={__('Width (%)', namespace)}
                            value={width}
                            onChange={(v) => setAttributes({width: v ?? 100})}
                            min={0} max={100}
                        />
                        <BoxControl
                            label={__('Padding', namespace)}
                            values={parsePadding(mobilePadding)}
                            onChange={(v) => setAttributes({mobilePadding: v as PaddingAttribute})}
                        />
                        <SelectControl
                            label={__('Vertical Position', namespace)}
                            value={vAlign}
                            options={[
                                {label: 'Top', value: 'flex-start'},
                                {label: 'Middle', value: 'center'},
                                {label: 'Bottom', value: 'flex-end'},
                            ]}
                            onChange={(v) => setAttributes({vAlign: v})}
                        />
                        <TextControl
                            label={__('Inner Content Max Width', namespace)}
                            value={innerMaxWidth}
                            onChange={(v) => setAttributes({innerMaxWidth: v})}
                        />
                        <SelectControl
                            label={__('Inner Content Align', namespace)}
                            value={contentHAlign}
                            options={[
                                {label: 'Left', value: 'left'},
                                {label: 'Center', value: 'center'},
                                {label: 'Right', value: 'right'},
                            ]}
                            onChange={(v) => setAttributes({contentHAlign: v})}
                        />

                        <div style={{ marginTop: '24px', fontWeight: 600 }}>{__('Background', namespace)}</div>
                        <ColorPalette
                            colors={themeColors}
                            value={backgroundColor}
                            onChange={(v) => setAttributes({backgroundColor: v || ''})}
                            clearable
                        />
                        <ControlsMedia
                            panelLabel={__('Background Image', namespace)}
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

                        <div style={{ fontWeight: 600, marginTop: '24px', marginBottom: '8px' }}>{__('Advanced Layout', namespace)}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <TextControl label={__('Ext Top', namespace)} value={extendTop} onChange={(v) => setAttributes({extendTop: v})} />
                            <TextControl label={__('Ext Bottom', namespace)} value={extendBottom} onChange={(v) => setAttributes({extendBottom: v})} />
                            <TextControl label={__('Trans X', namespace)} value={translateX} onChange={(v) => setAttributes({translateX: v})} />
                            <TextControl label={__('Trans Y', namespace)} value={translateY} onChange={(v) => setAttributes({translateY: v})} />
                        </div>
                    </div>
                );
            case 'tablet':
                return (
                    <div style={{ paddingTop: '16px' }}>
                        <RangeControl
                            label={__('Width (%)', namespace)}
                            value={tabletWidth}
                            onChange={(v) => setAttributes({tabletWidth: v})}
                            min={0} max={100}
                            allowReset
                        />
                        <BoxControl
                            label={__('Padding', namespace)}
                            values={parsePadding(tabletPadding)}
                            onChange={(v) => setAttributes({tabletPadding: v as PaddingAttribute})}
                        />
                        <SelectControl
                            label={__('Vertical Position', namespace)}
                            value={tabletVAlign}
                            options={[
                                {label: __('Inherit', namespace), value: ''},
                                {label: 'Top', value: 'flex-start'},
                                {label: 'Middle', value: 'center'},
                                {label: 'Bottom', value: 'flex-end'},
                            ]}
                            onChange={(v) => setAttributes({tabletVAlign: v})}
                        />
                        <TextControl
                            label={__('Inner Content Max Width', namespace)}
                            value={tabletInnerMaxWidth}
                            onChange={(v) => setAttributes({tabletInnerMaxWidth: v})}
                            placeholder={__('Inherit', namespace)}
                        />
                        <SelectControl
                            label={__('Inner Content Align', namespace)}
                            value={tabletContentHAlign}
                            options={[
                                {label: __('Inherit', namespace), value: ''},
                                {label: 'Left', value: 'left'},
                                {label: 'Center', value: 'center'},
                                {label: 'Right', value: 'right'},
                            ]}
                            onChange={(v) => setAttributes({tabletContentHAlign: v})}
                        />

                        <div style={{ marginTop: '24px', fontWeight: 600 }}>{__('Background Override', namespace)}</div>
                        <ColorPalette
                            colors={themeColors}
                            value={tabletBackgroundColor}
                            onChange={(v) => setAttributes({tabletBackgroundColor: v || ''})}
                            clearable
                        />
                        <ControlsMedia
                            panelLabel={__('Background Image Override', namespace)}
                            imageUrl={tabletBackgroundImage}
                            onSelectMedia={(media) => setAttributes({tabletBackgroundImage: media.url})}
                            onRemoveMedia={() => setAttributes({tabletBackgroundImage: ''})}
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

                         <div style={{ fontWeight: 600, marginTop: '24px', marginBottom: '8px' }}>{__('Advanced Layout', namespace)}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <TextControl label={__('Ext Top', namespace)} value={tabExtendTop} onChange={(v) => setAttributes({tabExtendTop: v})} />
                            <TextControl label={__('Ext Bottom', namespace)} value={tabExtendBottom} onChange={(v) => setAttributes({tabExtendBottom: v})} />
                            <TextControl label={__('Trans X', namespace)} value={tabTranslateX} onChange={(v) => setAttributes({tabTranslateX: v})} />
                            <TextControl label={__('Trans Y', namespace)} value={tabTranslateY} onChange={(v) => setAttributes({tabTranslateY: v})} />
                        </div>
                    </div>
                );
            case 'desktop':
                return (
                    <div style={{ paddingTop: '16px' }}>
                        <RangeControl
                            label={__('Width (%)', namespace)}
                            value={desktopWidth}
                            onChange={(v) => setAttributes({desktopWidth: v})}
                            min={0} max={100}
                            allowReset
                        />
                        <BoxControl
                            label={__('Padding', namespace)}
                            values={parsePadding(padding)}
                            onChange={(v) => setAttributes({padding: v as PaddingAttribute})}
                        />
                        <SelectControl
                            label={__('Vertical Position', namespace)}
                            value={desktopVAlign}
                            options={[
                                {label: __('Inherit', namespace), value: ''},
                                {label: 'Top', value: 'flex-start'},
                                {label: 'Middle', value: 'center'},
                                {label: 'Bottom', value: 'flex-end'},
                            ]}
                            onChange={(v) => setAttributes({desktopVAlign: v})}
                        />
                        <TextControl
                            label={__('Inner Content Max Width', namespace)}
                            value={desktopInnerMaxWidth}
                            onChange={(v) => setAttributes({desktopInnerMaxWidth: v})}
                            placeholder={__('Inherit', namespace)}
                        />
                        <SelectControl
                            label={__('Inner Content Align', namespace)}
                            value={desktopContentHAlign}
                            options={[
                                {label: __('Inherit', namespace), value: ''},
                                {label: 'Left', value: 'left'},
                                {label: 'Center', value: 'center'},
                                {label: 'Right', value: 'right'},
                            ]}
                            onChange={(v) => setAttributes({desktopContentHAlign: v})}
                        />

                        <div style={{ marginTop: '24px', fontWeight: 600 }}>{__('Background Override', namespace)}</div>
                        <ColorPalette
                            colors={themeColors}
                            value={desktopBackgroundColor}
                            onChange={(v) => setAttributes({desktopBackgroundColor: v || ''})}
                            clearable
                        />
                        <ControlsMedia
                            panelLabel={__('Background Image Override', namespace)}
                            imageUrl={desktopBackgroundImage}
                            onSelectMedia={(media) => setAttributes({desktopBackgroundImage: media.url})}
                            onRemoveMedia={() => setAttributes({desktopBackgroundImage: ''})}
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

                         <div style={{ fontWeight: 600, marginTop: '24px', marginBottom: '8px' }}>{__('Advanced Layout', namespace)}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <TextControl label={__('Ext Top', namespace)} value={deskExtendTop} onChange={(v) => setAttributes({deskExtendTop: v})} />
                            <TextControl label={__('Ext Bottom', namespace)} value={deskExtendBottom} onChange={(v) => setAttributes({deskExtendBottom: v})} />
                            <TextControl label={__('Trans X', namespace)} value={deskTranslateX} onChange={(v) => setAttributes({deskTranslateX: v})} />
                            <TextControl label={__('Trans Y', namespace)} value={deskTranslateY} onChange={(v) => setAttributes({deskTranslateY: v})} />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Column Settings', namespace)}>
                    <RangeControl
                        label={__('Mobile Flex Order', namespace)}
                        value={mobileOrder}
                        onChange={(v) => setAttributes({mobileOrder: v ?? 0})}
                        min={-10} max={10}
                        allowReset
                        help={__('Change the display order on mobile. Lower numbers appear first.', namespace)}
                    />
                    <RangeControl
                        label={__('Z-Index', namespace)}
                        value={zIndex}
                        onChange={(v) => setAttributes({zIndex: v ?? 1})}
                        min={0} max={100}
                    />
                    <BorderBoxControl
                        label={__('Borders', namespace)}
                        colors={themeColors}
                        value={border}
                        onChange={(v) => setAttributes({ border: v })}
                    />
                    <TextControl
                        label={__('Border Radius', namespace)}
                        value={borderRadius}
                        onChange={(v) => setAttributes({borderRadius: v})}
                        help={__('e.g., 10px, 50%, or 10px 10px 0 0', namespace)}
                    />
                </PanelBody>

                <PanelBody title={__('Responsive Layout', namespace)}>
                    <TabPanel
                        className={`${namespace}-responsive-tabs`}
                        activeClass="is-active"
                        tabs={[
                            { name: 'mobile', title: __('Base', namespace), className: 'tab-mobile' },
                            { name: 'tablet', title: __('Tablet', namespace), className: 'tab-tablet' },
                            { name: 'desktop', title: __('Desktop', namespace), className: 'tab-desktop' },
                        ]}
                    >
                        {(tab) => renderLayoutTab(tab.name)}
                    </TabPanel>
                </PanelBody>
            </InspectorControls>

            <div {...blockProps}>
                <div
                    className="u-full_cover_absolute"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'var(--current-bg-color)',
                        pointerEvents: 'none',
                        zIndex: 0,
                    }}
                />

                <div
                    className="u-full_cover_absolute"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: 'var(--current-bg-image)',
                        backgroundSize: backgroundSize || 'cover',
                        backgroundPosition: backgroundPosition || 'center',
                        backgroundRepeat: backgroundRepeat || 'no-repeat',
                        backgroundAttachment: backgroundFixedPosition ? 'fixed' : 'scroll',
                        opacity: (backgroundImageOpacity ?? 100) / 100,
                        pointerEvents: 'none',
                        zIndex: 0,
                    }}
                />

                <div style={{
                    position: 'relative',
                    zIndex: 1,
                    width: '100%',
                    minWidth: '0',
                    maxWidth: 'var(--current-inner-max)',
                    alignSelf: 'var(--current-halign)',
                    boxSizing: 'border-box'
                }}>
                    <div {...innerBlocksProps} />
                </div>
            </div>
        </>
    );
}
