import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, RangeControl, SelectControl } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-render';
import { BlockEditProps } from '@wordpress/blocks';

// Plugin
import namespace from '../../namespace';
import { CollectionHeroAttributes } from './attributes';
import metadata from './block.json';

export default function Edit(
    {
        attributes,
        setAttributes,
    }: BlockEditProps<CollectionHeroAttributes>) {
    const {
        minHeight = 340,
        titleAlign = 'right',
    } = attributes;

    const blockProps = useBlockProps();

    return (
        <div {...blockProps}>
            <InspectorControls>
                <PanelBody title={__('Hero', namespace)}>
                    <RangeControl
                        label={__('Minimum Height (px)', namespace)}
                        help={__('Overall height of the hero band.', namespace)}
                        value={minHeight}
                        onChange={(value) => setAttributes({ minHeight: value ?? 340 })}
                        min={100}
                        max={720}
                    />
                    <SelectControl
                        label={__('Title Alignment', namespace)}
                        help={__('Which edge the category title aligns to.', namespace)}
                        value={titleAlign}
                        options={[
                            { label: __('Left', namespace), value: 'left' },
                            { label: __('Right', namespace), value: 'right' },
                        ]}
                        onChange={(value) =>
                            setAttributes({
                                titleAlign: value as CollectionHeroAttributes['titleAlign'],
                            })
                        }
                    />
                </PanelBody>
            </InspectorControls>

            <ServerSideRender
                block={metadata.name}
                attributes={attributes}
            />
        </div>
    );
}
