<?php
defined( 'ABSPATH' ) || exit;

/**
 * Collection Intro — server-rendered.
 *
 * Renders a headline + intro paragraph pulled from the current product_cat
 * term's meta. The term is resolved from the block's `termId` context when
 * present (e.g. inside a query loop), falling back to the queried object on a
 * category archive.
 *
 * Term meta keys (product_cat):
 *   - kgm_collection_headline (text)
 *   - kgm_collection_intro    (textarea / plain text)
 */
return function( $attributes, $content, $block ) {
    $term_id = $block->context['termId'] ?? get_queried_object_id();

    $headline = $term_id ? get_term_meta( $term_id, 'kgm_collection_headline', true ) : '';
    $intro    = $term_id ? get_term_meta( $term_id, 'kgm_collection_intro', true ) : '';

    // Clamp the heading level to a valid h1–h6, defaulting to 2.
    $level = isset( $attributes['headingLevel'] ) ? (int) $attributes['headingLevel'] : 2;
    if ( $level < 1 || $level > 6 ) {
        $level = 2;
    }
    $tag = 'h' . $level;

    // Nothing to show. In the editor the block is previewed through the REST
    // block-renderer (where is_admin() is false), so treat a REST request as
    // "editor" too and surface a muted placeholder; on the front end render nothing.
    if ( '' === $headline && '' === $intro ) {
        if ( ( defined( 'REST_REQUEST' ) && REST_REQUEST ) || is_admin() ) {
            $wrapper = get_block_wrapper_attributes( [ 'class' => 'sgb-collection-intro' ] );
            return sprintf(
                '<div %1$s><p style="color:#808080;font-style:italic;margin:0;">%2$s</p></div>',
                $wrapper,
                esc_html__( 'Add a headline & intro on the product category.', 'sidekick-gutenberg-blocks' )
            );
        }
        return '';
    }

    $wrapper_attributes = get_block_wrapper_attributes( [ 'class' => 'sgb-collection-intro' ] );

    ob_start();
    ?>
    <div <?php echo $wrapper_attributes; ?>>
        <?php if ( '' !== $headline ) : ?>
            <<?php echo esc_attr( $tag ); ?> class="sgb-collection-intro__headline"><?php echo esc_html( $headline ); ?></<?php echo esc_attr( $tag ); ?>>
        <?php endif; ?>
        <?php if ( '' !== $intro ) : ?>
            <div class="sgb-collection-intro__text"><?php echo wp_kses_post( wpautop( $intro ) ); ?></div>
        <?php endif; ?>
    </div>
    <?php
    return ob_get_clean();
};
