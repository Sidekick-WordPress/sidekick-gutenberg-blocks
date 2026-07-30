import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { BlockEditProps } from '@wordpress/blocks';

// Plugin
import namespace from '../../namespace';
import { ProductAttributeAttributes } from './attributes';

// There is no product `postId` in the site/template editor, so the value can't
// be resolved while editing. Show a static prefix + sample so the block reads
// clearly; the real value is produced by save.php inside the product loop.
export default function Edit(
    {
        attributes,
        setAttributes,
    }: BlockEditProps<ProductAttributeAttributes>) {
    const { attribute = 'pa_caliber', prefix = 'Cal: ', suffix = '' } = attributes;

    const blockProps = useBlockProps({ className: `${namespace}-product-attribute` });

    return (
        <span {...blockProps}>
            <InspectorControls>
                <PanelBody title={__('Product Attribute', namespace)}>
                    <TextControl
                        label={__('Attribute taxonomy', namespace)}
                        help={__('The attribute slug, e.g. pa_caliber.', namespace)}
                        value={attribute}
                        onChange={(value) => setAttributes({ attribute: value })}
                    />
                    <TextControl
                        label={__('Prefix', namespace)}
                        value={prefix}
                        onChange={(value) => setAttributes({ prefix: value })}
                    />
                    <TextControl
                        label={__('Suffix', namespace)}
                        value={suffix}
                        onChange={(value) => setAttributes({ suffix: value })}
                    />
                </PanelBody>
            </InspectorControls>
            {prefix}
            {__('value', namespace)}
            {suffix}
        </span>
    );
}
