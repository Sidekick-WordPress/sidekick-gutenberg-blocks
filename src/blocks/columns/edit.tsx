import {__} from '@wordpress/i18n';
import {useBlockProps, useInnerBlocksProps, InspectorControls, BlockControls} from '@wordpress/block-editor';
import {useMemo, useState, useEffect, useCallback} from '@wordpress/element';
import {
    PanelBody,
    Button,
    BoxControl,
    ColorPalette,
    GradientPicker,
    SelectControl,
    RangeControl,
    TabPanel,
    TextControl,
    ToolbarGroup,
    ToolbarButton,
    __experimentalDivider as Divider,
    __experimentalUnitControl as UnitControl,
} from '@wordpress/components';
import {useSelect, useDispatch} from '@wordpress/data';
import {createBlock, BlockEditProps} from '@wordpress/blocks';
import type {CSSProperties} from 'react';

// Plugin
import namespace from '../../namespace';
import {getPaddingStr, parsePadding, normalizeColumnWidth} from "../../helpers/styles";
import {normalizeHtmlId} from "../../helpers/html";
import {PaddingAttribute} from "../../models/attr-shapes/padding-margin";
import VersatileMessage from "../../components/VersitileMessage";
import ControlsMedia from "../../components/edit-controls/ControlsMedia";

// Block
import {CoreColumnsAttributes} from './attributes';
import ColumnsExtraLogic from "./components/ColumnsExtraLogic";
import TierNote, {TIER_LABELS} from "./components/TierNote";

// Row-level splits applied to the EXISTING columns (tablet + desktop widths;
// base/mobile stays at each column's own value, typically 100 = stacked).
// Rendered 3-per-row in the inspector — keep labels compact.
const LAYOUT_PRESETS = [
    {label: '100', widths: [100]},
    {label: '50·50', widths: [50, 50]},
    {label: '33·33·33', widths: [33.333333, 33.333333, 33.333333]},
    {label: '33·67', widths: [33.333333, 66.666667]},
    {label: '67·33', widths: [66.666667, 33.333333]},
    {label: '25·50·25', widths: [25, 50, 25]},
    {label: '25·75', widths: [25, 75]},
    {label: '75·25', widths: [75, 25]},
    {label: '50·25·25', widths: [50, 25, 25]},
    {label: '25·25·50', widths: [25, 25, 50]},
    {label: '25×4', widths: [25, 25, 25, 25]},
    {label: '20×5', widths: [20, 20, 20, 20, 20]},
];

export default function Edit({attributes, setAttributes, clientId, className, isSelected}: BlockEditProps<CoreColumnsAttributes>) {
    const {
            htmlId,
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
            backgroundGradient,
            backgroundVideo,

            // Tablet Layout
            tabletGap,
            tabletPadding,
            tabletMaxWidth,
            tabletMaxHeight,
            tabletHorizontalAlignment,
            tabletBackgroundImage,
            tabletBackgroundColor,
            tabletBackgroundGradient,
            tabletBackgroundVideo,

            // Desktop Layout
            gap, // Desktop Gap
            padding, // Desktop Padding
            desktopMaxWidth,
            desktopMaxHeight,
            desktopHorizontalAlignment,
            desktopBackgroundImage,
            desktopBackgroundColor,
            desktopBackgroundGradient,
            desktopBackgroundVideo,

            backgroundImageOpacity,
            backgroundSize,
            backgroundPosition,
            tabletBackgroundPosition,
            desktopBackgroundPosition,
            backgroundRepeat,
            backgroundFixedPosition
        } = attributes,
        {replaceInnerBlocks, updateBlockAttributes, insertBlocks, removeBlocks, selectBlock} = useDispatch('core/block-editor'),
        {getBlocks, themeColors, themeGradients, innerBlocks, selectedId, selectedParents} = useSelect((select: any) => {
            const sel = select('core/block-editor');
            const settings = sel.getSettings();
            const selectedBlockId = sel.getSelectedBlockClientId();
            return {
                getBlocks: sel.getBlocks,
                themeColors: settings.colors || [],
                themeGradients: settings.gradients || [],
                innerBlocks: sel.getBlocks(clientId),
                selectedId: selectedBlockId,
                selectedParents: selectedBlockId ? sel.getBlockParents(selectedBlockId) : [],
            };
        }, [clientId]),
        [blockElement, setBlockElement] = useState<HTMLElement | null>(null),
        [layoutInfo, setLayoutInfo] = useState<{cls: string; width: number}>({cls: '', width: 0}),
        layoutClass = layoutInfo.cls,

        // Detection Logic
        hasTabletGap = tabletGap !== undefined && (tabletGap as any) !== '',
        hasTabletPadding = tabletPadding && Object.values(tabletPadding).some(v => v !== undefined && v !== ''),
        hasTabletMaxWidth = !!tabletMaxWidth,
        hasTabletMaxHeight = !!tabletMaxHeight,
        hasTabletHAlign = !!tabletHorizontalAlignment,
        hasTabletBgImage = !!tabletBackgroundImage,
        hasTabletBgColor = !!tabletBackgroundColor,
        hasTabletBgGradient = !!tabletBackgroundGradient,

        hasDesktopGap = gap !== undefined && (gap as any) !== '',
        hasDesktopPadding = padding && Object.values(padding).some(v => v !== undefined && v !== ''),
        hasDesktopMaxWidth = !!desktopMaxWidth,
        hasDesktopMaxHeight = !!desktopMaxHeight,
        hasDesktopHAlign = !!desktopHorizontalAlignment,
        hasDesktopBgImage = !!desktopBackgroundImage,
        hasDesktopBgColor = !!desktopBackgroundColor,
        hasDesktopBgGradient = !!desktopBackgroundGradient,

        // CSS Variables
        cssGapMobile = `${mobileGap || 0}px`,
        cssGapTablet = hasTabletGap ? `${tabletGap}px` : 'var(--gap-mobile)',
        cssGapDesktop = hasDesktopGap ? `${gap}px` : 'var(--gap-tablet)',

        cssPadMobile = getPaddingStr(mobilePadding, '0px'),
        cssPadTablet = hasTabletPadding ? getPaddingStr(tabletPadding, '0px') : 'var(--pad-mobile)',
        cssPadDesktop = hasDesktopPadding ? getPaddingStr(padding, '0px') : 'var(--pad-tablet)',

        cssMaxWidthMobile = mobileMaxWidth || 'none',
        cssMaxWidthTablet = hasTabletMaxWidth ? tabletMaxWidth : 'var(--max-width-mobile)',
        cssMaxWidthDesktop = hasDesktopMaxWidth ? desktopMaxWidth : 'var(--max-width-tablet)',

        cssMaxHeightMobile = mobileMaxHeight || 'none',
        cssMaxHeightTablet = hasTabletMaxHeight ? tabletMaxHeight : 'var(--max-height-mobile)',
        cssMaxHeightDesktop = hasDesktopMaxHeight ? desktopMaxHeight : 'var(--max-height-tablet)',

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

        cssBgGradientMobile = backgroundGradient || 'none',
        cssBgGradientTablet = hasTabletBgGradient ? tabletBackgroundGradient : 'var(--bg-gradient-mobile)',
        cssBgGradientDesktop = hasDesktopBgGradient ? desktopBackgroundGradient : 'var(--bg-gradient-tablet)',

        // Editor video preview: cascade based on active layout class
        activeBgVideo = (() => {
            if (layoutClass === 'is-desktop-layout') {
                return desktopBackgroundVideo || tabletBackgroundVideo || backgroundVideo || '';
            }
            if (layoutClass === 'is-tablet-layout') {
                return tabletBackgroundVideo || backgroundVideo || '';
            }
            return backgroundVideo || '';
        })(),

        activeBackgroundPosition = (() => {
            if (layoutClass === 'is-desktop-layout') return desktopBackgroundPosition || tabletBackgroundPosition || backgroundPosition || 'center';
            if (layoutClass === 'is-tablet-layout') return tabletBackgroundPosition || backgroundPosition || 'center';
            return backgroundPosition || 'center';
        })(),

        getMarginLeft = (align: string) => align === 'left' ? '0' : 'auto',
        getMarginRight = (align: string) => align === 'right' ? '0' : 'auto',

        addColumn = (width: number) => {
            const currentBlocks = getBlocks(clientId);
            const w = normalizeColumnWidth(width);
            const attrs: Record<string, number> = { width: 100 };
            // `w === 0` is a real value (Auto) — only skip when truly unset.
            if (w !== undefined) {
                attrs.tabletWidth = w;
                attrs.desktopWidth = w;
            }
            const newBlock = createBlock(`${namespace}/column`, attrs);
            replaceInnerBlocks(clientId, [...currentBlocks, newBlock], false);
            setAttributes({columns: currentBlocks.length + 1});
        },

        applyLayoutPreset = (widths: number[]) => {
            const blocks = getBlocks(clientId);
            const target = widths.length;
            const widthAt = (i: number) => widths[Math.min(i, widths.length - 1)];

            blocks.forEach((b: any, i: number) => {
                updateBlockAttributes(b.clientId, {tabletWidth: widthAt(i), desktopWidth: widthAt(i)});
            });

            if (blocks.length < target) {
                const added = [];
                for (let i = blocks.length; i < target; i++) {
                    added.push(createBlock(`${namespace}/column`, {width: 100, tabletWidth: widthAt(i), desktopWidth: widthAt(i)}));
                }
                insertBlocks(added, blocks.length, clientId, false);
            } else if (blocks.length > target) {
                // Trim trailing EMPTY columns down to the preset count — never delete content.
                const removable: string[] = [];
                for (let i = blocks.length - 1; i >= target; i--) {
                    if (!blocks[i].innerBlocks || blocks[i].innerBlocks.length === 0) {
                        removable.push(blocks[i].clientId);
                    } else {
                        break;
                    }
                }
                if (removable.length) removeBlocks(removable, false);
            }
        },

        removeColumn = (block: any) => {
            if ((innerBlocks?.length || 0) <= 1) return;
            if (block.innerBlocks?.length > 0 && !window.confirm(__('This column contains blocks. Remove it anyway?', namespace))) {
                return;
            }
            removeBlocks([block.clientId], false);
        },

        handleLayoutChange = useCallback((cls: string, width: number) => {
            setLayoutInfo(prev => (prev.cls === cls && prev.width === width) ? prev : {cls, width});
        }, []),

        blockProps = useBlockProps({
            ref: setBlockElement,
            id: normalizeHtmlId(htmlId) || undefined,
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
                '--bg-gradient-mobile': cssBgGradientMobile,
                '--bg-gradient-tablet': cssBgGradientTablet,
                '--bg-gradient-desktop': cssBgGradientDesktop,

                '--margin-l-desktop': getMarginLeft(cssHAlignDesktop),
                '--margin-r-desktop': getMarginRight(cssHAlignDesktop),
                '--margin-l-tablet': getMarginLeft(cssHAlignTablet),
                '--margin-r-tablet': getMarginRight(cssHAlignTablet),
                '--margin-l-mobile': getMarginLeft(cssHAlignMobile),
                '--margin-r-mobile': getMarginRight(cssHAlignMobile),

                padding: 'var(--current-pad)',
                maxHeight: 'var(--current-max-height)',
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

    const fmtColWidth = (w: number) => w === 0 ? __('Auto', namespace) : `${Math.round(w * 10) / 10}`;

    const renderColumnRow = (block: any, index: number) => {
        const m = normalizeColumnWidth(block.attributes?.width) ?? 100;
        const t = normalizeColumnWidth(block.attributes?.tabletWidth) ?? m;
        const d = normalizeColumnWidth(block.attributes?.desktopWidth) ?? t;
        const isActive = selectedId === block.clientId || selectedParents.includes(block.clientId);

        return (
            <div
                key={block.clientId}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '2px 2px 2px 8px',
                    marginBottom: '4px',
                    border: '1px solid',
                    borderRadius: '4px',
                    borderColor: isActive ? 'var(--wp-admin-theme-color, #3858e9)' : '#ddd',
                    background: isActive ? 'rgba(56, 88, 233, 0.04)' : 'transparent',
                }}
            >
                <Button
                    variant="link"
                    style={{textDecoration: 'none', flexShrink: 0}}
                    onClick={() => selectBlock(block.clientId)}
                >
                    {__('Column', namespace)} {index + 1}
                </Button>
                <span style={{flex: 1, textAlign: 'right', fontSize: '11px', color: '#757575'}}>
                    {fmtColWidth(m)} · {fmtColWidth(t)} · {fmtColWidth(d)}
                </span>
                <Button
                    size="small"
                    icon="no-alt"
                    label={__('Remove column', namespace)}
                    disabled={(innerBlocks?.length || 0) <= 1}
                    onClick={() => removeColumn(block)}
                />
            </div>
        );
    };

    const renderLayoutTab = (tabName: string) => {
        switch (tabName) {
            case 'mobile':
                return (
                    <div style={{ paddingTop: '16px' }}>
                        <VersatileMessage
                            msg={__('Base layout values used for ALL screen sizes unless overridden.', namespace)}
                            type="warning"
                        />
                        <TierNote tab="mobile" activeTier={layoutInfo.cls} width={layoutInfo.width} />
                        <RangeControl
                            label={__('Space Between Columns (px)', namespace)}
                            value={mobileGap}
                            onChange={(v) => setAttributes({mobileGap: v ?? 0})}
                            min={0} max={1200}
                        />
                        <Divider />
                        <BoxControl
                            label={__('Space Around Columns', namespace)}
                            values={parsePadding(mobilePadding)}
                            onChange={(v) => setAttributes({mobilePadding: v as PaddingAttribute})}
                        />
                        <Divider />
                        <UnitControl
                            label={__('Max Width', namespace)}
                            value={mobileMaxWidth}
                            onChange={(v) => setAttributes({mobileMaxWidth: v || ''})}
                        />
                        <UnitControl
                            label={__('Max Height', namespace)}
                            value={mobileMaxHeight}
                            onChange={(v) => setAttributes({mobileMaxHeight: v || ''})}
                        />
                        <Divider />
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

                        <Divider />
                        <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase' }}>{__('Background', namespace)}</p>
                        <ColorPalette
                            colors={themeColors}
                            value={backgroundColor}
                            onChange={(v) => setAttributes({backgroundColor: v || ''})}
                            clearable
                        />
                        <p style={{ margin: '12px 0 4px', fontSize: '11px' }}>{__('Gradient', namespace)}</p>
                        <GradientPicker
                            gradients={themeGradients}
                            value={backgroundGradient || undefined}
                            onChange={(v) => setAttributes({backgroundGradient: v || ''})}
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
                    </div>
                );
            case 'tablet':
                return (
                    <div style={{ paddingTop: '16px' }}>
                        <VersatileMessage
                            msg={__(`Optional overrides for screens WIDER than ${tabletBreakpoint}px. If left blank, base layout values are used.`, namespace)}
                            type="warning"
                        />
                        <TierNote tab="tablet" activeTier={layoutInfo.cls} width={layoutInfo.width} />
                        <RangeControl
                            label={__('Space Between Columns (px)', namespace)}
                            value={tabletGap}
                            onChange={(v) => setAttributes({tabletGap: v})}
                            min={0} max={1200}
                            allowReset
                        />
                        <Divider />
                        <BoxControl
                            label={__('Space Around Columns', namespace)}
                            values={parsePadding(tabletPadding)}
                            onChange={(v) => setAttributes({tabletPadding: v as PaddingAttribute})}
                        />
                        <Divider />
                        <UnitControl
                            label={__('Max Width', namespace)}
                            value={tabletMaxWidth}
                            onChange={(v) => setAttributes({tabletMaxWidth: v || undefined})}
                        />
                        <UnitControl
                            label={__('Max Height', namespace)}
                            value={tabletMaxHeight}
                            onChange={(v) => setAttributes({tabletMaxHeight: v || undefined})}
                        />
                        <Divider />
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

                        <Divider />
                        <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase' }}>{__('Background Override', namespace)}</p>
                        <ColorPalette
                            colors={themeColors}
                            value={tabletBackgroundColor}
                            onChange={(v) => setAttributes({tabletBackgroundColor: v || ''})}
                            clearable
                        />
                        <p style={{ margin: '12px 0 4px', fontSize: '11px' }}>{__('Gradient Override', namespace)}</p>
                        <GradientPicker
                            gradients={themeGradients}
                            value={tabletBackgroundGradient || undefined}
                            onChange={(v) => setAttributes({tabletBackgroundGradient: v || ''})}
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
                    </div>
                );
            case 'desktop':
                return (
                    <div style={{ paddingTop: '16px' }}>
                        <VersatileMessage
                            msg={__(`Optional overrides for screens WIDER than ${desktopBreakpoint}px. If left blank, base layout values are used.`, namespace)}
                            type="warning"
                        />
                        <TierNote tab="desktop" activeTier={layoutInfo.cls} width={layoutInfo.width} />
                        <RangeControl
                            label={__('Space Between Columns (px)', namespace)}
                            value={gap}
                            onChange={(v) => setAttributes({gap: v})}
                            min={0} max={1200}
                            allowReset
                        />
                        <Divider />
                        <BoxControl
                            label={__('Space Around Columns', namespace)}
                            values={parsePadding(padding)}
                            onChange={(v) => setAttributes({padding: v as PaddingAttribute})}
                        />
                        <Divider />
                        <UnitControl
                            label={__('Max Width', namespace)}
                            value={desktopMaxWidth}
                            onChange={(v) => setAttributes({desktopMaxWidth: v || undefined})}
                        />
                        <UnitControl
                            label={__('Max Height', namespace)}
                            value={desktopMaxHeight}
                            onChange={(v) => setAttributes({desktopMaxHeight: v || undefined})}
                        />
                        <Divider />
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

                        <Divider />
                        <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase' }}>{__('Background Override', namespace)}</p>
                        <ColorPalette
                            colors={themeColors}
                            value={desktopBackgroundColor}
                            onChange={(v) => setAttributes({desktopBackgroundColor: v || ''})}
                            clearable
                        />
                        <p style={{ margin: '12px 0 4px', fontSize: '11px' }}>{__('Gradient Override', namespace)}</p>
                        <GradientPicker
                            gradients={themeGradients}
                            value={desktopBackgroundGradient || undefined}
                            onChange={(v) => setAttributes({desktopBackgroundGradient: v || ''})}
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
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <BlockControls>
                <ToolbarGroup>
                    <ToolbarButton
                        icon="plus"
                        label={__('Add column', namespace)}
                        onClick={() => addColumn(0)}
                    />
                </ToolbarGroup>
            </BlockControls>

            <InspectorControls>
                <PanelBody title={__('Columns', namespace)}>
                    <div style={{marginBottom: '16px'}}>
                        <div style={{marginBottom: '8px', fontWeight: 500}}>
                            {__('Layout Presets', namespace)}
                        </div>
                        <div style={{margin: '0 0 8px', fontSize: '11px', color: '#757575'}}>
                            {__('Sets Tablet & Desktop widths on the existing columns; adds columns when needed. Mobile keeps stacking.', namespace)}
                        </div>

                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '6px'}}>
                            {LAYOUT_PRESETS.map((preset) => (
                                <Button
                                    key={preset.label}
                                    variant="secondary"
                                    style={{justifyContent: 'center', paddingLeft: '4px', paddingRight: '4px', fontSize: '12px'}}
                                    onClick={() => applyLayoutPreset(preset.widths)}
                                >
                                    {preset.label}
                                </Button>
                            ))}
                        </div>

                        <div style={{margin: '16px 0 4px', fontWeight: 500}}>
                            {__('Manage Columns', namespace)}
                        </div>
                        <div style={{margin: '0 0 8px', fontSize: '11px', color: '#757575'}}>
                            {__('Widths: Mobile · Tablet · Desktop. Click a name to select that column.', namespace)}
                        </div>

                        {innerBlocks?.map(renderColumnRow)}

                        <div style={{marginTop: '10px'}}>
                            <Button
                                variant="secondary"
                                icon="plus"
                                onClick={() => addColumn(0)}
                            >
                                {__('Add Column', namespace)}
                            </Button>
                        </div>
                    </div>

                    <Divider />

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

                <PanelBody title={__('HTML Attributes', namespace)} initialOpen={false}>
                    <TextControl
                        label={__('HTML ID', namespace)}
                        value={htmlId || ''}
                        onChange={(value) => setAttributes({htmlId: normalizeHtmlId(value)})}
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
                <ColumnsExtraLogic attributes={attributes} blockRef={blockElement} onLayoutChange={handleLayoutChange}/>

                {(isSelected || selectedParents.includes(clientId)) && layoutInfo.cls && (
                    <div className={`${namespace}-tier-badge`}>
                        {TIER_LABELS[layoutInfo.cls] || ''}{layoutInfo.width ? ` · ${layoutInfo.width}px` : ''}
                    </div>
                )}

                <div
                    className="u-full_cover_absolute"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: 'var(--current-bg-gradient, none), var(--current-bg-image)',
                        backgroundSize: backgroundSize || 'cover',
                        backgroundPosition: activeBackgroundPosition,
                        backgroundRepeat: backgroundRepeat || 'no-repeat',
                        backgroundAttachment: backgroundFixedPosition ? 'fixed' : 'scroll',
                        opacity: (backgroundImageOpacity !== undefined ? backgroundImageOpacity : 100) / 100,
                        pointerEvents: 'none',
                        zIndex: 0
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
                            opacity: (backgroundImageOpacity !== undefined ? backgroundImageOpacity : 100) / 100,
                            pointerEvents: 'none',
                            zIndex: 0,
                        }}
                    />
                )}

                <div {...innerBlocksProps} />
            </div>
        </>
    );
}
