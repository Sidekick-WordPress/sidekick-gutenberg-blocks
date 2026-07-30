import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';

// Plugin
import namespace from '../../namespace';

// The real button is server-rendered per product (simple vs variable) and wired by
// the card coordinator (color-swatches/react.ts). In the editor there is no product
// context, so show a static preview using the theme's Black button preset classes.
export default function Edit() {
    const blockProps = useBlockProps({
        className: 'wp-block-button is-style-cutout-frame-black kgm-product-card__button',
    });

    return (
        <div {...blockProps}>
            <button type="button" className="wp-block-button__link wp-element-button kgm-add-to-cart">
                {__('Add to Cart', namespace)}
            </button>
        </div>
    );
}
