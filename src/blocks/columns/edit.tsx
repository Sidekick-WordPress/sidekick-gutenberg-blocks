import {__} from '@wordpress/i18n';
import {useBlockProps, useInnerBlocksProps, InspectorControls} from '@wordpress/block-editor';
import {useMemo, useState, useEffect} from '@wordpress/element';
import {
    PanelBody,
    Button,
    BoxControl,
    ColorPalette,
    SelectControl,
    RangeControl,
    TabPanel
} from '@wordpress/components';
import {useSelect, useDispatch} from '@wordpress/data';
import {createBlock, BlockEditProps} from '@wordpress/blocks';
import type {CSSProperties} from 'react';

// Plugin
import namespace from '../../namespace';
import {getPaddingStr, parsePadding} from "../../helpers/styles";
import {PaddingAttribute} from "../../models/attr-shapes/padding-margin";
import VersatileMessage from "../../components/VersitileMessage";
import ControlsMedia from "../../components/edit-controls/ControlsMedia";

// Block
import {CoreColumnsAttributes} from './attributes';
import ColumnsExtraLogic from "./components/ColumnsExtraLogic";

const COLUMN_PRESETS = [
    {label: __('Auto', namespace), width: 0},
    {label: '1/6', width: 16.666667},
    {label: '1/5', width: 20},
    {label: '1/4', width: 25},
    {label: '1/3', width: 33.333333},
    {label: '2/5', width: 40},
    {label: '1/2', width: 50},
    {label: '3/5', width: 60},
    {label: '2/3', width: 66.666667},
    {label: '3/4', width: 75},
    {label: '4/5', width: 80},
    {label: '5/6', width: 83.333333},
    {label: '1/1', width: 100},
];

export default function Edit({attributes, setAttributes, clientId, className}: BlockEditProps<CoreColumnsAttributes>) {
    const {
            columns,
            tabletBreakpoint,
            desktopBreakpoint,

            // Base Layout
            mobileGap,
            mobilePadding,
            mobileMaxWidth,
            mobileMaxHeight,
            horizontalAlignment,
            backgroundImage,
            backgroundColor,

            // Tablet Layout
            tabletGap,
            tabletPadding,
            tabletMaxWidth,
            tabletMaxHeight,
            tabletHorizontalAlignment,
            tabletBackgroundImage,
            tabletBackgroundColor,

            // Desktop Layout
            gap, // Desktop Gap
            padding, // Desktop Padding
            desktopMaxWidth,
            desktopMaxHeight,
            desktopHorizontalAlignment,
            desktopBackgroundImage,
            desktopBackgroundColor,

            backgroundImageOpacity,
            backgroundSize,
            backgroundPosition,
            backgroundRepeat,
            backgroundFixedPosition
        } = attributes,
        {replaceInnerBlocks} = useDispatch('core/block-editor'),
        {getBlocks, themeColors, innerBlocks} = useSelect((select: any) => {
            const settings = select('core/block-editor').getSettings();
            return {
                getBlocks: select('core/block-editor').getBlocks,
                themeColors: settings.colors || [],
                innerBlocks: select('core/block-editor').getBlocks(clientId),
            };
        }, [clientId]),
        [blockElement, setBlockElement] = useState<HTMLElement | null>(null),
        [layoutClass, setLayoutClass] = useState(''),

        // Detection Logic
        hasTabletGap = tabletGap !== undefined && (tabletGap as any) !== '',
        hasTabletPadding = tabletPadding && Object.values(tabletPadding).some(v => v !== undefined && v !== ''),
        hasTabletMaxWidth = tabletMaxWidth !== undefined && tabletMaxWidth !== 0 && (tabletMaxWidth as any) !== '',
        hasTabletMaxHeight = tabletMaxHeight !== undefined && tabletMaxHeight !== 0 && (tabletMaxHeight as any) !== '',
        hasTabletHAlign = !!tabletHorizontalAlignment,
        hasTabletBgImage = !!tabletBackgroundImage,
        hasTabletBgColor = !!tabletBackgroundColor,

        hasDesktopGap = gap !== undefined && (gap as any) !== '',
        hasDesktopPadding = padding && Object.values(padding).some(v => v !== undefined && v !== ''),
        hasDesktopMaxWidth = desktopMaxWidth !== undefined && desktopMaxWidth !== 0 && (desktopMaxWidth as any) !== '',
        hasDesktopMaxHeight = desktopMaxHeight !== undefined && desktopMaxHeight !== 0 && (desktopMaxHeight as any) !== '',
        hasDesktopHAlign = !!desktopHorizontalAlignment,
        hasDesktopBgImage = !!desktopBackgroundImage,
        hasDesktopBgColor = !!desktopBackgroundColor,

        // CSS Variables
        cssGapMobile = `${mobileGap || 0}px`,
        cssGapTablet = hasTabletGap ? `${tabletGap}px` : 'var(--gap-mobile)',
        cssGapDesktop = hasDesktopGap ? `${gap}px` : 'var(--gap-tablet)',

        cssPadMobile = getPaddingStr(mobilePadding, '0px'),
        cssPadTablet = hasTabletPadding ? getPaddingStr(tabletPadding, '0px') : 'var(--pad-mobile)',
        cssPadDesktop = hasDesktopPadding ? getPaddingStr(padding, '0px') : 'var(--pad-tablet)',

        cssMaxWidthMobile = !mobileMaxWidth ? 'none' : `${mobileMaxWidth}px`,
        cssMaxWidthTablet = hasTabletMaxWidth ? `${tabletMaxWidth}px` : 'var(--max-width-mobile)',
        cssMaxWidthDesktop = hasDesktopMaxWidth ? `${desktopMaxWidth}px` : 'var(--max-width-tablet)',

        cssMaxHeightMobile = !mobileMaxHeight ? 'none' : `${mobileMaxHeight}px`,
        cssMaxHeightTablet = hasTabletMaxHeight ? `${tabletMaxHeight}px` : 'var(--max-height-mobile)',
        cssMaxHeightDesktop = hasDesktopMaxHeight ? `${desktopMaxHeight}px` : 'var(--max-height-tablet)',

        cssHAlignMobile = horizontalAlignment,
        cssHAlignTablet = hasTabletHAlign ? tabletHorizontalAlignment : 'var(--h-align-mobile)',
        cssHAlignDesktop = hasDesktopHAlign ? desktopHorizontalAlignment : 'var(--h-align-tablet)',

        // Responsive Backgrounds
        cssBgImageMobile = backgroundImage ? `url(${backgroundImage})` : 'none',
        cssBgImageTablet = hasTabletBgImage ? `url(${tabletBackgroundImage})` : 'var(--bg-image-mobile)',
        cssBgImageDesktop = hasDesktopBgImage ? `url(${desktopBackgroundImage})` : 'var(--bg-image-tablet)',

        cssBgColorMobile = backgroundColor || 'transparent',
        cssBgColorTablet = hasTabletBgColor ? tabletBackgroundColor : 'var(--bg-color-mobile)',
        cssBgColorDesktop = hasDesktopBgColor ? desktopBackgroundColor : 'var(--bg-color-tablet)',

        getMarginLeft = (align: string) => align === 'left' ? '0' : 'auto',
        getMarginRight = (align: string) => align === 'right' ? '0' : 'auto',

        addColumn = (width: number) => {
            const currentBlocks = getBlocks(clientId);
            const newBlock = createBlock(`${namespace}/column`, {
                width: width || 100
            });
            replaceInnerBlocks(clientId, [...currentBlocks, newBlock], false);
            setAttributes({columns: currentBlocks.length + 1});
        },

        removeLastColumn = () => {
            const currentBlocks = getBlocks(clientId);
            if (currentBlocks.length <= 1) return;

            replaceInnerBlocks(clientId, currentBlocks.slice(0, -1), false);
            setAttributes({columns: currentBlocks.length - 1});
        },

        blockProps = useBlockProps({
            ref: setBlockElement,
            className: [className, layoutClass].filter(Boolean).join(' '),
            style: {
                '--gap-desktop': cssGapDesktop,
                '--gap-tablet': cssGapTablet,
                '--gap-mobile': cssGapMobile,
                '--pad-desktop': cssPadDesktop,
                '--pad-tablet': cssPadTablet,
                '--pad-mobile': cssPadMobile,
                '--max-width-desktop': cssMaxWidthDesktop,
                '--max-width-tablet': cssMaxWidthTablet,
                '--max-width-mobile': cssMaxWidthMobile,
                '--max-height-desktop': cssMaxHeightDesktop,
                '--max-height-tablet': cssMaxHeightTablet,
                '--max-height-mobile': cssMaxHeightMobile,

                '--h-align-desktop': cssHAlignDesktop,
                '--h-align-tablet': cssHAlignTablet,
                '--h-align-mobile': cssHAlignMobile,

                '--bg-image-mobile': cssBgImageMobile,
                '--bg-image-tablet': cssBgImageTablet,
                '--bg-image-desktop': cssBgImageDesktop,
                '--bg-color-mobile': cssBgColorMobile,
                '--bg-color-tablet': cssBgColorTablet,
                '--bg-color-desktop': cssBgColorDesktop,

                '--margin-l-desktop': getMarginLeft(cssHAlignDesktop),
                '--margin-r-desktop': getMarginRight(cssHAlignDesktop),
                '--margin-l-tablet': getMarginLeft(cssHAlignTablet),
                '--margin-r-tablet': getMarginRight(cssHAlignTablet),
                '--margin-l-mobile': getMarginLeft(cssHAlignMobile),
                '--margin-r-mobile': getMarginRight(cssHAlignMobile),

                padding: 'var(--current-pad)',
                position: 'relative',
                backgroundColor: 'var(--current-bg-color)',
            } as CSSProperties
        }),
        template = useMemo(() => {
            return Array(columns).fill(0).map(() => [
                `${namespace}/column`,
                {}
            ]) as any;
        }, [columns]),
        innerBlocksProps = useInnerBlocksProps(
            {
                className: `${namespace}-columns-inner`,
                style: {
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'flex-start',
                    alignItems: 'stretch',
                    gap: 'var(--current-gap)',
                    position: 'relative',
                    zIndex: 1,
                    width: '100%',
                    maxWidth: 'var(--current-max-width)',
                    marginLeft: 'var(--current-margin-left)',
                    marginRight: 'var(--current-margin-right)',
                    boxSizing: 'border-box',
                } as CSSProperties
            },
            {
                allowedBlocks: [`${namespace}/column`],
                orientation: 'horizontal',
                template,
            }
        );

    useEffect(() => {
        if (innerBlocks && innerBlocks.length !== columns) {
            setAttributes({columns: innerBlocks.length});
        }
    }, [innerBlocks, columns, setAttributes]);

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
                            label={__('Space Between Columns (px)', namespace)}
                            value={mobileGap}
                            onChange={(v) => setAttributes({mobileGap: v ?? 0})}
                            min={0} max={1200}
                        />
                        <BoxControl
                            label={__('Space Around Columns', namespace)}
                            values={parsePadding(mobilePadding)}
                            onChange={(v) => setAttributes({mobilePadding: v as PaddingAttribute})}
                        />
                        <RangeControl
                            label={__('Inner Content Max Width (px)', namespace)}
                            value={mobileMaxWidth}
                            onChange={(v) => setAttributes({mobileMaxWidth: v})}
                            min={0} max={2000}
                            help={__('0 for full width', namespace)}
                        />
                        <RangeControl
                            label={__('Inner Content Max Height (px)', namespace)}
                            value={mobileMaxHeight}
                            onChange={(v) => setAttributes({mobileMaxHeight: v})}
                            min={0} max={2000}
                        />
                        <SelectControl
                            label={__('Horizontal Alignment', namespace)}
                            value={horizontalAlignment}
                            options={[
                                {label: __('Left', namespace), value: 'left'},
                                {label: __('Center', namespace), value: 'center'},
                                {label: __('Right', namespace), value: 'right'}
                            ]}
                            onChange={(v) => setAttributes({horizontalAlignment: v})}
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
                            label={__('Space Between Columns (px)', namespace)}
                            value={tabletGap}
                            onChange={(v) => setAttributes({tabletGap: v})}
                            min={0} max={1200}
                            allowReset
                        />
                        <BoxControl
                            label={__('Space Around Columns', namespace)}
                            values={parsePadding(tabletPadding)}
                            onChange={(v) => setAttributes({tabletPadding: v as PaddingAttribute})}
                        />
                        <RangeControl
                            label={__('Inner Content Max Width (px)', namespace)}
                            value={tabletMaxWidth}
                            onChange={(v) => setAttributes({tabletMaxWidth: v})}
                            min={0} max={2000}
                            allowReset
                        />
                        <RangeControl
                            label={__('Inner Content Max Height (px)', namespace)}
                            value={tabletMaxHeight}
                            onChange={(v) => setAttributes({tabletMaxHeight: v})}
                            min={0} max={2000}
                            allowReset
                        />
                        <SelectControl
                            label={__('Horizontal Alignment', namespace)}
                            value={tabletHorizontalAlignment}
                            options={[
                                {label: __('Inherit', namespace), value: ''},
                                {label: __('Left', namespace), value: 'left'},
                                {label: __('Center', namespace), value: 'center'},
                                {label: __('Right', namespace), value: 'right'}
                            ]}
                            onChange={(v) => setAttributes({tabletHorizontalAlignment: v})}
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
                            // Use same opacity/settings for now as they are shared
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
                            label={__('Space Between Columns (px)', namespace)}
                            value={gap}
                            onChange={(v) => setAttributes({gap: v})}
                            min={0} max={1200}
                            allowReset
                        />
                        <BoxControl
                            label={__('Space Around Columns', namespace)}
                            values={parsePadding(padding)}
                            onChange={(v) => setAttributes({padding: v as PaddingAttribute})}
                        />
                        <RangeControl
                            label={__('Inner Content Max Width (px)', namespace)}
                            value={desktopMaxWidth}
                            onChange={(v) => setAttributes({desktopMaxWidth: v})}
                            min={0} max={2000}
                            allowReset
                        />
                        <RangeControl
                            label={__('Inner Content Max Height (px)', namespace)}
                            value={desktopMaxHeight}
                            onChange={(v) => setAttributes({desktopMaxHeight: v})}
                            min={0} max={2000}
                            allowReset
                        />
                        <SelectControl
                            label={__('Horizontal Alignment', namespace)}
                            value={desktopHorizontalAlignment}
                            options={[
                                {label: __('Inherit', namespace), value: ''},
                                {label: __('Left', namespace), value: 'left'},
                                {label: __('Center', namespace), value: 'center'},
                                {label: __('Right', namespace), value: 'right'}
                            ]}
                            onChange={(v) => setAttributes({desktopHorizontalAlignment: v})}
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
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Global Settings', namespace)}>
                    <div style={{marginBottom: '16px'}}>
                        <div style={{marginBottom: '8px', fontWeight: 500}}>
                            {__('Add Column Presets', namespace)}
                        </div>

                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '8px'}}>
                            {COLUMN_PRESETS.map((preset) => (
                                <Button
                                    key={`${preset.label}-${preset.width}`}
                                    variant="secondary"
                                    onClick={() => addColumn(preset.width)}
                                >
                                    {preset.label}
                                </Button>
                            ))}
                        </div>

                        <div style={{marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                            <Button
                                variant="tertiary"
                                onClick={() => addColumn(0)}
                            >
                                {__('Add Auto Column', namespace)}
                            </Button>

                            <Button
                                variant="tertiary"
                                onClick={removeLastColumn}
                                disabled={(innerBlocks?.length || 0) <= 1}
                            >
                                {__('Remove Last Column', namespace)}
                            </Button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <RangeControl
                            label={__('Tablet BP', namespace)}
                            value={tabletBreakpoint}
                            onChange={(v) => {
                                const val = v ?? 768;
                                setAttributes({ 
                                    tabletBreakpoint: val,
                                    desktopBreakpoint: Math.max(val + 1, desktopBreakpoint)
                                });
                            }}
                            min={300} max={1500}
                        />
                        <RangeControl
                            label={__('Desktop BP', namespace)}
                            value={desktopBreakpoint}
                            onChange={(v) => {
                                const val = v ?? 1024;
                                setAttributes({ 
                                    desktopBreakpoint: val,
                                    tabletBreakpoint: Math.min(val - 1, tabletBreakpoint)
                                });
                            }}
                            min={300} max={2500}
                        />
                    </div>
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
                <ColumnsExtraLogic attributes={attributes} blockRef={blockElement} onLayoutChange={setLayoutClass}/>

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
                        opacity: (backgroundImageOpacity !== undefined ? backgroundImageOpacity : 100) / 100,
                        pointerEvents: 'none',
                        zIndex: 0
                    }}
                />

                <div {...innerBlocksProps} />
            </div>
        </>
    );
}
