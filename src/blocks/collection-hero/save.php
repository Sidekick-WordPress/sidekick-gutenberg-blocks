<?php
defined('ABSPATH') || exit;

return function( $attributes, $content, $block ) {
    $min_height = isset( $attributes['minHeight'] ) ? (int) $attributes['minHeight'] : 340;
    $align      = isset( $attributes['titleAlign'] ) ? $attributes['titleAlign'] : 'right';
    $align      = in_array( $align, [ 'left', 'right' ], true ) ? $align : 'right';

    // Resolve the hero source. product_cat archives use the term (name +
    // kgm_lifestyle_image_id term meta). The Shop archive has no term — its
    // queried object is the Shop PAGE — so the hero draws from that page
    // instead: its Featured Image and title are the native editing surface
    // (Pages → Shop) for the storefront-wide default.
    $is_shop = function_exists( 'is_shop' ) && is_shop();

    $term_id = (int) ( $block->context['termId'] ?? 0 );
    if ( ! $term_id && ! $is_shop ) {
        $term_id = (int) get_queried_object_id();
    }
    $term = $term_id ? get_term( $term_id ) : null;
    $term = ( $term && ! is_wp_error( $term ) ) ? $term : null;

    // Term meta only when the id genuinely resolved to a term — on non-term
    // requests the queried id is a post id and must not be fed to term APIs.
    $img_id = $term ? (int) get_term_meta( $term->term_id, 'kgm_lifestyle_image_id', true ) : 0;

    // The site editor / template context has no resolvable term. Rather than
    // render nothing (a blank preview), fall back to a neutral title so the
    // band is still visible while editing the template.
    $title = $term ? $term->name : __( 'Collection', 'sidekick-gutenberg-blocks' );

    if ( ! $term && $is_shop ) {
        $shop_page_id = function_exists( 'wc_get_page_id' ) ? (int) wc_get_page_id( 'shop' ) : 0;
        if ( $shop_page_id > 0 ) {
            $img_id = $img_id ?: (int) get_post_thumbnail_id( $shop_page_id );
            $title  = get_the_title( $shop_page_id ) ?: $title;
        }
    }

    $img = $img_id ? wp_get_attachment_image_url( $img_id, 'full' ) : '';

    $wrapper_attributes = get_block_wrapper_attributes( [
        'class' => 'sgb-collection-hero sgb-collection-hero--align-' . $align,
        'style' => '--sgb-hero-min-height:' . $min_height . 'px',
    ] );

    ob_start();
    ?>
    <section <?php echo $wrapper_attributes; ?>>
        <?php if ( $img ) : ?>
            <div
                class="sgb-collection-hero__media"
                style="background-image:url(<?php echo esc_url( $img ); ?>)"
            ></div>
        <?php endif; ?>
        <div class="sgb-collection-hero__inner">
            <h1 class="sgb-collection-hero__title"><?php echo esc_html( $title ); ?></h1>
        </div>
    </section>
    <?php
    return ob_get_clean();
};
