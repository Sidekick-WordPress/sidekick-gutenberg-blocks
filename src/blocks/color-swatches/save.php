<?php
defined( 'ABSPATH' ) || exit;

/**
 * sgb/color-swatches — server render.
 *
 * VARIABLE product: one swatch per pa_color variation, as a <button> carrying the
 * variation_id, stock, price_html and image. The coordinator (react.ts) selects a
 * variation on click, swaps the card image + price, and arms the Add-to-Cart button.
 * SIMPLE product: inert <span> dots per pa_color term (indicators only).
 *
 * Returns the render_callback closure (register-blocks.php does
 * `$render_callback = require save.php`).
 */
return function( $attributes, $content, $block ) {
    $namespace = defined( 'SGB_NS' ) ? SGB_NS : 'sgb';

    $post_id = $block->context['postId'] ?? get_the_ID();
    if ( ! $post_id || ! function_exists( 'wc_get_product' ) ) {
        return '';
    }
    $product = wc_get_product( $post_id );
    if ( ! $product ) {
        return '';
    }

    // Ordered slug-keyed swatch map — interactive variation swatches for an
    // inline-addable product, inert dots otherwise. The logic lives in
    // sgb_get_product_color_swatches() (php/helpers.php) because the Store API
    // extension serves the identical payload to the React collection feed.
    $swatches = sgb_get_product_color_swatches( $product );

    if ( empty( $swatches ) ) {
        return '';
    }

    $wrapper_attributes = get_block_wrapper_attributes( array(
        'class' => "{$namespace}-color-swatches",
        'role'  => 'group',
    ) );

    ob_start();
    ?>
    <div <?php echo $wrapper_attributes; ?> aria-label="<?php echo esc_attr__( 'Available colors', 'sidekick-gutenberg-blocks' ); ?>">
        <?php
        foreach ( $swatches as $slug => $s ) :
            $base = sprintf(
                'class="%1$s%2$s" style="--sgb-swatch-color:%3$s" title="%4$s" aria-label="%4$s" data-sgb-color="%5$s"',
                esc_attr( "{$namespace}-color-swatches__swatch" ),
                $s['in_stock'] ? '' : ' ' . esc_attr( "{$namespace}-color-swatches__swatch--oos" ),
                esc_attr( $s['hex'] ),
                esc_attr( $s['name'] ),
                esc_attr( $slug )
            );

            if ( $s['variation'] ) :
                ?>
                <button
                    type="button"
                    <?php echo $base; ?>
                    data-sgb-variation-id="<?php echo esc_attr( (string) $s['variation'] ); ?>"
                    data-sgb-in-stock="<?php echo $s['in_stock'] ? '1' : '0'; ?>"
                    <?php echo ! empty( $s['default'] ) ? 'data-sgb-default="1"' : ''; ?>
                    data-sgb-price-html="<?php echo esc_attr( $s['price'] ); ?>"
                    data-sgb-swatch-image="<?php echo esc_url( $s['img'] ); ?>"
                    data-sgb-swatch-srcset="<?php echo esc_attr( $s['srcset'] ); ?>"
                    aria-pressed="false"
                    <?php echo $s['in_stock'] ? '' : 'disabled'; ?>
                ></button>
            <?php else : ?>
                <span <?php echo $base; ?>></span>
            <?php endif; ?>
        <?php endforeach; ?>
    </div>
    <?php
    return ob_get_clean();
};
