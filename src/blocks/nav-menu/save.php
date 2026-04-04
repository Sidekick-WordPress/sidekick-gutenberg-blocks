<?php
defined('ABSPATH') || exit;

return function( $attributes, $content ) {
    $namespace = defined('SGB_NS') ? SGB_NS : 'sgb';

    $ref         = isset( $attributes['ref'] ) ? (int) $attributes['ref'] : 0;
    $orientation = isset( $attributes['orientation'] ) ? $attributes['orientation'] : 'horizontal';
    $gap         = isset( $attributes['gap'] ) ? (int) $attributes['gap'] : 24;
    $mobile_gap  = isset( $attributes['mobileGap'] ) ? (int) $attributes['mobileGap'] : 12;
    $breakpoint  = isset( $attributes['desktopBreakpoint'] ) ? (int) $attributes['desktopBreakpoint'] : 768;

    $flex_direction = $orientation === 'vertical' ? 'column' : 'row';
    $align_items    = $orientation === 'vertical' ? 'stretch' : 'center';

    $style = sprintf(
        '--nav-gap-desktop: %dpx; --nav-gap-mobile: %dpx; --nav-current-gap: var(--nav-gap-desktop);',
        $gap,
        $mobile_gap
    );

    $wrapper_attributes = get_block_wrapper_attributes([
        'class' => "{$namespace}-nav-menu",
        'style' => $style,
    ]);

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

        <button class="<?php echo esc_attr( "{$namespace}-nav-menu__toggle" ); ?>" aria-expanded="false" aria-label="<?php echo esc_attr__( 'Open menu', 'sidekick-gutenberg-blocks' ); ?>">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>

        <div class="<?php echo esc_attr( "{$namespace}-nav-menu__overlay" ); ?>">

            <div class="<?php echo esc_attr( "{$namespace}-nav-menu__overlay-header" ); ?>">
                <button class="<?php echo esc_attr( "{$namespace}-nav-menu__close" ); ?>" aria-label="<?php echo esc_attr__( 'Close menu', 'sidekick-gutenberg-blocks' ); ?>">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
            </div>

            <ul
                class="<?php echo esc_attr( "{$namespace}-nav-menu__inner" ); ?>"
                style="<?php echo esc_attr(
                    sprintf(
                        'display:flex; flex-direction:%s; flex-wrap:wrap; align-items:%s; gap:var(--nav-current-gap); list-style:none; padding:0; margin:0;',
                        $flex_direction,
                        $align_items
                    )
                ); ?>"
                data-desktop-breakpoint="<?php echo esc_attr( $breakpoint ); ?>"
                data-orientation="<?php echo esc_attr( $orientation ); ?>"
            >
                <?php echo $nav_content; ?>
            </ul>
        </div>
    </nav>
    <?php
    return ob_get_clean();
};
