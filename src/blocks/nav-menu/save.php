<?php
defined('ABSPATH') || exit;

require_once __DIR__ . '/styles.php';

return function( $attributes, $content ) {
    $legacy_typography = ( $attributes['styleVersion'] ?? null ) !== 1;
    $attributes = sgb_nav_menu_migrate_styles( $attributes );
    $namespace = defined('SGB_NS') ? SGB_NS : 'sgb';

    $ref         = isset( $attributes['ref'] ) ? (int) $attributes['ref'] : 0;
    $orientation = isset( $attributes['orientation'] ) ? $attributes['orientation'] : 'horizontal';
    $gap         = isset( $attributes['gap'] ) ? (int) $attributes['gap'] : 24;
    $mobile_gap  = isset( $attributes['mobileGap'] ) ? (int) $attributes['mobileGap'] : 12;
    $mobile_font_size = isset( $attributes['mobileFontSize'] ) ? (int) $attributes['mobileFontSize'] : 24;
    $hover_transition_duration = max( 0, min( 2000, (int) ( $attributes['hoverTransitionDuration'] ?? 200 ) ) );

    $parent_padding_arr = sgb_nav_menu_padding_sides( $attributes['style']['spacing']['padding'] ?? null );
    $sub_padding_arr = sgb_nav_menu_padding_sides( $attributes['subMenuStyle']['spacing']['padding'] ?? null );
    $parent_padding = implode( ' ', $parent_padding_arr );
    $parent_padding_left = $parent_padding_arr['left'];
    $sub_menu_padding = implode( ' ', $sub_padding_arr );

    $parent_bg_color    = isset( $attributes['parentBgColor'] ) ? $attributes['parentBgColor'] : 'transparent';
    $parent_color       = isset( $attributes['parentColor'] ) ? $attributes['parentColor'] : 'inherit';
    $sub_menu_color     = isset( $attributes['subMenuColor'] ) ? $attributes['subMenuColor'] : 'inherit';
    $sub_menu_bg_color  = isset( $attributes['subMenuBgColor'] ) ? $attributes['subMenuBgColor'] : 'transparent';
    $overlay_bg         = ! empty( $attributes['overlayBgColor'] ) ? $attributes['overlayBgColor'] : 'var(--wp--preset--color--base, #ffffff)';
    $overlay_color      = ! empty( $attributes['overlayColor'] ) ? $attributes['overlayColor'] : 'var(--wp--preset--color--contrast, #000000)';
    $sub_menu_width = sgb_nav_menu_css_value( $attributes['subMenuWidth'] ?? '240px', '240px' );
    if ( is_numeric( $sub_menu_width ) ) {
        $sub_menu_width .= 'px';
    }
    $sub_menu_box_shadow = ! empty( $attributes['subMenuBoxShadow'] ) ? $attributes['subMenuBoxShadow'] : 'none';
    $sub_menu_corners = sgb_nav_menu_radius_corners( $attributes['subMenuStyle']['border']['radius'] ?? null );
    $sub_menu_radius = implode( ' ', $sub_menu_corners );
    $sub_menu_text_align = isset( $attributes['subMenuTextAlign'] ) ? $attributes['subMenuTextAlign'] : 'right';
    $sub_menu_alignment = isset( $attributes['subMenuAlignment'] ) ? $attributes['subMenuAlignment'] : 'left'; // <-- Extract new attr
    $nested_sub_menu_direction = isset( $attributes['nestedSubMenuDirection'] ) ? $attributes['nestedSubMenuDirection'] : 'right';
    $show_sub_menu_arrows = isset( $attributes['showSubMenuArrows'] ) ? (bool) $attributes['showSubMenuArrows'] : true;
    $collapsible_sub_menus = isset( $attributes['collapsibleSubMenus'] ) ? (bool) $attributes['collapsibleSubMenus'] : true;
    $sub_menu_indent_color = ! empty( $attributes['subMenuIndentColor'] ) ? $attributes['subMenuIndentColor'] : '';
    $parent_bg_hover = !empty($attributes['parentBgColorHover']) ? $attributes['parentBgColorHover'] : $parent_bg_color;
    $parent_color_hover = !empty($attributes['parentColorHover']) ? $attributes['parentColorHover'] : $parent_color;
    $sub_menu_bg_hover = !empty($attributes['subMenuBgColorHover']) ? $attributes['subMenuBgColorHover'] : 'transparent';
    $sub_menu_color_hover = !empty($attributes['subMenuColorHover']) ? $attributes['subMenuColorHover'] : $sub_menu_color;
    $overlay_bg_hover = !empty($attributes['overlayBgColorHover']) ? $attributes['overlayBgColorHover'] : 'transparent';
    $overlay_color_hover = !empty($attributes['overlayColorHover']) ? $attributes['overlayColorHover'] : $overlay_color;

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
    $css_variables = array(
        '--nav-gap-desktop' => $gap . 'px',
        '--nav-gap-mobile' => $mobile_gap . 'px',
        '--nav-current-gap' => 'var(--nav-gap-desktop)',
        '--nav-parent-padding' => $parent_padding,
        '--nav-parent-padding-left' => $parent_padding_left,
        '--nav-parent-padding-right' => $parent_padding_arr['right'],
        '--nav-parent-bg' => $parent_bg_color,
        '--nav-parent-color' => $parent_color,
        '--nav-sub-color' => $sub_menu_color,
        '--nav-sub-bg' => $sub_menu_bg_color,
        '--nav-sub-padding' => $sub_menu_padding,
        '--nav-sub-width' => $sub_menu_width,
        '--nav-sub-text-align' => $sub_menu_text_align,
        '--nav-overlay-bg' => $overlay_bg,
        '--nav-overlay-color' => $overlay_color,
        '--nav-parent-bg-hover' => $parent_bg_hover,
        '--nav-parent-color-hover' => $parent_color_hover,
        '--nav-sub-bg-hover' => $sub_menu_bg_hover,
        '--nav-sub-color-hover' => $sub_menu_color_hover,
        '--nav-overlay-bg-hover' => $overlay_bg_hover,
        '--nav-overlay-color-hover' => $overlay_color_hover,
        '--nav-hover-transition-duration' => $hover_transition_duration . 'ms',
        '--nav-sub-box-shadow' => $sub_menu_box_shadow,
        '--nav-sub-border-radius' => $sub_menu_radius,
        '--nav-mobile-font-size' => $mobile_font_size . 'px',
    );
    foreach ( $sub_menu_corners as $corner => $radius ) {
        $css_variables[ '--nav-sub-radius-' . $corner ] = $radius;
    }
    $style_vars = '';
    foreach ( $css_variables as $property => $value ) {
        $style_vars .= $property . ': ' . sgb_nav_menu_css_value( $value ) . '; ';
    }
    // This generated URI contains a required semicolon before "base64". Its
    // payload is encoded above, so it must not go through the CSS-value guard.
    $style_vars .= '--nav-submenu-indicator: ' . $sub_menu_indicator_uri . ';';

    // The indent bar's fallback color is context-dependent in the stylesheet
    // (keyed to sub-menu color in vertical mode, overlay color in mobile
    // mode), so the variable is only emitted when a custom color is chosen.
    // esc_attr() doesn't touch ';' or '{', so declaration separators are
    // rejected outright to keep the value from smuggling extra CSS.
    if ( $sub_menu_indent_color && ! preg_match( '/[;{}]/', $sub_menu_indent_color ) ) {
        $style_vars .= sprintf( ' --nav-indent-color: %s;', esc_attr( $sub_menu_indent_color ) );
    }

    // Ring color for the collapsible sub-menu toggle. Only emitted when the
    // user picks one; otherwise the stylesheet falls back to a faded tint of
    // the current text color. Same ';{}' guard as the indent color above.
    $sub_menu_toggle_shadow_color = ! empty( $attributes['subMenuToggleShadowColor'] ) ? $attributes['subMenuToggleShadowColor'] : '';
    if ( $sub_menu_toggle_shadow_color && ! preg_match( '/[;{}]/', $sub_menu_toggle_shadow_color ) ) {
        $style_vars .= sprintf( ' --nav-submenu-toggle-shadow-color: %s;', esc_attr( $sub_menu_toggle_shadow_color ) );
    }

    $style = $layout_inline_style . $style_vars;

    // Core serializes native typography on the wrapper. Older posts still need
    // their legacy values rendered until the editor saves the migrated attrs.
    if ( $legacy_typography ) {
        $legacy_styles = wp_style_engine_get_styles( array( 'typography' => $attributes['style']['typography'] ?? array() ) );
        $style .= $legacy_styles['css'] ?? '';
    }

    $wrapper_classes = [
        "{$namespace}-nav-menu",
        "{$namespace}-nav-menu--{$orientation}",
    ];

    if ( $show_sub_menu_arrows ) {
        $wrapper_classes[] = "{$namespace}-nav-menu--show-submenu-arrows";
    } else {
        $wrapper_classes[] = "{$namespace}-nav-menu--hide-submenu-arrows";
    }

    if ( $orientation === 'vertical' && $collapsible_sub_menus ) {
        $wrapper_classes[] = "{$namespace}-nav-menu--collapsible";
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 8H21M3 16H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
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
