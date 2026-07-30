import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';

// Plugin
import namespace from '../../namespace';
import { ColorSwatchesAttributes } from './attributes';

// There is no product `postId` in the site/template editor, so the
// server-rendered swatches would come back empty. Instead of a blank
// ServerSideRender, show a small static placeholder (a few grey dots) plus a
// short note so editors understand the block renders per product on the front
// end. Real swatches are produced by save.php inside the product-collection loop.
const PLACEHOLDER_DOTS = ['#d9c7b8', '#8a9a8b', '#3f4a5a', '#c9c9c9'];

export default function Edit(
    {
        className,
    }: BlockEditProps<ColorSwatchesAttributes>) {
    const blockProps = useBlockProps({
        className: `${className ?? ''} ${namespace}-color-swatches-editor`.trim(),
    });

    return (
        <div {...blockProps}>
            <div
                className={`${namespace}-color-swatches`}
                role="group"
                aria-label={__('Available colors (preview)', namespace)}
            >
                {PLACEHOLDER_DOTS.map((color, index) => (
                    <span
                        key={index}
                        className={
                            `${namespace}-color-swatches__swatch` +
                            (index === 0 ? ` ${namespace}-color-swatches__swatch--active` : '')
                        }
                        style={{ ['--sgb-swatch-color' as any]: color }}
                        aria-hidden="true"
                    />
                ))}
            </div>
            <p className={`${namespace}-color-swatches-editor__note`}>
                {__('Color swatches appear per product on the front end.', namespace)}
            </p>
        </div>
    );
}
