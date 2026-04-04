import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    useInnerBlocksProps,
    InspectorControls
} from '@wordpress/block-editor';
import {
    PanelBody,
    RangeControl,
    SelectControl
} from '@wordpress/components';
import { BlockEditProps } from '@wordpress/blocks';
import type { CSSProperties } from 'react';

// Plugin
import namespace from '../../namespace';

// Block
import { NavMenuAttributes } from './attributes';

export default function Edit({
                                 attributes,
                                 setAttributes,
                                 className
                             }: BlockEditProps<NavMenuAttributes>) {
    const {
        orientation = 'horizontal',
        justifyContent = 'right',
        gap = 24,
        mobileGap = 12,
        desktopBreakpoint = 768,
    } = attributes;

    const justifyMap: Record<string, string> = {
        left: 'flex-start',
        center: 'center',
        right: 'flex-end',
        'space-between': 'space-between',
    };

    const blockProps = useBlockProps({
        className,
        style: {
            '--nav-gap-desktop': `${gap}px`,
            '--nav-gap-mobile': `${mobileGap}px`,
            '--nav-current-gap': 'var(--nav-gap-desktop)',
        } as CSSProperties
    });

    const innerBlocksProps = useInnerBlocksProps(
        {
            className: `${namespace}-nav-menu__inner`,
            style: {
                display: 'flex',
                flexDirection: orientation === 'vertical' ? 'column' : 'row',
                flexWrap: 'wrap',
                alignItems: orientation === 'vertical' ? 'stretch' : 'center',
                justifyContent: justifyMap[justifyContent] || 'flex-end',
                gap: 'var(--nav-current-gap)',
            } as CSSProperties,
        },
        {
            allowedBlocks: [`${namespace}/nav-item`],
            orientation: orientation === 'vertical' ? 'vertical' : 'horizontal',
            template: [
                [`${namespace}/nav-item`, { label: 'Home', url: '/' }],
                [`${namespace}/nav-item`, { label: 'About', url: '/about/' }],
                [`${namespace}/nav-item`, { label: 'Contact', url: '/contact/' }],
            ],
            templateLock: false,
        }
    );

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Menu Settings', namespace)}>
                    <SelectControl
                        label={__('Orientation', namespace)}
                        value={orientation}
                        options={[
                            { label: __('Horizontal', namespace), value: 'horizontal' },
                            { label: __('Vertical', namespace), value: 'vertical' },
                        ]}
                        onChange={(value) => setAttributes({ orientation: value as NavMenuAttributes['orientation'] })}
                    />

                    <SelectControl
                        label={__('Justify Content', namespace)}
                        value={justifyContent}
                        options={[
                            { label: __('Left', namespace), value: 'left' },
                            { label: __('Center', namespace), value: 'center' },
                            { label: __('Right', namespace), value: 'right' },
                            { label: __('Space Between', namespace), value: 'space-between' },
                        ]}
                        onChange={(value) => setAttributes({ justifyContent: value as NavMenuAttributes['justifyContent'] })}
                    />

                    <RangeControl
                        label={__('Desktop Gap', namespace)}
                        value={gap}
                        onChange={(value) => setAttributes({ gap: value ?? 24 })}
                        min={0}
                        max={120}
                    />

                    <RangeControl
                        label={__('Mobile Gap', namespace)}
                        value={mobileGap}
                        onChange={(value) => setAttributes({ mobileGap: value ?? 12 })}
                        min={0}
                        max={120}
                    />

                    <RangeControl
                        label={__('Desktop Breakpoint (px)', namespace)}
                        value={desktopBreakpoint}
                        onChange={(value) => setAttributes({ desktopBreakpoint: value ?? 768 })}
                        min={320}
                        max={1600}
                    />
                </PanelBody>
            </InspectorControls>

            <nav {...blockProps} aria-label={__('Custom navigation menu', namespace)}>
                <div {...innerBlocksProps} />
            </nav>
        </>
    );
}
