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

    // Border Radius
    $rad_mobile = isset( $attributes['borderRadius'] ) ? $attributes['borderRadius'] : '0px';
    $rad_tablet = ! empty( $attributes['tabletBorderRadius'] ) ? $attributes['tabletBorderRadius'] : $rad_mobile;
    $rad_desktop = ! empty( $attributes['desktopBorderRadius'] ) ? $attributes['desktopBorderRadius'] : $rad_tablet;

    // Borders
    $border_mobile = sgb_get_border_styles( $attributes['border'] ?? [] );
    $border_tablet = sgb_get_border_styles( $attributes['tabletBorder'] ?? [] );
    $border_desktop = sgb_get_border_styles( $attributes['desktopBorder'] ?? [] );

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

    $style = sprintf(
        '--col-pad-mobile: %s; --col-pad-tablet: %s; --col-pad-desktop: %s; ' .
        '--col-w-mobile: %s; --col-w-tablet: %s; --col-w-desktop: %s; ' .
        '--col-valign-mobile: %s; --col-valign-tablet: %s; --col-valign-desktop: %s; ' .
        '--col-inner-max-mobile: %s; --col-inner-max-tablet: %s; --col-inner-max-desktop: %s; ' .
        '--col-halign-mobile: %s; --col-halign-tablet: %s; --col-halign-desktop: %s; ' .
        '--col-bg-image-mobile: %s; --col-bg-image-tablet: %s; --col-bg-image-desktop: %s; ' .
        '--col-bg-color-mobile: %s; --col-bg-color-tablet: %s; --col-bg-color-desktop: %s; ' .
        '--base-ext-top: %s; --base-ext-bottom: %s; --base-trans-x: %s; --base-trans-y: %s; ' .
        '--tab-ext-top: %s; --tab-ext-bottom: %s; --tab-trans-x: %s; --tab-trans-y: %s; ' .
        '--desk-ext-top: %s; --desk-ext-bottom: %s; --desk-trans-x: %s; --desk-trans-y: %s; ' .
        '--col-current-pad: var(--col-pad-mobile); ' .
        '--current-valign: var(--col-valign-mobile); ' .
        '--current-inner-max: var(--col-inner-max-mobile); ' .
        '--current-halign: var(--col-halign-mobile); ' .
        '--current-bg-image: var(--col-bg-image-mobile); --current-bg-color: var(--col-bg-color-mobile); ' .
        '--curr-ext-top: var(--base-ext-top); --curr-ext-bottom: var(--base-ext-bottom); ' .
        '--curr-trans-x: var(--base-trans-x); --curr-trans-y: var(--base-trans-y); ' .
        '--current-order: %d; --current-z-index: %d; --current-radius: %s; ' .
        'flex: %s; max-width: %s; padding: var(--col-current-pad); position: relative; min-width: 0; display: flex; flex-direction: column; justify-content: var(--current-valign); align-items: stretch; box-sizing: border-box; background-color: var(--current-bg-color); order: var(--current-order); z-index: var(--current-z-index); border-radius: var(--current-radius); %s',
        esc_attr($css_pad_mobile), esc_attr($css_pad_tablet), esc_attr($css_pad_desktop),
        $w_mobile, $w_tablet, $w_desktop,
        esc_attr($va_mobile), esc_attr($va_tablet), esc_attr($va_desktop),
        esc_attr($imw_mobile), esc_attr($imw_tablet), esc_attr($imw_desktop),
        esc_attr($ha_mobile), esc_attr($ha_tablet), esc_attr($ha_desktop),
        esc_attr($bg_img_base), esc_attr($bg_img_tab), esc_attr($bg_img_desk),
        esc_attr($bg_col_base), esc_attr($bg_col_tab), esc_attr($bg_col_desk),
        esc_attr($ext_t_base), esc_attr($ext_b_base), esc_attr($tra_x_base), esc_attr($tra_y_base),
        esc_attr($ext_t_tab), esc_attr($ext_b_tab), esc_attr($tra_x_tab), esc_attr($tra_y_tab),
        esc_attr($ext_t_desk), esc_attr($ext_b_desk), esc_attr($tra_x_desk), esc_attr($tra_y_desk),
        $order_mobile, $z_mobile, esc_attr($rad_mobile),
        $get_flex($w_mobile), $get_max_w($w_mobile),
        $border_mobile
    );

    $wrapper_attributes = get_block_wrapper_attributes( [ 
        'style' => $style,
        'class' => $block_id
    ] );

    ob_start();
    ?>
    <div <?php echo $wrapper_attributes; ?>>
        <style>
            @media (min-width: <?php echo $tablet_bp; ?>px) {
                .<?php echo $block_id; ?> {
                    flex: <?php echo $get_flex($w_tablet); ?> !important;
                    max-width: <?php echo $get_max_w($w_tablet); ?> !important;
                    --col-current-pad: var(--col-pad-tablet);
                    --current-valign: var(--col-valign-tablet);
                    --current-inner-max: var(--col-inner-max-tablet);
                    --current-halign: var(--col-halign-tablet);
                    --current-bg-image: var(--col-bg-image-tablet);
                    --current-bg-color: var(--col-bg-color-tablet);
                    --curr-ext-top: var(--tab-ext-top);
                    --curr-ext-bottom: var(--tab-ext-bottom);
                    --curr-trans-x: var(--tab-trans-x);
                    --curr-trans-y: var(--tab-trans-y);
                    --current-order: <?php echo $order_tablet; ?>;
                    --current-z-index: <?php echo $z_tablet; ?>;
                    --current-radius: <?php echo esc_attr($rad_tablet); ?>;
                    <?php echo $border_tablet ? $border_tablet : ''; ?>
                }
            }
            @media (min-width: <?php echo $desktop_bp; ?>px) {
                .<?php echo $block_id; ?> {
                    flex: <?php echo $get_flex($w_desktop); ?> !important;
                    max-width: <?php echo $get_max_w($w_desktop); ?> !important;
                    --col-current-pad: var(--col-pad-desktop);
                    --current-valign: var(--col-valign-desktop);
                    --current-inner-max: var(--col-inner-max-desktop);
                    --current-halign: var(--col-halign-desktop);
                    --current-bg-image: var(--col-bg-image-desktop);
                    --current-bg-color: var(--col-bg-color-desktop);
                    --curr-ext-top: var(--desk-ext-top);
                    --curr-ext-bottom: var(--desk-ext-bottom);
                    --curr-trans-x: var(--desk-trans-x);
                    --curr-trans-y: var(--desk-trans-y);
                    --current-order: <?php echo $order_desktop; ?>;
                    --current-z-index: <?php echo $z_desktop; ?>;
                    --current-radius: <?php echo esc_attr($rad_desktop); ?>;
                    <?php echo $border_desktop ? $border_desktop : ''; ?>
                }
            }
        </style>

        <div
            class="<?php echo esc_attr( $namespace ); ?>-background-layer"
            style="position: absolute; inset: 0; pointer-events: none; z-index: 0; background-image: var(--current-bg-image); background-size: <?php echo esc_attr( $bg_size ); ?>; background-position: <?php echo esc_attr( $bg_position ); ?>; background-repeat: <?php echo esc_attr( $bg_repeat ); ?>; background-attachment: <?php echo esc_attr( $bg_attachment ); ?>; opacity: <?php echo esc_attr( $bg_opacity / 100 ); ?>;"
        ></div>

        <div style="position: relative; z-index: 1; width: 100%; min-width: 0; max-width: var(--current-inner-max); align-self: var(--current-halign); box-sizing: border-box;">
            <?php echo $content; ?>
        </div>
    </div>
    <?php
    return ob_get_clean();
};
