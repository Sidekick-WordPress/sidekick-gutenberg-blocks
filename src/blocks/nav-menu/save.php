<?php
defined('ABSPATH') || exit;

return function( $attributes, $content ) {
    $namespace = defined('SGB_NS') ? SGB_NS : 'sgb';

    $ref         = isset( $attributes['ref'] ) ? (int) $attributes['ref'] : 0;
    $orientation = isset( $attributes['orientation'] ) ? $attributes['orientation'] : 'horizontal';
    $justify     = isset( $attributes['justifyContent'] ) ? $attributes['justifyContent'] : 'right';
    $gap         = isset( $attributes['gap'] ) ? (int) $attributes['gap'] : 24;
    $mobile_gap  = isset( $attributes['mobileGap'] ) ? (int) $attributes['mobileGap'] : 12;
    $breakpoint  = isset( $attributes['desktopBreakpoint'] ) ? (int) $attributes['desktopBreakpoint'] : 768;

    $justify_map = [
        'left'          => 'flex-start',
        'center'        => 'center',
        'right'         => 'flex-end',
        'space-between' => 'space-between',
    ];

    $flex_direction = $orientation === 'vertical' ? 'column' : 'row';
    $align_items    = $orientation === 'vertical' ? 'stretch' : 'center';
    $justify_css    = isset( $justify_map[ $justify ] ) ? $justify_map[ $justify ] : 'flex-end';

    $style = sprintf(
        '--nav-gap-desktop: %dpx; --nav-gap-mobile: %dpx; --nav-current-gap: var(--nav-gap-desktop);',
        $gap,
        $mobile_gap
    );

    $wrapper_attributes = get_block_wrapper_attributes([
        'class' => "{$namespace}-nav-menu",
        'style' => $style,
    ]);

    // Fetch and render the core navigation items
    $nav_content = '';
    if ( $ref ) {
        $nav_post = get_post( $ref );
        if ( $nav_post && $nav_post->post_type === 'wp_navigation' ) {
            $blocks = parse_blocks( $nav_post->post_content );
            foreach ( $blocks as $block ) {
                $nav_content .= render_block( $block );
            }
        }
    }

    ob_start();
    ?>
    <nav <?php echo $wrapper_attributes; ?> aria-label="<?php echo esc_attr__( 'Custom navigation menu', 'sidekick-gutenberg-blocks' ); ?>">
        <ul
            class="<?php echo esc_attr( "{$namespace}-nav-menu__inner" ); ?>"
            style="<?php echo esc_attr(
                sprintf(
                    'display:flex; flex-direction:%s; flex-wrap:wrap; align-items:%s; justify-content:%s; gap:var(--nav-current-gap); list-style:none; padding:0; margin:0;',
                    $flex_direction,
                    $align_items,
                    $justify_css
                )
            ); ?>"
            data-desktop-breakpoint="<?php echo esc_attr( $breakpoint ); ?>"
        >
            <?php echo $nav_content; ?>
        </ul>
    </nav>
    <?php
    return ob_get_clean();
};
