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
    $mobile_font_size = isset( $attributes['mobileFontSize'] ) ? (int) $attributes['mobileFontSize'] : 24;

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
    $sub_menu_box_shadow = ! empty( $attributes['subMenuBoxShadow'] ) ? $attributes['subMenuBoxShadow'] : 'none';
    $sub_menu_radius    = isset( $attributes['subMenuBorderRadius'] ) ? (int) $attributes['subMenuBorderRadius'] : 0;
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

    // The sub-menu identifier is rendered as a CSS mask, so the raw SVG markup
    // is base64-encoded into a data URI. Referenced as a mask image (never
    // injected into the DOM), so arbitrary SVG markup can't execute — and
    // base64 keeps the value free of quotes/special chars that would otherwise
    // need escaping through the style attribute + CSS url() layers.
    $default_indicator  = '<svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m16.843 10.211c.108-.141.157-.3.157-.456 0-.389-.306-.755-.749-.755h-8.501c-.445 0-.75.367-.75.755 0 .157.05.316.159.457 1.203 1.554 3.252 4.199 4.258 5.498.142.184.36.29.592.29.23 0 .449-.107.591-.291zm-7.564.289h5.446l-2.718 3.522z" fill-rule="nonzero"/></svg>';
    $sub_menu_indicator = ! empty( $attributes['subMenuIndicator'] ) ? $attributes['subMenuIndicator'] : $default_indicator;
    $sub_menu_indicator_uri = 'url(data:image/svg+xml;base64,' . base64_encode( $sub_menu_indicator ) . ')';

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

    // The overlay is moved to <body> on mobile (see react.ts), so these
    // variables are printed on both the nav and the overlay element.
    $style_vars = sprintf(
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
            '--nav-font-weight: %23$s; ' .
            '--nav-sub-box-shadow: %24$s; ' .
            '--nav-sub-border-radius: %25$dpx; ' .
            '--nav-submenu-indicator: %26$s; ' .
            '--nav-mobile-font-size: %27$dpx;',
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
            esc_attr( $font_weight ), // 23
            esc_attr( $sub_menu_box_shadow ), // 24
            $sub_menu_radius, // 25
            esc_attr( $sub_menu_indicator_uri ), // 26
            $mobile_font_size // 27
        );

    $style = $layout_inline_style . $style_vars;

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

        <div class="<?php echo esc_attr( "{$namespace}-nav-menu__overlay" ); ?>" style="<?php echo esc_attr( $style_vars ); ?>">
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
