<?php
defined( 'ABSPATH' ) || exit;

/**
 * sgb/product-attribute — server render.
 *
 * Outputs a single product attribute value with an optional prefix/suffix,
 * read via WC_Product::get_attribute() from the product in the loop (postId
 * context). Because it reads the value directly it renders regardless of
 * whether the attribute has "Enable archives" turned on.
 *
 * Returns the render_callback closure (register-blocks.php does
 * `$render_callback = require save.php`).
 */
return function( $attributes, $content, $block ) {
    $taxonomy = isset( $attributes['attribute'] ) ? sanitize_text_field( $attributes['attribute'] ) : 'pa_caliber';
    $prefix   = isset( $attributes['prefix'] ) ? (string) $attributes['prefix'] : '';
    $suffix   = isset( $attributes['suffix'] ) ? (string) $attributes['suffix'] : '';

    $post_id = $block->context['postId'] ?? get_the_ID();
    if ( ! $post_id || ! function_exists( 'wc_get_product' ) ) {
        return '';
    }

    $product = wc_get_product( $post_id );
    if ( ! $product ) {
        return '';
    }

    // get_attribute() returns a comma-separated list of term names for a
    // taxonomy attribute (or the raw text for a custom attribute); '' if unset.
    $value = $product->get_attribute( $taxonomy );
    if ( '' === $value ) {
        return '';
    }

    $wrapper_attributes = get_block_wrapper_attributes( [ 'class' => 'sgb-product-attribute' ] );

    return sprintf(
        '<span %1$s>%2$s%3$s%4$s</span>',
        $wrapper_attributes,
        esc_html( $prefix ),
        esc_html( $value ),
        esc_html( $suffix )
    );
};
