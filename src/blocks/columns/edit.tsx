import {__} from '@wordpress/i18n';
import {useBlockProps, useInnerBlocksProps, InspectorControls} from '@wordpress/block-editor';
import {useMemo, useState, useEffect} from '@wordpress/element';
import {
    PanelBody,
    RangeControl,
    __experimentalBoxControl as BoxControl,
    ColorPalette,
    SelectControl
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

export default function Edit({attributes, setAttributes, clientId, className}: BlockEditProps<CoreColumnsAttributes>) {
    const
        {
            columns,
            gap,
            padding,
            mobileGap,
            mobilePadding,
            desktopBreakpoint,
            backgroundImage,
            backgroundColor,
            backgroundImageOpacity,
            backgroundSize,
            backgroundPosition,
            backgroundRepeat,
            backgroundFixedPosition,
            desktopMaxWidth,
            mobileMaxWidth,
            horizontalAlignment,
            desktopMaxHeight,
            mobileMaxHeight
        } = attributes,
        {replaceInnerBlocks} = useDispatch('core/block-editor'),
        {getBlocks, themeColors, innerBlocks} = useSelect((select) => {
            const settings = select('core/block-editor').getSettings();
            return {
                getBlocks: select('core/block-editor').getBlocks,
                themeColors: settings.colors || [],
                innerBlocks: select('core/block-editor').getBlocks(clientId), // <--- Grab innerBlocks
            };
        }, [clientId]),
        [blockElement, setBlockElement] = useState<HTMLElement | null>(null),
        safePadding = parsePadding(padding),
        safeMobilePadding = parsePadding(mobilePadding),
        hasDesktopGap = gap !== undefined && (gap as any) !== '',
        hasDesktopMaxWidth = desktopMaxWidth !== undefined && desktopMaxWidth !== 0 && (desktopMaxWidth as any) !== '',
        hasDesktopPadding = padding && Object.values(padding).some(v => v !== undefined && v !== ''),
        hasDesktopMaxHeight = desktopMaxHeight !== undefined && desktopMaxHeight !== 0 && (desktopMaxHeight as any) !== '',
        cssGapMobile = mobileGap !== undefined ? `${mobileGap}px` : '0px',
        cssGapDesktop = hasDesktopGap ? `${gap}px` : 'var(--gap-mobile)',
        cssPadMobile = getPaddingStr(mobilePadding, '0px'),
        cssPadDesktop = hasDesktopPadding ? getPaddingStr(padding, '0px') : 'var(--pad-mobile)',
        cssMaxWidthMobile = (mobileMaxWidth === undefined || mobileMaxWidth === 0 || (mobileMaxWidth as any) === '') ? 'none' : `${mobileMaxWidth}px`,
        cssMaxWidthDesktop = hasDesktopMaxWidth ? `${desktopMaxWidth}px` : 'var(--max-width-mobile)',
        cssMaxHeightMobile = (mobileMaxHeight === undefined || mobileMaxHeight === 0 || (mobileMaxHeight as any) === '') ? 'none' : `${mobileMaxHeight}px`,
        cssMaxHeightDesktop = hasDesktopMaxHeight ? `${desktopMaxHeight}px` : 'var(--max-height-mobile)',
        innerMarginLeft = horizontalAlignment === 'left' ? '0' : 'auto',
        innerMarginRight = horizontalAlignment === 'right' ? '0' : 'auto',
        updateColumns = (newCount: number) => {
            const currentBlocks = getBlocks(clientId);
            const currentCount = currentBlocks.length;

            if (newCount > currentCount) {
                const toAdd = newCount - currentCount;

                // 1. Calculate how much width is explicitly claimed by other blocks
                const explicitWidth = currentBlocks.reduce((sum, block) => {
                    return sum + (Number(block.attributes.width) || 0);
                }, 0);

                // 2. Count how many blocks are currently sharing the auto-space
                const autoBlocksCount = currentBlocks.filter(b => !b.attributes.width).length;

                // 3. Figure out how much space is left
                const freeSpace = Math.max(0, 100 - explicitWidth);

                let newBlockWidth = 0;
                if (freeSpace > 0) {
                    // Divide the free space fairly among any existing auto blocks PLUS the new blocks
                    newBlockWidth = Math.floor(freeSpace / (autoBlocksCount + toAdd));
                }

                const newBlocks = Array.from({length: toAdd}, () =>
                    createBlock(`${namespace}/column` as string, { width: newBlockWidth })
                );

                replaceInnerBlocks(clientId, [...currentBlocks, ...newBlocks]);
            } else if (newCount < currentCount) {
                const newBlockList = currentBlocks.slice(0, newCount);
                replaceInnerBlocks(clientId, newBlockList);
            }

            // Still update the attribute for safety
            setAttributes({columns: newCount});
        },
        blockProps = useBlockProps({
            ref: setBlockElement,
            className,
            style: {
                '--gap-desktop': cssGapDesktop,
                '--gap-mobile': cssGapMobile,
                '--pad-desktop': cssPadDesktop,
                '--pad-mobile': cssPadMobile,
                '--max-width-desktop': cssMaxWidthDesktop,
                '--max-width-mobile': cssMaxWidthMobile,
                '--max-height-desktop': cssMaxHeightDesktop,
                '--max-height-mobile': cssMaxHeightMobile,

                // ExtraLogic will swap these based on breakpoint
                '--current-max-width': 'var(--max-width-desktop)',
                '--current-max-height': 'var(--max-height-desktop)',
                '--current-pad': 'var(--pad-desktop)',
                '--current-gap': 'var(--gap-desktop)',

                padding: 'var(--current-pad)',
                position: 'relative',
                // maxHeight: 'var(--current-max-height)',
                backgroundColor: backgroundColor || 'transparent',
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
                    justifyContent: 'space-between',
                    gap: 'var(--current-gap)',
                    position: 'relative',
                    zIndex: 1,
                    maxWidth: 'var(--current-max-width)',
                    marginLeft: innerMarginLeft,
                    marginRight: innerMarginRight
                } as CSSProperties
            },
            {
                allowedBlocks: [`${namespace}/column`],
                orientation: 'horizontal',
                template: template,
            }
        );

    useEffect(() => {
        if (innerBlocks && innerBlocks.length > 0 && innerBlocks.length !== columns) {
            setAttributes({ columns: innerBlocks.length });
        }
    }, [innerBlocks, columns, setAttributes]);

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Global Settings', namespace)}>
                    <RangeControl
                        label={__('Number of Columns', namespace)}
                        value={columns}
                        onChange={updateColumns}
                        min={1} max={8}
                    />

                    <RangeControl
                        label={__('Desktop Breakpoint (px)', namespace)}
                        value={desktopBreakpoint}
                        onChange={(v) => setAttributes({desktopBreakpoint: v})}
                        min={300} max={1200}
                    />

                    <SelectControl
                        label={__('Horizontal Alignment', namespace)}
                        value={horizontalAlignment as any}
                        options={[
                            {label: __('Left', namespace), value: 'left'},
                            {label: __('Center', namespace), value: 'center'},
                            {label: __('Right', namespace), value: 'right'}
                        ]}
                        onChange={(v) => setAttributes({horizontalAlignment: v})}
                        help={__('Aligns the inner columns when a Max Width is set.', namespace)}
                    />
                </PanelBody>

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

                <PanelBody title={__('Background Color', namespace)} initialOpen={false}>
                    <ColorPalette
                        colors={themeColors}
                        value={backgroundColor}
                        onChange={(v) => setAttributes({backgroundColor: v || ''})}
                        clearable={true}
                    />
                </PanelBody>

                <PanelBody title={__('Base Layout (All Screens)', namespace)} initialOpen={false}>
                    <RangeControl
                        label={__('Space Between Columns (px)', namespace)}
                        className={`${namespace}-custom-control`}
                        value={mobileGap}
                        onChange={(v) => setAttributes({mobileGap: v !== undefined ? v : 0})}
                        min={0} max={1200}
                        allowReset={true}
                    />

                    <BoxControl
                        label={__('Space Around Columns', namespace)}
                        className={`${namespace}-custom-control`}
                        values={safeMobilePadding}
                        onChange={(v) => {
                            const isReset = !v || Object.values(v).every(val => val === undefined || val === '');
                            setAttributes({
                                mobilePadding: isReset
                                    ? {top: '0px', right: '0px', bottom: '0px', left: '0px'}
                                    : v as PaddingAttribute
                            });
                        }}
                    />

                    <RangeControl
                        label={__('Inner Content Max Width (px)', namespace)}
                        className={`${namespace}-custom-control`}
                        value={mobileMaxWidth}
                        onChange={(v) => setAttributes({mobileMaxWidth: v})}
                        min={0} max={2000}
                        allowReset={true}
                        help={__('Set to 0 for full width', namespace)}
                    />

                    {/*<RangeControl*/}
                    {/*    label={__('Max Height (px)', namespace)}*/}
                    {/*    className={`${namespace}-custom-control`}*/}
                    {/*    value={mobileMaxHeight}*/}
                    {/*    onChange={(v) => setAttributes({ mobileMaxHeight: v !== undefined ? v : 0 })}*/}
                    {/*    min={0} max={2000}*/}
                    {/*    allowReset={true}*/}
                    {/*    help={__('Set to 0 for auto height', namespace)}*/}
                    {/*/>*/}
                </PanelBody>

                <PanelBody title={__('Desktop Layout (Overrides)', namespace)} initialOpen={false}>
                    <VersatileMessage
                        msg={`Optional overrides for screens WIDER than ${desktopBreakpoint}px. If left blank, base layout values are used.`}
                        type="warning" textAlign="center"/>

                    <RangeControl
                        label={__('Space Between Columns (px)', namespace)}
                        className={`${namespace}-custom-control`}
                        value={gap}
                        onChange={(v) => setAttributes({gap: v})}
                        min={0} max={1200}
                        allowReset={true}
                    />

                    <BoxControl
                        label={__('Space Around Columns', namespace)}
                        className={`${namespace}-custom-control`}
                        values={safePadding}
                        onChange={(v) => setAttributes({padding: v as PaddingAttribute})}
                    />

                    <RangeControl
                        label={__('Inner Content Max Width (px)', namespace)}
                        className={`${namespace}-custom-control`}
                        value={desktopMaxWidth}
                        onChange={(v) => setAttributes({desktopMaxWidth: v})}
                        min={0} max={2000}
                        allowReset={true}
                        help={__('Set to 0 to inherit from Base Layout', namespace)}
                    />

                    {/*<RangeControl*/}
                    {/*    label={__('Inner Content Max Height (px)', namespace)}*/}
                    {/*    className={`${namespace}-custom-control`}*/}
                    {/*    value={desktopMaxHeight}*/}
                    {/*    onChange={(v) => setAttributes({desktopMaxHeight: v})}*/}
                    {/*    min={0} max={2000}*/}
                    {/*    allowReset={true}*/}
                    {/*    help={__('Set to 0 to inherit from Base Layout', namespace)}*/}
                    {/*/>*/}
                </PanelBody>
            </InspectorControls>

            <div {...blockProps}>
                <ColumnsExtraLogic attributes={attributes} blockRef={blockElement}/>

                {backgroundImage && (
                    <div
                        className="u-full_cover_absolute"
                        style={{
                            position: 'absolute',
                            top: 0, right: 0, bottom: 0, left: 0,
                            backgroundImage: `url(${backgroundImage})`,
                            backgroundSize: backgroundSize || 'cover',
                            backgroundPosition: backgroundPosition || 'center',
                            backgroundRepeat: backgroundRepeat || 'no-repeat',
                            backgroundAttachment: backgroundFixedPosition ? 'fixed' : 'scroll',
                            opacity: (backgroundImageOpacity !== undefined ? backgroundImageOpacity : 100) / 100,
                            pointerEvents: 'none',
                            zIndex: 0
                        }}
                    />
                )}

                <div {...innerBlocksProps} />
            </div>
        </>
    );
}
