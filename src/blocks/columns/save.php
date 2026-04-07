<?php
defined('ABSPATH') || exit;

return function( $attributes, $content ) {
    $namespace = SGB_NS;

    // Core Settings
    $columns        = isset( $attributes['columns'] ) ? $attributes['columns'] : 2;
    $align          = isset( $attributes['horizontalAlignment'] ) ? $attributes['horizontalAlignment'] : 'center';

    // Base (Mobile) Attributes
    $mobile_gap = isset( $attributes['mobileGap'] ) ? $attributes['mobileGap'] : 20;
    $default_mobile_padding = [
        'top'    => '20px',
        'right'  => '20px',
        'bottom' => '20px',
        'left'   => '20px'
    ];
    $mobile_padding = isset( $attributes['mobilePadding'] ) ? $attributes['mobilePadding'] : $default_mobile_padding;
    $mobile_max = ! empty( $attributes['mobileMaxWidth'] ) ? (int) $attributes['mobileMaxWidth'] : 0;

    // Mobile Max Height Base
    $mobile_max_height = ! empty( $attributes['mobileMaxHeight'] ) ? (int) $attributes['mobileMaxHeight'] : 0;

    // Override (Desktop) Attributes & Detections
    $has_desk_gap = isset( $attributes['gap'] ) && $attributes['gap'] !== '';
    $has_desk_max = ! empty( $attributes['desktopMaxWidth'] );
    $has_desk_pad = ! empty( $attributes['padding'] ) && count( array_filter( (array) $attributes['padding'] ) ) > 0;

    // Desktop Max Height Override Detection
    $has_desk_max_height = ! empty( $attributes['desktopMaxHeight'] );

    // Background Attributes
    $bg_image       = isset( $attributes['backgroundImage'] ) ? $attributes['backgroundImage'] : '';
    $bg_color       = isset( $attributes['backgroundColor'] ) ? $attributes['backgroundColor'] : '';
    $bg_opacity     = isset( $attributes['backgroundImageOpacity'] ) ? $attributes['backgroundImageOpacity'] : 100;
    $bg_size        = isset( $attributes['backgroundSize'] ) ? $attributes['backgroundSize'] : 'cover';
    $bg_position    = isset( $attributes['backgroundPosition'] ) ? $attributes['backgroundPosition'] : 'center';
    $bg_repeat      = isset( $attributes['backgroundRepeat'] ) ? $attributes['backgroundRepeat'] : 'no-repeat';
    $bg_parallax    = ! empty( $attributes['backgroundFixedPosition'] );
    $bg_attachment  = $bg_parallax ? 'fixed' : 'scroll';

    // Calculate Mobile CSS Variables
    $css_gap_mobile = $mobile_gap . 'px';
    $css_pad_mobile = sgb_get_padding_str( $mobile_padding, '0px' );
    $css_max_mobile = $mobile_max === 0 ? 'none' : $mobile_max . 'px';
    $css_max_height_mobile = $mobile_max_height === 0 ? 'none' : $mobile_max_height . 'px'; // NEW

    // Calculate Desktop CSS Variables (Fall back to mobile if unset)
    $css_gap_desktop = $has_desk_gap ? $attributes['gap'] . 'px' : 'var(--gap-mobile)';
    $css_pad_desktop = $has_desk_pad ? sgb_get_padding_str( $attributes['padding'], '0px' ) : 'var(--pad-mobile)';
    $css_max_desktop = $has_desk_max ? $attributes['desktopMaxWidth'] . 'px' : 'var(--max-width-mobile)';
    $css_max_height_desktop = $has_desk_max_height ? $attributes['desktopMaxHeight'] . 'px' : 'var(--max-height-mobile)'; // NEW

    // Alignment Margins
    $margin_left  = $align === 'left' ? '0' : 'auto';
    $margin_right = $align === 'right' ? '0' : 'auto';

    // Build Wrapper Styles (Added max-height variables and applied max-height CSS property)
    $style = sprintf(
        '--gap-desktop: %s; --gap-mobile: %s; --pad-desktop: %s; --pad-mobile: %s; --max-width-desktop: %s; --max-width-mobile: %s; --max-height-desktop: %s; --max-height-mobile: %s; --current-gap: var(--gap-desktop); --current-pad: var(--pad-desktop); --current-max-width: var(--max-width-desktop); --current-max-height: var(--max-height-desktop); padding: var(--current-pad); position: relative; max-height: var(--current-max-height);',
        esc_attr( $css_gap_desktop ),
        esc_attr( $css_gap_mobile ),
        esc_attr( $css_pad_desktop ),
        esc_attr( $css_pad_mobile ),
        esc_attr( $css_max_desktop ),
        esc_attr( $css_max_mobile ),
        "none",
        "none"
    );

    if ( ! empty( $bg_color ) ) {
        $style .= ' background-color: ' . esc_attr( $bg_color ) . ';';
    }

    $wrapper_attributes = get_block_wrapper_attributes( [
        'style' => $style,
    ] );

    // Build Inner Styles
    $inner_style = sprintf(
        'display:flex; flex-wrap:wrap; justify-content:flex-start; align-items:stretch; gap:var(--current-gap); position:relative; z-index:1; max-width:var(--current-max-width); margin-left:%s; margin-right:%s; box-sizing:border-box;',
        esc_attr( $margin_left ),
        esc_attr( $margin_right )
    );

    $encoded_attributes = htmlspecialchars( wp_json_encode( $attributes ), ENT_QUOTES, 'UTF-8' );

    ob_start();
    ?>
    <div <?php echo $wrapper_attributes; ?>>
        <div data-attributes="<?php echo $encoded_attributes; ?>" class="<?php echo esc_attr( $namespace ); ?>-block__mount"></div>

        <?php if ( ! empty( $bg_image ) ) : ?>
            <div
                class="<?php echo esc_attr( $namespace ); ?>-background-layer"
                style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; pointer-events: none; z-index: 0; background-image: url('<?php echo esc_url( $bg_image ); ?>'); background-size: <?php echo esc_attr( $bg_size ); ?>; background-position: <?php echo esc_attr( $bg_position ); ?>; background-repeat: <?php echo esc_attr( $bg_repeat ); ?>; background-attachment: <?php echo esc_attr( $bg_attachment ); ?>; opacity: <?php echo esc_attr( $bg_opacity / 100 ); ?>;"
            ></div>
        <?php endif; ?>

        <div class="<?php echo esc_attr( $namespace ); ?>-columns-inner" style="<?php echo esc_attr( $inner_style ); ?>">
            <?php echo $content; ?>
        </div>
    </div>
    <?php
    return ob_get_clean();
};
