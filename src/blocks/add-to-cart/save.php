<?php
defined( 'ABSPATH' ) || exit;

/**
 * sgb/add-to-cart — product-card add-to-cart, styled with the theme's "Black"
 * preset (is-style-cutout-frame-black).
 *
 *  - Simple purchasable product        -> button, adds product_id.
 *  - Single-axis pa_color variable      -> button ("Select a Color", armed once a
 *    (inline-addable) product              swatch is chosen), adds the variation_id.
 *  - Multi-axis / non-inline variable   -> link to the product page ("Select Options").
 *  - Nothing purchasable                -> renders nothing.
 *
 * The actual add is dispatched client-side through the wc/store/cart data store
 * (react.ts) so the header mini-cart badge refreshes automatically.
 */
return function( $attributes, $content, $block ) {
    $post_id = $block->context['postId'] ?? get_the_ID();
    if ( ! $post_id || ! function_exists( 'wc_get_product' ) ) {
        return '';
    }
    $product = wc_get_product( $post_id );
    if ( ! $product ) {
        return '';
    }

    $is_variable = $product->is_type( 'variable' );

    // Drop products with nothing addable: non-purchasable simple products and
    // variable products with no purchasable variation (e.g. all out of stock).
    if ( $is_variable ) {
        $addable = method_exists( $product, 'has_purchasable_variations' ) ? $product->has_purchasable_variations() : true;
    } else {
        $addable = $product->is_purchasable();
    }
    if ( ! $addable ) {
        return '';
    }

    $inline_addable = sgb_is_inline_color_addable( $product );
    $permalink      = get_permalink( $post_id );

    // Reuse the "Black" button preset by putting its classes on the wrapper.
    $wrapper_attributes = get_block_wrapper_attributes( array(
        'class' => 'wp-block-button is-style-cutout-frame-black kgm-product-card__button',
    ) );

    // A variable product that can't be picked inline (multi-axis, e.g. colour + size)
    // links to the product page so the shopper can choose the remaining options.
    if ( $is_variable && ! $inline_addable ) {
        ob_start();
        ?>
        <div <?php echo $wrapper_attributes; ?>>
            <a class="wp-block-button__link wp-element-button kgm-add-to-cart-link" href="<?php echo esc_url( $permalink ); ?>">
                <?php echo esc_html__( 'Select Options', 'sidekick-gutenberg-blocks' ); ?>
            </a>
        </div>
        <?php
        return ob_get_clean();
    }

    // Simple product, or a single-axis pa_color variable product (armed by a swatch).
    $add_label = __( 'Add to Cart', 'sidekick-gutenberg-blocks' );
    $label     = $inline_addable ? __( 'Select a Color', 'sidekick-gutenberg-blocks' ) : $add_label;

    ob_start();
    ?>
    <div <?php echo $wrapper_attributes; ?>>
        <button
            type="button"
            class="wp-block-button__link wp-element-button kgm-add-to-cart"
            data-product-id="<?php echo esc_attr( (string) $post_id ); ?>"
            data-product-type="<?php echo $inline_addable ? 'variable' : 'simple'; ?>"
            data-product-url="<?php echo esc_url( $permalink ); ?>"
            data-add-label="<?php echo esc_attr( $add_label ); ?>"
            <?php echo $inline_addable ? 'disabled' : ''; ?>
        ><?php echo esc_html( $label ); ?></button>
        <span class="kgm-add-to-cart__status" role="status" aria-live="polite"></span>
    </div>
    <?php
    return ob_get_clean();
};
