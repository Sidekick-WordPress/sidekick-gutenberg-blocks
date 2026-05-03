<?php
defined('ABSPATH') || exit;

return function( $attributes, $content, $block ) {
    $namespace = defined('SGB_NS') ? SGB_NS : 'sgb';

    // Breakpoints from Context
    $tablet_bp  = isset( $block->context["{$namespace}/tabletBreakpoint"] ) ? (int) $block->context["{$namespace}/tabletBreakpoint"] : 768;
    $desktop_bp = isset( $block->context["{$namespace}/desktopBreakpoint"] ) ? (int) $block->context["{$namespace}/desktopBreakpoint"] : 1024;

    // Widths
    $w_mobile = isset( $attributes['width'] ) ? (float) $attributes['width'] : 100.0;
    $w_tablet = isset( $attributes['tabletWidth'] ) ? (float) $attributes['tabletWidth'] : $w_mobile;
    $w_desktop = isset( $attributes['desktopWidth'] ) ? (float) $attributes['desktopWidth'] : $w_tablet;

    // Padding
    $pad_mobile = isset( $attributes['mobilePadding'] ) ? $attributes['mobilePadding'] : ['top'=>'10px','right'=>'10px','bottom'=>'10px','left'=>'10px'];
    $pad_tablet = ! empty( $attributes['tabletPadding'] ) ? $attributes['tabletPadding'] : null;
    $pad_desktop = ! empty( $attributes['padding'] ) ? $attributes['padding'] : null;

    $css_pad_mobile = sgb_get_padding_str( $pad_mobile, '10px' );
    $css_pad_tablet = $pad_tablet ? sgb_get_padding_str( $pad_tablet, '10px' ) : 'var(--col-pad-mobile)';
    $css_pad_desktop = $pad_desktop ? sgb_get_padding_str( $pad_desktop, '10px' ) : 'var(--col-pad-tablet)';

    // Vertical Align
    $va_mobile = isset( $attributes['vAlign'] ) ? $attributes['vAlign'] : 'flex-start';
    $va_tablet = ! empty( $attributes['tabletVAlign'] ) ? $attributes['tabletVAlign'] : 'var(--col-valign-mobile)';
    $va_desktop = ! empty( $attributes['desktopVAlign'] ) ? $attributes['desktopVAlign'] : 'var(--col-valign-tablet)';

    // Inner Max Width
    $imw_mobile = ! empty( $attributes['innerMaxWidth'] ) ? $attributes['innerMaxWidth'] : '100%';
    $imw_tablet = ! empty( $attributes['tabletInnerMaxWidth'] ) ? $attributes['tabletInnerMaxWidth'] : 'var(--col-inner-max-mobile)';
    $imw_desktop = ! empty( $attributes['desktopInnerMaxWidth'] ) ? $attributes['desktopInnerMaxWidth'] : 'var(--col-inner-max-tablet)';

    // Content Horizontal Align
    $align_map = [ 'left' => 'flex-start', 'center' => 'center', 'right' => 'flex-end' ];
    $ha_mobile = isset( $attributes['contentHAlign'] ) ? ( $align_map[$attributes['contentHAlign']] ?? 'flex-start' ) : 'flex-start';
    $ha_tablet = ! empty( $attributes['tabletContentHAlign'] ) ? ( $align_map[$attributes['tabletContentHAlign']] ?? 'var(--col-halign-mobile)' ) : 'var(--col-halign-mobile)';
    $ha_desktop = ! empty( $attributes['desktopContentHAlign'] ) ? ( $align_map[$attributes['desktopContentHAlign']] ?? 'var(--col-halign-tablet)' ) : 'var(--col-halign-tablet)';

    // Background Attributes
    $bg_img_base = ! empty( $attributes['backgroundImage'] ) ? 'url(' . esc_url( $attributes['backgroundImage'] ) . ')' : 'none';
    $bg_col_base = ! empty( $attributes['backgroundColor'] ) ? $attributes['backgroundColor'] : 'transparent';

    $bg_img_tab = ! empty( $attributes['tabletBackgroundImage'] ) ? 'url(' . esc_url( $attributes['tabletBackgroundImage'] ) . ')' : 'var(--col-bg-image-mobile)';
    $bg_col_tab = ! empty( $attributes['tabletBackgroundColor'] ) ? $attributes['tabletBackgroundColor'] : 'var(--col-bg-color-mobile)';

    $bg_img_desk = ! empty( $attributes['desktopBackgroundImage'] ) ? 'url(' . esc_url( $attributes['desktopBackgroundImage'] ) . ')' : 'var(--col-bg-image-tablet)';
    $bg_col_desk = ! empty( $attributes['desktopBackgroundColor'] ) ? $attributes['desktopBackgroundColor'] : 'var(--col-bg-color-tablet)';

    $bg_opacity     = isset( $attributes['backgroundImageOpacity'] ) ? $attributes['backgroundImageOpacity'] : 100;
    $bg_size        = isset( $attributes['backgroundSize'] ) ? $attributes['backgroundSize'] : 'cover';
    $bg_position    = isset( $attributes['backgroundPosition'] ) ? $attributes['backgroundPosition'] : 'center';
    $bg_repeat      = isset( $attributes['backgroundRepeat'] ) ? $attributes['backgroundRepeat'] : 'no-repeat';
    $bg_parallax    = ! empty( $attributes['backgroundFixedPosition'] );
    $bg_attachment  = $bg_parallax ? 'fixed' : 'scroll';

    // Advanced Layout - Base
    $ext_t_base = ! empty( $attributes['extendTop'] ) ? $attributes['extendTop'] : '0px';
    $ext_b_base = ! empty( $attributes['extendBottom'] ) ? $attributes['extendBottom'] : '0px';
    $tra_x_base = ! empty( $attributes['translateX'] ) ? $attributes['translateX'] : '0px';
    $tra_y_base = ! empty( $attributes['translateY'] ) ? $attributes['translateY'] : '0px';

    // Advanced Layout - Tablet
    $ext_t_tab = ! empty( $attributes['tabExtendTop'] ) ? $attributes['tabExtendTop'] : 'var(--base-ext-top)';
    $ext_b_tab = ! empty( $attributes['tabExtendBottom'] ) ? $attributes['tabExtendBottom'] : 'var(--base-ext-bottom)';
    $tra_x_tab = ! empty( $attributes['tabTranslateX'] ) ? $attributes['tabTranslateX'] : 'var(--base-trans-x)';
    $tra_y_tab = ! empty( $attributes['tabTranslateY'] ) ? $attributes['tabTranslateY'] : 'var(--base-trans-y)';

    // Advanced Layout - Desktop
    $ext_t_desk = ! empty( $attributes['deskExtendTop'] ) ? $attributes['deskExtendTop'] : 'var(--tab-ext-top)';
    $ext_b_desk = ! empty( $attributes['deskExtendBottom'] ) ? $attributes['deskExtendBottom'] : 'var(--tab-ext-bottom)';
    $tra_x_desk = ! empty( $attributes['deskTranslateX'] ) ? $attributes['deskTranslateX'] : 'var(--tab-trans-x)';
    $tra_y_desk = ! empty( $attributes['deskTranslateY'] ) ? $attributes['deskTranslateY'] : 'var(--tab-trans-y)';

    // Order
    $order_mobile = isset( $attributes['mobileOrder'] ) ? (int) $attributes['mobileOrder'] : 0;
    $order_tablet = isset( $attributes['tabletOrder'] ) ? (int) $attributes['tabletOrder'] : $order_mobile;
    $order_desktop = isset( $attributes['desktopOrder'] ) ? (int) $attributes['desktopOrder'] : $order_tablet;

    // Z-Index
    $z_mobile = isset( $attributes['zIndex'] ) ? (int) $attributes['zIndex'] : 1;
    $z_tablet = isset( $attributes['tabletZIndex'] ) ? (int) $attributes['tabletZIndex'] : $z_mobile;
    $z_desktop = isset( $attributes['desktopZIndex'] ) ? (int) $attributes['desktopZIndex'] : $z_tablet;

    // Border Radius — value may be a flat string or a per-corner array {topLeft, topRight, bottomRight, bottomLeft}
    $sgb_radius_css = function( $val, $fallback = '0px' ) {
        if ( empty( $val ) ) return $fallback;
        if ( is_string( $val ) ) return $val;
        if ( is_array( $val ) ) {
            $tl = $val['topLeft']     ?? '0px';
            $tr = $val['topRight']    ?? '0px';
            $br = $val['bottomRight'] ?? '0px';
            $bl = $val['bottomLeft']  ?? '0px';
            if ( ! $tl && ! $tr && ! $br && ! $bl ) return $fallback;
            return "$tl $tr $br $bl";
        }
        return $fallback;
    };
    $rad_mobile  = $sgb_radius_css( $attributes['borderRadius']       ?? null );
    $rad_tablet  = ! empty( $attributes['tabletBorderRadius'] )  ? $sgb_radius_css( $attributes['tabletBorderRadius'] )  : $rad_mobile;
    $rad_desktop = ! empty( $attributes['desktopBorderRadius'] ) ? $sgb_radius_css( $attributes['desktopBorderRadius'] ) : $rad_tablet;

    // Borders
    $border_mobile = sgb_get_border_styles( $attributes['border'] ?? [] );
    $border_tablet = sgb_get_border_styles( $attributes['tabletBorder'] ?? [], true ); // true for !important
    $border_desktop = sgb_get_border_styles( $attributes['desktopBorder'] ?? [], true ); // true for !important

    // Helper for Flex/Width Calc
    $get_flex = function($w) {
        if ($w <= 0) return '1 1 0px';
        return "0 0 calc({$w}% - (var(--current-gap) * " . (100 - $w) / 100 . "))";
    };
    $get_max_w = function($w) {
        if ($w <= 0) return 'none';
        return "calc({$w}% - (var(--current-gap) * " . (100 - $w) / 100 . "))";
    };

    // Unique ID for this block instance
    $block_id = 'sgb-column-' . wp_generate_uuid4();

    $has_advanced_layout =
        ! empty( $attributes['extendTop'] )    || ! empty( $attributes['extendBottom'] )    ||
        ! empty( $attributes['tabExtendTop'] ) || ! empty( $attributes['tabExtendBottom'] ) ||
        ! empty( $attributes['deskExtendTop'] )|| ! empty( $attributes['deskExtendBottom'] )||
        ! empty( $attributes['translateX'] )   || ! empty( $attributes['translateY'] )      ||
        ! empty( $attributes['tabTranslateX'] )|| ! empty( $attributes['tabTranslateY'] )   ||
        ! empty( $attributes['deskTranslateX'] )|| ! empty( $attributes['deskTranslateY'] );

    // Helper to format border vars for PHP
    $get_border_vars = function($b, $prefix) {
        $vars = [];
        if ( empty($b) ) return $vars;

        if ( isset($b['width']) || isset($b['style']) || isset($b['color']) ) {
            $vars["--col-border-width-{$prefix}"] = $b['width'] ?? '';
            $vars["--col-border-style-{$prefix}"] = !empty($b['style']) ? $b['style'] : 'solid';
            $vars["--col-border-color-{$prefix}"] = $b['color'] ?? '';
        } else {
            foreach (['top', 'right', 'bottom', 'left'] as $side) {
                if ( isset($b[$side]) && (!empty($b[$side]['width']) || !empty($b[$side]['style']) || !empty($b[$side]['color'])) ) {
                    $vars["--col-border-{$side}-width-{$prefix}"] = $b[$side]['width'] ?? '';
                    $vars["--col-border-{$side}-style-{$prefix}"] = !empty($b[$side]['style']) ? $b[$side]['style'] : 'solid';
                    $vars["--col-border-{$side}-color-{$prefix}"] = $b[$side]['color'] ?? '';
                }
            }
        }
        return $vars;
    };

    $border_vars_mobile = $get_border_vars( $attributes['border'] ?? [], 'mobile' );
    $border_vars_tablet = $get_border_vars( $attributes['tabletBorder'] ?? [], 'tablet' );
    $border_vars_desktop = $get_border_vars( $attributes['desktopBorder'] ?? [], 'desktop' );

    $all_vars = array_merge(
        [
            '--col-pad-mobile' => $css_pad_mobile,
            '--col-pad-tablet' => $css_pad_tablet,
            '--col-pad-desktop' => $css_pad_desktop,
            '--col-w-mobile' => $w_mobile,
            '--col-w-tablet' => $w_tablet,
            '--col-w-desktop' => $w_desktop,
            '--col-valign-mobile' => $va_mobile,
            '--col-valign-tablet' => $va_tablet,
            '--col-valign-desktop' => $va_desktop,
            '--col-inner-max-mobile' => $imw_mobile,
            '--col-inner-max-tablet' => $imw_tablet,
            '--col-inner-max-desktop' => $imw_desktop,
            '--col-halign-mobile' => $ha_mobile,
            '--col-halign-tablet' => $ha_tablet,
            '--col-halign-desktop' => $ha_desktop,
            '--col-bg-image-mobile' => $bg_img_base,
            '--col-bg-image-tablet' => $bg_img_tab,
            '--col-bg-image-desktop' => $bg_img_desk,
            '--col-bg-color-mobile' => $bg_col_base,
            '--col-bg-color-tablet' => $bg_col_tab,
            '--col-bg-color-desktop' => $bg_col_desk,
            '--base-ext-top' => $ext_t_base,
            '--base-ext-bottom' => $ext_b_base,
            '--base-trans-x' => $tra_x_base,
            '--base-trans-y' => $tra_y_base,
            '--tab-ext-top' => $ext_t_tab,
            '--tab-ext-bottom' => $ext_b_tab,
            '--tab-trans-x' => $tra_x_tab,
            '--tab-trans-y' => $tra_y_tab,
            '--desk-ext-top' => $ext_t_desk,
            '--desk-ext-bottom' => $ext_b_desk,
            '--desk-trans-x' => $tra_x_desk,
            '--desk-trans-y' => $tra_y_desk,
            '--col-order-mobile' => $order_mobile,
            '--col-order-tablet' => $order_tablet,
            '--col-order-desktop' => $order_desktop,
            '--col-zindex-mobile' => $z_mobile,
            '--col-zindex-tablet' => $z_tablet,
            '--col-zindex-desktop' => $z_desktop,
            '--col-radius-mobile' => $rad_mobile,
            '--col-radius-tablet' => $rad_tablet,
            '--col-radius-desktop' => $rad_desktop,
        ],
        $border_vars_mobile,
        $border_vars_tablet,
        $border_vars_desktop
    );

    $style_vars_str = '';
    foreach ($all_vars as $k => $v) {
        if ($v !== '') {
            $style_vars_str .= "{$k}: {$v}; ";
        }
    }

    $style = sprintf(
        '%s' .
        '--col-current-pad: var(--col-pad-mobile); ' .
        '--current-valign: var(--col-valign-mobile); ' .
        '--current-inner-max: var(--col-inner-max-mobile); ' .
        '--current-halign: var(--col-halign-mobile); ' .
        '--current-bg-image: var(--col-bg-image-mobile); --current-bg-color: var(--col-bg-color-mobile); ' .
        '--curr-ext-top: var(--base-ext-top); --curr-ext-bottom: var(--base-ext-bottom); ' .
        '--curr-trans-x: var(--base-trans-x); --curr-trans-y: var(--base-trans-y); ' .
        '--current-order: var(--col-order-mobile); --current-z-index: var(--col-zindex-mobile); --current-radius: var(--col-radius-mobile); ' .
        'flex: %s; max-width: %s; padding: var(--col-current-pad); position: relative; min-width: 0; display: flex; flex-direction: column; justify-content: var(--current-valign); align-items: stretch; box-sizing: border-box; background-color: var(--current-bg-color); order: var(--current-order); z-index: var(--current-z-index); border-radius: var(--current-radius);',
        $style_vars_str,
        $get_flex($w_mobile), $get_max_w($w_mobile)
    );

    $wrapper_attributes = get_block_wrapper_attributes( [
        'style' => $style,
        'class' => $block_id . ( $has_advanced_layout ? ' has-advanced-layout' : '' ),
    ] );

    ob_start();
    ?>
    <div <?php echo $wrapper_attributes; ?>>
        <style>
            .<?php echo $block_id; ?> {
                border-top-width: var(--col-border-top-width-mobile, var(--col-border-width-mobile));
                border-top-style: var(--col-border-top-style-mobile, var(--col-border-style-mobile));
                border-top-color: var(--col-border-top-color-mobile, var(--col-border-color-mobile));
                border-right-width: var(--col-border-right-width-mobile, var(--col-border-width-mobile));
                border-right-style: var(--col-border-right-style-mobile, var(--col-border-style-mobile));
                border-right-color: var(--col-border-right-color-mobile, var(--col-border-color-mobile));
                border-bottom-width: var(--col-border-bottom-width-mobile, var(--col-border-width-mobile));
                border-bottom-style: var(--col-border-bottom-style-mobile, var(--col-border-style-mobile));
                border-bottom-color: var(--col-border-bottom-color-mobile, var(--col-border-color-mobile));
                border-left-width: var(--col-border-left-width-mobile, var(--col-border-width-mobile));
                border-left-style: var(--col-border-left-style-mobile, var(--col-border-style-mobile));
                border-left-color: var(--col-border-left-color-mobile, var(--col-border-color-mobile));
            }
            @media (min-width: <?php echo $tablet_bp; ?>px) {
                .wp-block-<?php echo $namespace; ?>-column.<?php echo $block_id; ?> {
                    flex: <?php echo $get_flex($w_tablet); ?> !important;
                    max-width: <?php echo $get_max_w($w_tablet); ?> !important;
                    --col-current-pad: var(--col-pad-tablet);
                    --current-valign: var(--col-valign-tablet);
                    --current-inner-max: var(--col-inner-max-tablet);
                    --current-halign: var(--col-halign-tablet);
                    --current-bg-image: var(--col-bg-image-tablet);
                    --current-bg-color: var(--col-bg-color-tablet);
                    --curr-ext-top: var(--tab-ext-top) !important;
                    --curr-ext-bottom: var(--tab-ext-bottom) !important;
                    --curr-trans-x: var(--tab-trans-x);
                    --curr-trans-y: var(--tab-trans-y);
                    --current-order: var(--col-order-tablet) !important;
                    --current-z-index: var(--col-zindex-tablet) !important;
                    --current-radius: var(--col-radius-tablet) !important;
                    border-top-width: var(--col-border-top-width-tablet, var(--col-border-width-tablet, var(--col-border-top-width-mobile, var(--col-border-width-mobile)))) !important;
                    border-top-style: var(--col-border-top-style-tablet, var(--col-border-style-tablet, var(--col-border-top-style-mobile, var(--col-border-style-mobile)))) !important;
                    border-top-color: var(--col-border-top-color-tablet, var(--col-border-color-tablet, var(--col-border-top-color-mobile, var(--col-border-color-mobile)))) !important;
                    border-right-width: var(--col-border-right-width-tablet, var(--col-border-width-tablet, var(--col-border-right-width-mobile, var(--col-border-width-mobile)))) !important;
                    border-right-style: var(--col-border-right-style-tablet, var(--col-border-style-tablet, var(--col-border-right-style-mobile, var(--col-border-style-mobile)))) !important;
                    border-right-color: var(--col-border-right-color-tablet, var(--col-border-color-tablet, var(--col-border-right-color-mobile, var(--col-border-color-mobile)))) !important;
                    border-bottom-width: var(--col-border-bottom-width-tablet, var(--col-border-width-tablet, var(--col-border-bottom-width-mobile, var(--col-border-width-mobile)))) !important;
                    border-bottom-style: var(--col-border-bottom-style-tablet, var(--col-border-style-tablet, var(--col-border-bottom-style-mobile, var(--col-border-style-mobile)))) !important;
                    border-bottom-color: var(--col-border-bottom-color-tablet, var(--col-border-color-tablet, var(--col-border-bottom-color-mobile, var(--col-border-color-mobile)))) !important;
                    border-left-width: var(--col-border-left-width-tablet, var(--col-border-width-tablet, var(--col-border-left-width-mobile, var(--col-border-width-mobile)))) !important;
                    border-left-style: var(--col-border-left-style-tablet, var(--col-border-style-tablet, var(--col-border-left-style-mobile, var(--col-border-style-mobile)))) !important;
                    border-left-color: var(--col-border-left-color-tablet, var(--col-border-color-tablet, var(--col-border-left-color-mobile, var(--col-border-color-mobile)))) !important;
                }
            }
            @media (min-width: <?php echo $desktop_bp; ?>px) {
                .wp-block-<?php echo $namespace; ?>-column.<?php echo $block_id; ?> {
                    flex: <?php echo $get_flex($w_desktop); ?> !important;
                    max-width: <?php echo $get_max_w($w_desktop); ?> !important;
                    --col-current-pad: var(--col-pad-desktop);
                    --current-valign: var(--col-valign-desktop);
                    --current-inner-max: var(--col-inner-max-desktop);
                    --current-halign: var(--col-halign-desktop);
                    --current-bg-image: var(--col-bg-image-desktop);
                    --current-bg-color: var(--col-bg-color-desktop);
                    --curr-ext-top: var(--desk-ext-top) !important;
                    --curr-ext-bottom: var(--desk-ext-bottom) !important;
                    --curr-trans-x: var(--desk-trans-x);
                    --curr-trans-y: var(--desk-trans-y);
                    --current-order: var(--col-order-desktop) !important;
                    --current-z-index: var(--col-zindex-desktop) !important;
                    --current-radius: var(--col-radius-desktop) !important;
                    border-top-width: var(--col-border-top-width-desktop, var(--col-border-width-desktop, var(--col-border-top-width-tablet, var(--col-border-width-tablet, var(--col-border-top-width-mobile, var(--col-border-width-mobile)))))) !important;
                    border-top-style: var(--col-border-top-style-desktop, var(--col-border-style-desktop, var(--col-border-top-style-tablet, var(--col-border-style-tablet, var(--col-border-top-style-mobile, var(--col-border-style-mobile)))))) !important;
                    border-top-color: var(--col-border-top-color-desktop, var(--col-border-color-desktop, var(--col-border-top-color-tablet, var(--col-border-color-tablet, var(--col-border-top-color-mobile, var(--col-border-color-mobile)))))) !important;
                    border-right-width: var(--col-border-right-width-desktop, var(--col-border-width-desktop, var(--col-border-right-width-tablet, var(--col-border-width-tablet, var(--col-border-right-width-mobile, var(--col-border-width-mobile)))))) !important;
                    border-right-style: var(--col-border-right-style-desktop, var(--col-border-style-desktop, var(--col-border-right-style-tablet, var(--col-border-style-tablet, var(--col-border-right-style-mobile, var(--col-border-style-mobile)))))) !important;
                    border-right-color: var(--col-border-right-color-desktop, var(--col-border-color-desktop, var(--col-border-right-color-tablet, var(--col-border-color-tablet, var(--col-border-right-color-mobile, var(--col-border-color-mobile)))))) !important;
                    border-bottom-width: var(--col-border-bottom-width-desktop, var(--col-border-width-desktop, var(--col-border-bottom-width-tablet, var(--col-border-width-tablet, var(--col-border-bottom-width-mobile, var(--col-border-width-mobile)))))) !important;
                    border-bottom-style: var(--col-border-bottom-style-desktop, var(--col-border-style-desktop, var(--col-border-bottom-style-tablet, var(--col-border-style-tablet, var(--col-border-bottom-style-mobile, var(--col-border-style-mobile)))))) !important;
                    border-bottom-color: var(--col-border-bottom-color-desktop, var(--col-border-color-desktop, var(--col-border-bottom-color-tablet, var(--col-border-color-tablet, var(--col-border-bottom-color-mobile, var(--col-border-color-mobile)))))) !important;
                    border-left-width: var(--col-border-left-width-desktop, var(--col-border-width-desktop, var(--col-border-left-width-tablet, var(--col-border-width-tablet, var(--col-border-left-width-mobile, var(--col-border-width-mobile)))))) !important;
                    border-left-style: var(--col-border-left-style-desktop, var(--col-border-style-desktop, var(--col-border-left-style-tablet, var(--col-border-style-tablet, var(--col-border-left-style-mobile, var(--col-border-style-mobile)))))) !important;
                    border-left-color: var(--col-border-left-color-desktop, var(--col-border-color-desktop, var(--col-border-left-color-tablet, var(--col-border-color-tablet, var(--col-border-left-color-mobile, var(--col-border-color-mobile)))))) !important;
                }
            }
        </style>

        <div
            class="<?php echo esc_attr( $namespace ); ?>-background-layer"
            style="position: absolute; inset: 0; pointer-events: none; z-index: 0; border-radius: inherit; background-image: var(--current-bg-image); background-size: <?php echo esc_attr( $bg_size ); ?>; background-position: <?php echo esc_attr( $bg_position ); ?>; background-repeat: <?php echo esc_attr( $bg_repeat ); ?>; background-attachment: <?php echo esc_attr( $bg_attachment ); ?>; opacity: <?php echo esc_attr( $bg_opacity / 100 ); ?>;"
        ></div>

        <div style="position: relative; z-index: 1; width: 100%; min-width: 0; max-width: var(--current-inner-max); align-self: var(--current-halign); box-sizing: border-box;">
            <?php echo $content; ?>
        </div>
    </div>
    <?php
    return ob_get_clean();
};
