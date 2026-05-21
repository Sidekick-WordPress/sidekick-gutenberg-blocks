import {__} from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import {useBlockProps, useInnerBlocksProps, InspectorControls, __experimentalBorderRadiusControl as BorderRadiusControl} from '@wordpress/block-editor';
import {
    PanelBody,
    SelectControl,
    ColorPalette,
    BoxControl,
    BorderBoxControl,
    RangeControl,
    TabPanel,
    TextControl,
    ToggleControl,
    __experimentalDivider as Divider,
    __experimentalUnitControl as UnitControl,
} from '@wordpress/components';
import {BlockEditProps} from '@wordpress/blocks';
import {useState, useEffect, useRef} from '@wordpress/element';
import type {CSSProperties} from 'react';
import ControlsMedia from "../../../components/edit-controls/ControlsMedia";

// Plugin
import namespace from '../../../namespace';
import {getPaddingStr, parsePadding, ensureUnit, normalizeColumnWidth} from "../../../helpers/styles";
import {normalizeHtmlId} from "../../../helpers/html";
import {PaddingAttribute} from "../../../models/attr-shapes/padding-margin";

// Block
import {ColumnAttributes} from './attributes';
import VersatileMessage from "../../../components/VersitileMessage";

type BorderRadiusValue = string | Record<string, string> | undefined;

const borderRadiusToCss = (val: BorderRadiusValue, fallback = '0px'): string => {
    if (!val) return fallback;
    if (typeof val === 'string') return val || fallback;
    const { topLeft = '0px', topRight = '0px', bottomRight = '0px', bottomLeft = '0px' } = val;
    if (!topLeft && !topRight && !bottomRight && !bottomLeft) return fallback;
    return `${topLeft} ${topRight} ${bottomRight} ${bottomLeft}`;
};

const hasBorderRadiusValue = (val: BorderRadiusValue): boolean => {
    if (!val) return false;
    if (typeof val === 'string') return !!val;
    return Object.values(val).some(v => !!v);
};

const getBorderVars = (borderAttr: any, prefix: string): Record<string, string> => {
    const vars: Record<string, string> = {};
    if (!borderAttr) return vars;

    if (borderAttr.width || borderAttr.color || borderAttr.style) {
        if (borderAttr.width) vars[`--col-border-width-${prefix}`] = borderAttr.width;
        vars[`--col-border-style-${prefix}`] = borderAttr.style || 'solid';
        if (borderAttr.color) vars[`--col-border-color-${prefix}`] = borderAttr.color;
    } else {
        ['top', 'right', 'bottom', 'left'].forEach(side => {
            const s = borderAttr[side];
            if (s && (s.width || s.color || s.style)) {
                if (s.width) vars[`--col-border-${side}-width-${prefix}`] = s.width;
                vars[`--col-border-${side}-style-${prefix}`] = s.style || 'solid';
                if (s.color) vars[`--col-border-${side}-color-${prefix}`] = s.color;
            }
        });
    }
    return vars;
};

export default function Edit({attributes, setAttributes, className, context}: BlockEditProps<ColumnAttributes>) {
    const {
            htmlId,
            width, tabletWidth, desktopWidth,
            mobilePadding, tabletPadding, padding,
            vAlign, tabletVAlign, desktopVAlign,
            mobileOrder, tabletOrder, desktopOrder,
            zIndex, tabletZIndex, desktopZIndex,
            border, tabletBorder, desktopBorder,
            borderRadius, tabletBorderRadius, desktopBorderRadius,
            backgroundImage, backgroundColor, backgroundVideo,
            tabletBackgroundImage, tabletBackgroundColor, tabletBackgroundVideo,
            desktopBackgroundImage, desktopBackgroundColor, desktopBackgroundVideo,
            backgroundImageOpacity,
            backgroundSize, backgroundPosition, tabletBackgroundPosition, desktopBackgroundPosition, backgroundRepeat, backgroundFixedPosition,
            innerMaxWidth, tabletInnerMaxWidth, desktopInnerMaxWidth,
            contentHAlign, tabletContentHAlign, desktopContentHAlign,

            // Advanced Layout
            extendTop, extendBottom, translateX, translateY,
            tabExtendTop, tabExtendBottom, tabTranslateX, tabTranslateY,
            deskExtendTop, deskExtendBottom, deskTranslateX, deskTranslateY,

            // Entrance Animation
            entranceAnimation,
            entranceAnimationDirection,
        } = attributes,
        [activeTab, setActiveTab] = useState('mobile'),
        [parentLayoutClass, setParentLayoutClass] = useState<string>(''),
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

        activeBgVideo = (() => {
            if (parentLayoutClass === 'is-desktop-layout') {
                return desktopBackgroundVideo || tabletBackgroundVideo || backgroundVideo || '';
            }
            if (parentLayoutClass === 'is-tablet-layout') {
                return tabletBackgroundVideo || backgroundVideo || '';
            }
            return backgroundVideo || '';
        })(),

        activeBackgroundPosition = (() => {
            if (parentLayoutClass === 'is-desktop-layout') return desktopBackgroundPosition || tabletBackgroundPosition || backgroundPosition || 'center';
            if (parentLayoutClass === 'is-tablet-layout') return tabletBackgroundPosition || backgroundPosition || 'center';
            return backgroundPosition || 'center';
        })(),

        hasTabletZIndex = tabletZIndex !== undefined && (tabletZIndex as any) !== '',
        hasDesktopZIndex = desktopZIndex !== undefined && (desktopZIndex as any) !== '',

        hasTabletBorderRadius = hasBorderRadiusValue(tabletBorderRadius),
        hasDesktopBorderRadius = hasBorderRadiusValue(desktopBorderRadius),

        // Border Detection Logic
        hasTabletBorder = tabletBorder && (
            tabletBorder.width || tabletBorder.style || tabletBorder.color ||
            ['top', 'right', 'bottom', 'left'].some((side: string) => tabletBorder[side] && (tabletBorder[side].width || tabletBorder[side].style || tabletBorder[side].color))
        ),
        hasDesktopBorder = desktopBorder && (
            desktopBorder.width || desktopBorder.style || desktopBorder.color ||
            ['top', 'right', 'bottom', 'left'].some((side: string) => desktopBorder[side] && (desktopBorder[side].width || desktopBorder[side].style || desktopBorder[side].color))
        ),

        // CSS Variables for Padding
        cssPadMobile = getPaddingStr(mobilePadding, '10px'),
        cssPadTablet = hasTabletPadding ? getPaddingStr(tabletPadding, '10px') : 'var(--col-pad-mobile)',
        cssPadDesktop = hasDesktopPadding ? getPaddingStr(padding, '10px') : 'var(--col-pad-tablet)',

        // CSS Variables for Width — normalize so integer fractions (33, 66, 16…)
        // become repeating-decimal floats and three "33%" columns sum to 100%.
        valWidthMobile = normalizeColumnWidth(width) ?? 100,
        valWidthTablet = hasTabletWidth ? (normalizeColumnWidth(tabletWidth) ?? valWidthMobile) : valWidthMobile,
        valWidthDesktop = hasDesktopWidth ? (normalizeColumnWidth(desktopWidth) ?? valWidthTablet) : valWidthTablet,

        // CSS Variables for Backgrounds
        cssBgImageMobile = backgroundImage ? `url(${backgroundImage})` : 'none',
        cssBgImageTablet = hasTabletBgImage ? `url(${tabletBackgroundImage})` : 'var(--col-bg-image-mobile)',
        cssBgImageDesktop = hasDesktopBgImage ? `url(${desktopBackgroundImage})` : 'var(--col-bg-image-tablet)',

        cssBgColorMobile = backgroundColor || 'transparent',
        cssBgColorTablet = hasTabletBgColor ? tabletBackgroundColor : 'var(--col-bg-color-mobile)',
        cssBgColorDesktop = hasDesktopBgColor ? desktopBackgroundColor : 'var(--col-bg-color-tablet)',

        innerAlignMap: Record<string, string> = { left: 'flex-start', center: 'center', right: 'flex-end' },

        // Generate Border Variables
        borderVarsMobile = getBorderVars(border, 'mobile'),
        borderVarsTablet = getBorderVars(tabletBorder, 'tablet'),
        borderVarsDesktop = getBorderVars(desktopBorder, 'desktop'),

        entranceOffsetMap: Record<string, { x: string; y: string }> = {
            none: { x: '0px', y: '0px' },
            up: { x: '0px', y: '24px' },
            down: { x: '0px', y: '-24px' },
            left: { x: '24px', y: '0px' },
            right: { x: '-24px', y: '0px' },
        },
        entranceOffset = entranceOffsetMap[entranceAnimationDirection || 'up'] || entranceOffsetMap.up,
        hasAdvancedLayout =
            !!(extendTop || extendBottom || tabExtendTop || tabExtendBottom || deskExtendTop || deskExtendBottom ||
                translateX || translateY || tabTranslateX || tabTranslateY || deskTranslateX || deskTranslateY);

    const blockRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!blockRef.current) return;
        const wrapper = blockRef.current.closest<HTMLElement>(`.block-editor-block-list__block[data-type="${namespace}/column"]`);
        if (!wrapper) return;
        const columnsEl = wrapper.closest<HTMLElement>(`.wp-block-${namespace}-columns`);
        if (!columnsEl) return;

        const readLayoutClass = () => {
            if (columnsEl.classList.contains('is-desktop-layout')) return 'is-desktop-layout';
            if (columnsEl.classList.contains('is-tablet-layout')) return 'is-tablet-layout';
            if (columnsEl.classList.contains('is-mobile-layout')) return 'is-mobile-layout';
            return '';
        };

        setParentLayoutClass(readLayoutClass());
        const observer = new MutationObserver(() => setParentLayoutClass(readLayoutClass()));
        observer.observe(columnsEl, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!blockRef.current) return;
        const wrapper = blockRef.current.closest<HTMLElement>(`.block-editor-block-list__block[data-type="${namespace}/column"]`);
        if (!wrapper) return;
        const columnsEl = wrapper.closest<HTMLElement>(`.wp-block-${namespace}-columns`);

        const applyMargins = () => {
            const isMobile = columnsEl?.classList.contains('is-mobile-layout');
            const isTablet = columnsEl?.classList.contains('is-tablet-layout');

            let top: string, bottom: string;
            if (isMobile) {
                top    = extendTop    || '';
                bottom = extendBottom || '';
            } else if (isTablet) {
                top    = tabExtendTop    || extendTop    || '';
                bottom = tabExtendBottom || extendBottom || '';
            } else {
                top    = deskExtendTop    || tabExtendTop    || extendTop    || '';
                bottom = deskExtendBottom || tabExtendBottom || extendBottom || '';
            }

            if (top) {
                wrapper.style.setProperty('margin-top', `calc(${top} * -1)`, 'important');
            } else {
                wrapper.style.removeProperty('margin-top');
            }
            if (bottom) {
                wrapper.style.setProperty('margin-bottom', `calc(${bottom} * -1)`, 'important');
            } else {
                wrapper.style.removeProperty('margin-bottom');
            }
        };

        applyMargins();

        const observer = columnsEl
            ? new MutationObserver(applyMargins)
            : null;
        observer?.observe(columnsEl!, { attributes: true, attributeFilter: ['class'] });

        return () => {
            observer?.disconnect();
            wrapper.style.removeProperty('margin-top');
            wrapper.style.removeProperty('margin-bottom');
        };
    }, [extendTop, extendBottom, tabExtendTop, tabExtendBottom, deskExtendTop, deskExtendBottom]);

    // Pass ALL variables. The SCSS + ResizeObserver (in ColumnsExtraLogic) handles the actual toggling.
    const customStyles: Record<string, any> = {
        '--col-pad-desktop': cssPadDesktop,
        '--col-pad-tablet': cssPadTablet,
        '--col-pad-mobile': cssPadMobile,

        '--col-w-mobile': valWidthMobile,
        '--col-w-tablet': valWidthTablet,
        '--col-w-desktop': valWidthDesktop,

        '--col-valign-mobile': vAlign,
        '--col-valign-tablet': hasTabletVAlign ? tabletVAlign : 'var(--col-valign-mobile)',
        '--col-valign-desktop': hasDesktopVAlign ? desktopVAlign : 'var(--col-valign-tablet)',

        '--col-inner-max-mobile': innerMaxWidth || '100%',
        '--col-inner-max-tablet': hasTabletInnerMax ? tabletInnerMaxWidth : 'var(--col-inner-max-mobile)',
        '--col-inner-max-desktop': hasDesktopInnerMax ? desktopInnerMaxWidth : 'var(--col-inner-max-tablet)',

        '--col-halign-mobile': innerAlignMap[contentHAlign] || 'flex-start',
        '--col-halign-tablet': hasTabletHAlign ? innerAlignMap[tabletContentHAlign] : 'var(--col-halign-mobile)',
        '--col-halign-desktop': hasDesktopHAlign ? innerAlignMap[desktopContentHAlign] : 'var(--col-halign-tablet)',

        '--col-bg-image-mobile': cssBgImageMobile,
        '--col-bg-image-tablet': cssBgImageTablet,
        '--col-bg-image-desktop': cssBgImageDesktop,
        '--col-bg-color-mobile': cssBgColorMobile,
        '--col-bg-color-tablet': cssBgColorTablet,
        '--col-bg-color-desktop': cssBgColorDesktop,

        '--col-radius-mobile': borderRadiusToCss(borderRadius),
        ...(hasTabletBorderRadius && { '--col-radius-tablet': borderRadiusToCss(tabletBorderRadius) }),
        ...(hasDesktopBorderRadius && { '--col-radius-desktop': borderRadiusToCss(desktopBorderRadius) }),

        '--col-zindex-mobile': zIndex,
        ...(hasTabletZIndex && { '--col-zindex-tablet': tabletZIndex }),
        ...(hasDesktopZIndex && { '--col-zindex-desktop': desktopZIndex }),

        '--col-order-mobile': mobileOrder ?? 0,
        '--col-order-tablet': tabletOrder ?? 0,
        '--col-order-desktop': desktopOrder ?? 0,

        '--base-ext-top': extendTop || '0px',
        '--base-ext-bottom': extendBottom || '0px',
        '--base-trans-x': translateX || '0px',
        '--base-trans-y': translateY || '0px',

        '--tab-ext-top': tabExtendTop || 'var(--base-ext-top)',
        '--tab-ext-bottom': tabExtendBottom || 'var(--base-ext-bottom)',
        '--tab-trans-x': tabTranslateX || 'var(--base-trans-x)',
        '--tab-trans-y': tabTranslateY || 'var(--base-trans-y)',

        '--desk-ext-top': deskExtendTop || 'var(--tab-ext-top)',
        '--desk-ext-bottom': deskExtendBottom || 'var(--tab-ext-bottom)',
        '--desk-trans-x': deskTranslateX || 'var(--tab-trans-x)',
        '--desk-trans-y': deskTranslateY || 'var(--tab-trans-y)',

        '--col-enter-x': entranceOffset.x,
        '--col-enter-y': entranceOffset.y,

        ...borderVarsMobile,
        ...borderVarsTablet,
        ...borderVarsDesktop,

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

        borderRadius: 'var(--current-radius)',
        zIndex: 'var(--current-z-index)',
        order: 'var(--current-order)',
    };


    const blockProps = useBlockProps({
        ref: blockRef,
        id: normalizeHtmlId(htmlId) || undefined,
        className: [
            className,
            hasAdvancedLayout ? 'has-advanced-layout' : '',
            entranceAnimation ? 'has-entrance-animation is-entrance-visible' : '',
        ].filter(Boolean).join(' '),
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
                        <VersatileMessage
                            msg={__('Base layout values used for ALL screen sizes unless overridden.', namespace)}
                            type="warning"
                        />
                        <RangeControl
                            label={__('Width (%)', namespace)}
                            value={width}
                            onChange={(v) => setAttributes({width: normalizeColumnWidth(v) ?? 100})}
                            min={0} max={100}
                        />
                        <Divider />
                        <BoxControl
                            label={__('Padding', namespace)}
                            values={parsePadding(mobilePadding)}
                            onChange={(v) => setAttributes({mobilePadding: v as PaddingAttribute})}
                        />
                        <Divider />
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
                        <Divider />
                        <RangeControl
                            label={__('Flex Order', namespace)}
                            value={mobileOrder}
                            onChange={(v) => setAttributes({mobileOrder: v ?? 0})}
                            min={-10} max={10}
                            help={__('Change the display order. Lower numbers appear first.', namespace)}
                        />
                        <Divider />
                        <RangeControl
                            label={__('Z-Index', namespace)}
                            value={zIndex}
                            onChange={(v) => setAttributes({zIndex: v ?? 1})}
                            min={0} max={100}
                        />
                        <Divider />
                        <BorderBoxControl
                            label={__('Borders', namespace)}
                            colors={themeColors}
                            value={border}
                            onChange={(v) => setAttributes({ border: v })}
                        />
                        <Divider />
                        <BorderRadiusControl
                            values={borderRadius as any}
                            onChange={(v) => setAttributes({ borderRadius: v as any })}
                        />
                        <Divider />
                        <UnitControl
                            label={__('Inner Content Max Width', namespace)}
                            value={innerMaxWidth}
                            onChange={(v) => setAttributes({innerMaxWidth: v || ''})}
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
                        <Divider />
                        <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase' }}>{__('Background', namespace)}</p>
                        <ColorPalette
                            colors={themeColors}
                            value={backgroundColor}
                            onChange={(v) => setAttributes({backgroundColor: v || ''})}
                            clearable
                        />
                        <ControlsMedia
                            panelLabel={__('Background Image / Video', namespace)}
                            imageUrl={backgroundImage}
                            onSelectMedia={(media) => setAttributes({backgroundImage: media.url})}
                            onRemoveMedia={() => setAttributes({backgroundImage: ''})}
                            videoUrl={backgroundVideo}
                            onSelectVideo={(media) => setAttributes({backgroundVideo: media.url})}
                            onRemoveVideo={() => setAttributes({backgroundVideo: ''})}
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
                        <Divider />
                        <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase' }}>{__('Advanced Layout', namespace)}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <UnitControl label={__('Ext Top', namespace)} value={extendTop} onChange={(v) => setAttributes({extendTop: v || ''})} />
                            <UnitControl label={__('Ext Bottom', namespace)} value={extendBottom} onChange={(v) => setAttributes({extendBottom: v || ''})} />
                            <UnitControl label={__('Trans X', namespace)} value={translateX} onChange={(v) => setAttributes({translateX: v || ''})} />
                            <UnitControl label={__('Trans Y', namespace)} value={translateY} onChange={(v) => setAttributes({translateY: v || ''})} />
                        </div>
                    </div>
                );
            case 'tablet':
                return (
                    <div style={{ paddingTop: '16px' }}>
                        <VersatileMessage
                            msg={__(`Optional overrides for screens WIDER than ${tabletBreakpoint}px. If left blank, base layout values are used.`, namespace)}
                            type="warning"
                        />
                        <RangeControl
                            label={__('Width (%)', namespace)}
                            value={tabletWidth}
                            onChange={(v) => setAttributes({tabletWidth: normalizeColumnWidth(v)})}
                            min={0} max={100}
                            allowReset
                        />
                        <Divider />
                        <BoxControl
                            label={__('Padding', namespace)}
                            values={parsePadding(tabletPadding)}
                            onChange={(v) => setAttributes({tabletPadding: v as PaddingAttribute})}
                        />
                        <Divider />
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
                        <Divider />
                        <RangeControl
                            label={__('Flex Order', namespace)}
                            value={tabletOrder ?? 0}
                            onChange={(v) => setAttributes({tabletOrder: v ?? 0})}
                            min={-10} max={10}
                            help={__('Independent per breakpoint. Empty = 0.', namespace)}
                        />
                        <Divider />
                        <RangeControl
                            label={__('Z-Index', namespace)}
                            value={tabletZIndex}
                            onChange={(v) => setAttributes({tabletZIndex: v})}
                            min={0} max={100}
                            allowReset
                        />
                        <Divider />
                        <BorderBoxControl
                            label={__('Borders Override', namespace)}
                            colors={themeColors}
                            value={tabletBorder}
                            onChange={(v) => setAttributes({ tabletBorder: v })}
                        />
                        <Divider />
                        <BorderRadiusControl
                            values={tabletBorderRadius as any}
                            onChange={(v) => {
                                const isEmpty = !v || (typeof v === 'object' && !Object.values(v).some(x => !!x));
                                setAttributes({ tabletBorderRadius: isEmpty ? undefined : v as any });
                            }}
                        />
                        <Divider />
                        <UnitControl
                            label={__('Inner Content Max Width', namespace)}
                            value={tabletInnerMaxWidth}
                            onChange={(v) => setAttributes({tabletInnerMaxWidth: v || undefined})}
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
                        <Divider />
                        <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase' }}>{__('Background Override', namespace)}</p>
                        <ColorPalette
                            colors={themeColors}
                            value={tabletBackgroundColor}
                            onChange={(v) => setAttributes({tabletBackgroundColor: v || ''})}
                            clearable
                        />
                        <ControlsMedia
                            panelLabel={__('Background Image / Video Override', namespace)}
                            imageUrl={tabletBackgroundImage}
                            onSelectMedia={(media) => setAttributes({tabletBackgroundImage: media.url})}
                            onRemoveMedia={() => setAttributes({tabletBackgroundImage: ''})}
                            videoUrl={tabletBackgroundVideo}
                            onSelectVideo={(media) => setAttributes({tabletBackgroundVideo: media.url})}
                            onRemoveVideo={() => setAttributes({tabletBackgroundVideo: ''})}
                            opacity={backgroundImageOpacity}
                            onChangeOpacity={(val) => setAttributes({backgroundImageOpacity: val})}
                            backgroundSize={backgroundSize}
                            onChangeBackgroundSize={(val) => setAttributes({backgroundSize: val})}
                            backgroundPosition={tabletBackgroundPosition ?? backgroundPosition}
                            onChangeBackgroundPosition={(val) => setAttributes({tabletBackgroundPosition: val})}
                            backgroundRepeat={backgroundRepeat}
                            onChangeBackgroundRepeat={(val) => setAttributes({backgroundRepeat: val})}
                            parallax={backgroundFixedPosition}
                            onChangeParallax={(val) => setAttributes({backgroundFixedPosition: val})}
                        />
                        <Divider />
                        <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase' }}>{__('Advanced Layout', namespace)}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <UnitControl label={__('Ext Top', namespace)} value={tabExtendTop} onChange={(v) => setAttributes({tabExtendTop: v || ''})} />
                            <UnitControl label={__('Ext Bottom', namespace)} value={tabExtendBottom} onChange={(v) => setAttributes({tabExtendBottom: v || ''})} />
                            <UnitControl label={__('Trans X', namespace)} value={tabTranslateX} onChange={(v) => setAttributes({tabTranslateX: v || ''})} />
                            <UnitControl label={__('Trans Y', namespace)} value={tabTranslateY} onChange={(v) => setAttributes({tabTranslateY: v || ''})} />
                        </div>
                    </div>
                );
            case 'desktop':
                return (
                    <div style={{ paddingTop: '16px' }}>
                        <VersatileMessage
                            msg={__(`Optional overrides for screens WIDER than ${desktopBreakpoint}px. If left blank, base layout values are used.`, namespace)}
                            type="warning"
                        />
                        <RangeControl
                            label={__('Width (%)', namespace)}
                            value={desktopWidth}
                            onChange={(v) => setAttributes({desktopWidth: normalizeColumnWidth(v)})}
                            min={0} max={100}
                            allowReset
                        />
                        <Divider />
                        <BoxControl
                            label={__('Padding', namespace)}
                            values={parsePadding(padding)}
                            onChange={(v) => setAttributes({padding: v as PaddingAttribute})}
                        />
                        <Divider />
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
                        <Divider />
                        <RangeControl
                            label={__('Flex Order', namespace)}
                            value={desktopOrder ?? 0}
                            onChange={(v) => setAttributes({desktopOrder: v ?? 0})}
                            min={-10} max={10}
                            help={__('Independent per breakpoint. Empty = 0.', namespace)}
                        />
                        <Divider />
                        <RangeControl
                            label={__('Z-Index', namespace)}
                            value={desktopZIndex}
                            onChange={(v) => setAttributes({desktopZIndex: v})}
                            min={0} max={100}
                            allowReset
                        />
                        <Divider />
                        <BorderBoxControl
                            label={__('Borders Override', namespace)}
                            colors={themeColors}
                            value={desktopBorder}
                            onChange={(v) => setAttributes({ desktopBorder: v })}
                        />
                        <Divider />
                        <BorderRadiusControl
                            values={desktopBorderRadius as any}
                            onChange={(v) => {
                                const isEmpty = !v || (typeof v === 'object' && !Object.values(v).some(x => !!x));
                                setAttributes({ desktopBorderRadius: isEmpty ? undefined : v as any });
                            }}
                        />
                        <Divider />
                        <UnitControl
                            label={__('Inner Content Max Width', namespace)}
                            value={desktopInnerMaxWidth}
                            onChange={(v) => setAttributes({desktopInnerMaxWidth: v || undefined})}
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
                        <Divider />
                        <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase' }}>{__('Background Override', namespace)}</p>
                        <ColorPalette
                            colors={themeColors}
                            value={desktopBackgroundColor}
                            onChange={(v) => setAttributes({desktopBackgroundColor: v || ''})}
                            clearable
                        />
                        <ControlsMedia
                            panelLabel={__('Background Image / Video Override', namespace)}
                            imageUrl={desktopBackgroundImage}
                            onSelectMedia={(media) => setAttributes({desktopBackgroundImage: media.url})}
                            onRemoveMedia={() => setAttributes({desktopBackgroundImage: ''})}
                            videoUrl={desktopBackgroundVideo}
                            onSelectVideo={(media) => setAttributes({desktopBackgroundVideo: media.url})}
                            onRemoveVideo={() => setAttributes({desktopBackgroundVideo: ''})}
                            opacity={backgroundImageOpacity}
                            onChangeOpacity={(val) => setAttributes({backgroundImageOpacity: val})}
                            backgroundSize={backgroundSize}
                            onChangeBackgroundSize={(val) => setAttributes({backgroundSize: val})}
                            backgroundPosition={desktopBackgroundPosition ?? tabletBackgroundPosition ?? backgroundPosition}
                            onChangeBackgroundPosition={(val) => setAttributes({desktopBackgroundPosition: val})}
                            backgroundRepeat={backgroundRepeat}
                            onChangeBackgroundRepeat={(val) => setAttributes({backgroundRepeat: val})}
                            parallax={backgroundFixedPosition}
                            onChangeParallax={(val) => setAttributes({backgroundFixedPosition: val})}
                        />
                        <Divider />
                        <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase' }}>{__('Advanced Layout', namespace)}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <UnitControl label={__('Ext Top', namespace)} value={deskExtendTop} onChange={(v) => setAttributes({deskExtendTop: v || ''})} />
                            <UnitControl label={__('Ext Bottom', namespace)} value={deskExtendBottom} onChange={(v) => setAttributes({deskExtendBottom: v || ''})} />
                            <UnitControl label={__('Trans X', namespace)} value={deskTranslateX} onChange={(v) => setAttributes({deskTranslateX: v || ''})} />
                            <UnitControl label={__('Trans Y', namespace)} value={deskTranslateY} onChange={(v) => setAttributes({deskTranslateY: v || ''})} />
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
                <PanelBody title={__('Responsive Layout', namespace)}>
                    <TabPanel
                        className={`${namespace}-responsive-tabs`}
                        activeClass="is-active"
                        onSelect={(tabName) => setActiveTab(tabName as string)}
                        tabs={[
                            { name: 'mobile', title: __('Base', namespace), className: 'tab-mobile' },
                            { name: 'tablet', title: __('Tablet', namespace), className: 'tab-tablet' },
                            { name: 'desktop', title: __('Desktop', namespace), className: 'tab-desktop' },
                        ]}
                    >
                        {(tab) => renderLayoutTab(tab.name)}
                    </TabPanel>
                </PanelBody>

                <PanelBody title={__('Entrance Animation', namespace)} initialOpen={false}>
                    <ToggleControl
                        label={__('Fade In', namespace)}
                        checked={!!entranceAnimation}
                        onChange={(value) => setAttributes({entranceAnimation: value})}
                    />

                    {entranceAnimation && (
                        <SelectControl
                            label={__('Direction', namespace)}
                            value={entranceAnimationDirection || 'up'}
                            options={[
                                {label: __('Fade Only', namespace), value: 'none'},
                                {label: __('Up', namespace), value: 'up'},
                                {label: __('Down', namespace), value: 'down'},
                                {label: __('Left', namespace), value: 'left'},
                                {label: __('Right', namespace), value: 'right'},
                            ]}
                            onChange={(value) => setAttributes({entranceAnimationDirection: value})}
                        />
                    )}
                </PanelBody>

                <PanelBody title={__('HTML Attributes', namespace)} initialOpen={false}>
                    <TextControl
                        label={__('HTML ID', namespace)}
                        value={htmlId || ''}
                        onChange={(value) => setAttributes({htmlId: normalizeHtmlId(value)})}
                    />
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
                        backgroundPosition: activeBackgroundPosition,
                        backgroundRepeat: backgroundRepeat || 'no-repeat',
                        backgroundAttachment: backgroundFixedPosition ? 'fixed' : 'scroll',
                        opacity: (backgroundImageOpacity ?? 100) / 100,
                        pointerEvents: 'none',
                        zIndex: 0,
                    }}
                />

                {!!activeBgVideo && (
                    <video
                        key={activeBgVideo}
                        src={activeBgVideo}
                        autoPlay
                        muted
                        loop
                        playsInline
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center',
                            opacity: (backgroundImageOpacity ?? 100) / 100,
                            pointerEvents: 'none',
                            zIndex: 0,
                        }}
                    />
                )}

                <div
                    className={`${namespace}-column__content`}
                    style={{
                        position: 'relative',
                        zIndex: 1,
                        width: '100%',
                        minWidth: '0',
                        maxWidth: 'var(--current-inner-max)',
                        alignSelf: 'var(--current-halign)',
                        boxSizing: 'border-box'
                    }}
                >
                    <div {...innerBlocksProps} />
                </div>
            </div>
        </>
    );
}
