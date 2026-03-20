import {__} from '@wordpress/i18n';
import {useBlockProps, useInnerBlocksProps, InspectorControls} from '@wordpress/block-editor';
import {
    PanelBody,
    SelectControl,
    __experimentalBoxControl as BoxControl,
    RangeControl
} from '@wordpress/components';
import {BlockEditProps} from '@wordpress/blocks';
import type {CSSProperties} from 'react';

// Plugin
import namespace from '../../../namespace';
import {getPaddingStr, parsePadding} from "../../../helpers/styles";
import {PaddingAttribute} from "../../../models/attr-shapes/padding-margin";

// Block
import {ColumnAttributes} from './attributes';
import VersatileMessage from "../../../components/VersitileMessage";

export default function Edit({attributes, setAttributes, className, context}: BlockEditProps<ColumnAttributes>) {
    const {
            width, // Destructure width
            padding,
            mobilePadding,
            vAlign,
            mobileOrder
        } = attributes,
        desktopBreakpoint = context[`${namespace}/desktopBreakpoint`],
        safePadding = parsePadding(padding),
        safeMobilePadding = parsePadding(mobilePadding),
        hasDesktopPadding = padding && Object.values(padding).some(v => v !== undefined && v !== ''),
        cssPadMobile = getPaddingStr(mobilePadding, '10px'),
        cssPadDesktop = hasDesktopPadding ? getPaddingStr(padding, '10px') : 'var(--col-pad-mobile)',
        preciseWidth = (() => {
            const map: Record<number, number> = {
                16: 16.666667, // 1/6
                17: 16.666667, // 1/6 rounded up
                33: 33.333333, // 1/3
                66: 66.666667, // 2/3
                67: 66.666667, // 2/3 rounded up
                83: 83.333333, // 5/6
            };
            return map[width] !== undefined ? map[width] : width;
        })(),
        isAuto = width === undefined || width === 0,
        computedWidth = isAuto ? undefined : `calc(${preciseWidth}% - (var(--current-gap) * (100 - ${preciseWidth}) / 100))`,
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
                width: computedWidth,
                flex: isAuto ? '1 1 0%' : '0 0 auto',
            } as CSSProperties
        }),
        innerBlocksProps = useInnerBlocksProps({
            style: {width: '100%'}
        });

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Column Settings', namespace)}>
                    <RangeControl
                        label={__('Width (%)', namespace)}
                        value={width}
                        onChange={(v) => setAttributes({ width: v !== undefined ? v : 0 })}
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
                </PanelBody>

                <PanelBody title={__('Base Layout (All Screens)', namespace)} initialOpen={false}>
                    <BoxControl
                        label={__('Column Padding', namespace)}
                        values={safeMobilePadding}
                        onChange={(v) => {
                            // Catch null, undefined, empty objects, or objects full of empty strings/undefined
                            const isReset = !v || Object.keys(v).length === 0 || Object.values(v).every(val => !val);

                            if (isReset) {
                                // Forcefully inject strict 0px values to prevent fallback to 10px default
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
                        onChange={(v) => setAttributes({ mobileOrder: v !== undefined ? v : 0 })}
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
                            // For overrides, we actually WANT it to evaluate to undefined so it inherits from base
                            const isReset = !v || Object.keys(v).length === 0 || Object.values(v).every(val => !val);
                            setAttributes({
                                padding: isReset ? undefined : v as PaddingAttribute
                            });
                        }}
                    />
                </PanelBody>
            </InspectorControls>

            <div {...blockProps}>
                <div {...innerBlocksProps} />
            </div>
        </>
    );
}
