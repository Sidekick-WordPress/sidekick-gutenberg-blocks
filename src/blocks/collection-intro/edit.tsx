import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, RangeControl } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-render';
import { BlockEditProps } from '@wordpress/blocks';

// Plugin
import namespace from '../../namespace';
import { CollectionIntroAttributes } from './attributes';
import metadata from './block.json';

// Shared className stamped on the inspector panel so the light editor polish in
// _edit.scss can target it without leaking onto other blocks' sidebars.
const PANEL_CLASS = `${namespace}-inspector-panel`;

export default function Edit(
    {
        attributes,
        setAttributes,
    }: BlockEditProps<CollectionIntroAttributes>) {
    const { headingLevel = 2 } = attributes;

    const blockProps = useBlockProps();

    return (
        <div {...blockProps}>
            <InspectorControls>
                <PanelBody className={PANEL_CLASS} title={__('Intro', namespace)}>
                    <RangeControl
                        label={__('Headline Level', namespace)}
                        help={__('Heading tag used for the collection headline (h1–h6).', namespace)}
                        value={headingLevel}
                        onChange={(value) => setAttributes({ headingLevel: value ?? 2 })}
                        min={1}
                        max={6}
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
