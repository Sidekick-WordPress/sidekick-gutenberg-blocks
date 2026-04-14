<?php
defined('ABSPATH') || exit;

// Helper function to safely parse the BoxControl array into a CSS string
if ( ! function_exists( 'sgb_format_padding_attribute' ) ) {
    function sgb_format_padding_attribute( $padding, $default = '0px' ) {
        if ( ! is_array( $padding ) ) {
            return $default;
        }
        $top    = ! empty( $padding['top'] ) ? $padding['top'] : '0px';
        $right  = ! empty( $padding['right'] ) ? $padding['right'] : '0px';
        $bottom = ! empty( $padding['bottom'] ) ? $padding['bottom'] : '0px';
        $left   = ! empty( $padding['left'] ) ? $padding['left'] : '0px';

        return "{$top} {$right} {$bottom} {$left}";
    }
}

return function( $attributes, $content ) {
    $namespace = defined('SGB_NS') ? SGB_NS : 'sgb';

    $ref         = isset( $attributes['ref'] ) ? (int) $attributes['ref'] : 0;
    $orientation = isset( $attributes['orientation'] ) ? $attributes['orientation'] : 'horizontal';
    $gap         = isset( $attributes['gap'] ) ? (int) $attributes['gap'] : 24;
    $mobile_gap  = isset( $attributes['mobileGap'] ) ? (int) $attributes['mobileGap'] : 12;

    $parent_padding_arr = isset( $attributes['parentPadding'] ) ? $attributes['parentPadding'] : null;
    $sub_padding_arr    = isset( $attributes['subMenuPadding'] ) ? $attributes['subMenuPadding'] : null;

    $parent_padding     = sgb_format_padding_attribute( $parent_padding_arr, '0.5rem 1rem' );
    $parent_padding_left = ! empty( $parent_padding_arr['left'] ) ? $parent_padding_arr['left'] : '1rem';
    $sub_menu_padding   = sgb_format_padding_attribute( $sub_padding_arr, '0.5rem 1rem' );

    $parent_bg_color    = isset( $attributes['parentBgColor'] ) ? $attributes['parentBgColor'] : 'transparent';
    $parent_color       = isset( $attributes['parentColor'] ) ? $attributes['parentColor'] : 'inherit';
    $sub_menu_color     = isset( $attributes['subMenuColor'] ) ? $attributes['subMenuColor'] : 'inherit';
    $sub_menu_bg_color  = isset( $attributes['subMenuBgColor'] ) ? $attributes['subMenuBgColor'] : 'transparent';
    $overlay_bg         = ! empty( $attributes['overlayBgColor'] ) ? $attributes['overlayBgColor'] : 'var(--wp--preset--color--base, #ffffff)';
    $overlay_color      = ! empty( $attributes['overlayColor'] ) ? $attributes['overlayColor'] : 'var(--wp--preset--color--contrast, #000000)';
    $sub_menu_width     = isset( $attributes['subMenuWidth'] ) ? (int) $attributes['subMenuWidth'] : 240;
    $sub_menu_text_align = isset( $attributes['subMenuTextAlign'] ) ? $attributes['subMenuTextAlign'] : 'right';
    $sub_menu_alignment = isset( $attributes['subMenuAlignment'] ) ? $attributes['subMenuAlignment'] : 'left'; // <-- Extract new attr
    $nested_sub_menu_direction = isset( $attributes['nestedSubMenuDirection'] ) ? $attributes['nestedSubMenuDirection'] : 'right';
    $show_sub_menu_arrows = isset( $attributes['showSubMenuArrows'] ) ? (bool) $attributes['showSubMenuArrows'] : true;
    $parent_bg_hover = !empty($attributes['parentBgColorHover']) ? $attributes['parentBgColorHover'] : $parent_bg_color;
    $parent_color_hover = !empty($attributes['parentColorHover']) ? $attributes['parentColorHover'] : $parent_color;
    $sub_menu_bg_hover = !empty($attributes['subMenuBgColorHover']) ? $attributes['subMenuBgColorHover'] : 'transparent';
    $sub_menu_color_hover = !empty($attributes['subMenuColorHover']) ? $attributes['subMenuColorHover'] : $sub_menu_color;
    $overlay_bg_hover = !empty($attributes['overlayBgColorHover']) ? $attributes['overlayBgColorHover'] : 'transparent';
    $overlay_color_hover = !empty($attributes['overlayColorHover']) ? $attributes['overlayColorHover'] : $overlay_color;
    $text_transform     = isset( $attributes['textTransform'] ) ? $attributes['textTransform'] : 'none';
    $font_weight    = isset( $attributes['fontWeight'] ) ? $attributes['fontWeight'] : '';

    $flex_direction = $orientation === 'vertical' ? 'column' : 'row';
    $align_items    = $orientation === 'vertical' ? 'stretch' : 'center';

    $layout_inline_style = '';

    if (
        ! empty( $attributes['style'] ) &&
        is_array( $attributes['style'] ) &&
        ! empty( $attributes['style']['layout'] ) &&
        is_array( $attributes['style']['layout'] )
    ) {
        $layout = $attributes['style']['layout'];

        if ( isset( $layout['selfStretch'] ) && $layout['selfStretch'] === 'fill' ) {
            $layout_inline_style .= 'flex-grow:1;';
        }

        if ( ! empty( $layout['flexSize'] ) ) {
            $layout_inline_style .= 'flex-basis:' . esc_attr( $layout['flexSize'] ) . ';';
        }
    }

    $style = $layout_inline_style . sprintf(
            '--nav-gap-desktop: %1$dpx; ' .
            '--nav-gap-mobile: %2$dpx; ' .
            '--nav-current-gap: var(--nav-gap-desktop); ' .
            '--nav-parent-padding: %3$s; ' .
            '--nav-parent-padding-left: %4$s; ' .
            '--nav-parent-bg: %5$s; ' .
            '--nav-parent-color: %6$s; ' .
            '--nav-sub-color: %7$s; ' .
            '--nav-sub-bg: %8$s; ' .
            '--nav-sub-padding: %9$s; ' .
            '--nav-sub-width: %10$dpx; ' .
            '--nav-sub-text-align: %11$s; ' .
            '--nav-overlay-bg: %12$s; ' .
            '--nav-overlay-color: %13$s; ' .
            '--nav-nested-sub-direction: %14$s; ' .
            '--nav-submenu-alignment: %15$s; ' .
            '--nav-text-transform: %16$s; ' .
            '--nav-parent-bg-hover: %17$s; ' .
            '--nav-parent-color-hover: %18$s; ' .
            '--nav-sub-bg-hover: %19$s; ' .
            '--nav-sub-color-hover: %20$s; ' .
            '--nav-overlay-bg-hover: %21$s; ' .
            '--nav-overlay-color-hover: %22$s; ' .
            '--nav-font-weight: %23$s;', // <-- Add CSS variable (parameter 23)
            $gap, // 1
            $mobile_gap, // 2
            esc_attr( $parent_padding ), // 3
            esc_attr( $parent_padding_left ), // 4
            esc_attr( $parent_bg_color ), // 5
            esc_attr( $parent_color ), // 6
            esc_attr( $sub_menu_color ), // 7
            esc_attr( $sub_menu_bg_color ), // 8
            esc_attr( $sub_menu_padding ), // 9
            $sub_menu_width, // 10
            esc_attr( $sub_menu_text_align ), // 11
            esc_attr( $overlay_bg ), // 12
            esc_attr( $overlay_color ), // 13
            esc_attr( $nested_sub_menu_direction ), // 14
            esc_attr( $sub_menu_alignment ), // 15
            esc_attr( $text_transform ), // 16
            esc_attr( $parent_bg_hover ), // 17
            esc_attr( $parent_color_hover ), // 18
            esc_attr( $sub_menu_bg_hover ), // 19
            esc_attr( $sub_menu_color_hover ), // 20
            esc_attr( $overlay_bg_hover ), // 21
            esc_attr( $overlay_color_hover ), // 22
            esc_attr( $font_weight ) // 23
        );

    $wrapper_classes = [
        "{$namespace}-nav-menu",
        "{$namespace}-nav-menu--{$orientation}",
    ];

    if ( $show_sub_menu_arrows ) {
        $wrapper_classes[] = "{$namespace}-nav-menu--show-submenu-arrows";
    } else {
        $wrapper_classes[] = "{$namespace}-nav-menu--hide-submenu-arrows";
    }

    $wrapper_attributes = get_block_wrapper_attributes([
        'class' => implode( ' ', $wrapper_classes ),
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

    // Add has-child to items that contain a submenu container but don't already have it.
    $nav_content = preg_replace(
        '/<li([^>]*class=")([^"]*wp-block-navigation-item[^"]*)(\")([^>]*)>(?=.*?wp-block-navigation__submenu-container)/s',
        '<li$1$2 has-child$3$4>',
        $nav_content
    );

    ob_start();
    ?>
    <nav
        <?php echo $wrapper_attributes; ?>
        data-orientation="<?php echo esc_attr( $orientation ); ?>"
        data-submenu-alignment="<?php echo esc_attr( $sub_menu_alignment ); ?>"
        data-nested-direction="<?php echo esc_attr( $nested_sub_menu_direction ); ?>"
        aria-label="<?php echo esc_attr__( 'Custom navigation menu', 'sidekick-gutenberg-blocks' ); ?>"
    >
        <noscript>
            <style>
                .<?php echo esc_attr( $namespace ); ?>-nav-menu {
                    opacity: 1 !important;
                    visibility: visible !important;
                }
            </style>
        </noscript>

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
                data-orientation="<?php echo esc_attr( $orientation ); ?>"
            >
                <?php echo $nav_content; ?>
            </ul>
        </div>
    </nav>
    <?php
    return ob_get_clean();
};
