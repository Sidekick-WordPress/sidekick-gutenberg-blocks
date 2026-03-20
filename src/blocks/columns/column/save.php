<?php
defined('ABSPATH') || exit;

return function( $attributes, $content ) {
    $v_align = isset( $attributes['vAlign'] ) ? $attributes['vAlign'] : 'flex-start';
    $width   = isset( $attributes['width'] ) ? (float) $attributes['width'] : 0;
    $mobile_order = isset( $attributes['mobileOrder'] ) ? (int) $attributes['mobileOrder'] : 0;

    $default_mobile_padding = [
        'top'    => '10px',
        'right'  => '10px',
        'bottom' => '10px',
        'left'   => '10px'
    ];
    $mobile_padding = isset( $attributes['mobilePadding'] ) ? $attributes['mobilePadding'] : $default_mobile_padding;
    $has_desk_pad = ! empty( $attributes['padding'] ) && count( array_filter( (array) $attributes['padding'] ) ) > 0;

    $css_pad_mobile  = sgb_get_padding_str( $mobile_padding, '10px' );
    $css_pad_desktop = $has_desk_pad ? sgb_get_padding_str( $attributes['padding'], '10px' ) : 'var(--col-pad-mobile)';

    $precise_width = $width;
    $precision_map = [
        16 => 16.666667,
        17 => 16.666667,
        33 => 33.333333,
        66 => 66.666667,
        67 => 66.666667,
        83 => 83.333333,
    ];

    // Check if the integer width exists in our map
    if ( array_key_exists( (int) $width, $precision_map ) ) {
        $precise_width = $precision_map[ (int) $width ];
    }

    if ( $width > 0 ) {
        // Use the mapped precise width for the frontend calculation
        $computed_width = sprintf( 'calc(%s%% - (var(--current-gap) * (100 - %s) / 100))', $precise_width, $precise_width );
        $flex_style = '0 0 auto';
    } else {
        $computed_width = 'auto';
        $flex_style = '1 1 0%';
    }

    $style = sprintf(
        '--col-pad-desktop: %s; --col-pad-mobile: %s; --col-current-pad: var(--col-pad-desktop); --mobile-order: %d; padding: var(--col-current-pad); display: flex; flex-direction: column; justify-content: %s; align-items: stretch; width: %s; flex: %s;',
        esc_attr( $css_pad_desktop ),
        esc_attr( $css_pad_mobile ),
        $mobile_order, // <--- Add here
        esc_attr( $v_align ),
        $width > 0 ? esc_attr( $computed_width ) : 'auto',
        esc_attr( $flex_style )
    );

    $wrapper_attributes = get_block_wrapper_attributes( [
        'style' => $style,
    ] );

    ob_start();
    ?>
    <div <?php echo $wrapper_attributes; ?>>
        <?php echo $content; ?>
    </div>
    <?php
    return ob_get_clean();
};
