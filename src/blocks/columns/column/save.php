<?php
defined('ABSPATH') || exit;

return function( $attributes, $content ) {
    $v_align      = isset( $attributes['vAlign'] ) ? $attributes['vAlign'] : 'flex-start';
    $width        = isset( $attributes['width'] ) ? (float) $attributes['width'] : 0;
    $mobile_order = isset( $attributes['mobileOrder'] ) ? (int) $attributes['mobileOrder'] : 0;

    $bg_image      = isset( $attributes['backgroundImage'] ) ? $attributes['backgroundImage'] : '';
    $bg_color      = isset( $attributes['backgroundColor'] ) ? $attributes['backgroundColor'] : '';
    $bg_opacity    = isset( $attributes['backgroundImageOpacity'] ) ? $attributes['backgroundImageOpacity'] : 100;
    $bg_size       = isset( $attributes['backgroundSize'] ) ? $attributes['backgroundSize'] : 'cover';
    $bg_position   = isset( $attributes['backgroundPosition'] ) ? $attributes['backgroundPosition'] : 'center';
    $bg_repeat     = isset( $attributes['backgroundRepeat'] ) ? $attributes['backgroundRepeat'] : 'no-repeat';
    $bg_attachment = ! empty( $attributes['backgroundFixedPosition'] ) ? 'fixed' : 'scroll';

    $default_mobile_padding = [
        'top'    => '10px',
        'right'  => '10px',
        'bottom' => '10px',
        'left'   => '10px'
    ];

    $mobile_padding = isset( $attributes['mobilePadding'] ) ? $attributes['mobilePadding'] : $default_mobile_padding;
    $has_desk_pad   = ! empty( $attributes['padding'] ) && count( array_filter( (array) $attributes['padding'] ) ) > 0;

    $css_pad_mobile  = sgb_get_padding_str( $mobile_padding, '10px' );
    $css_pad_desktop = $has_desk_pad ? sgb_get_padding_str( $attributes['padding'], '10px' ) : 'var(--col-pad-mobile)';

    if ( $width > 0 ) {
        $computed_width = sprintf(
            'calc(%1$s%% - (var(--current-gap) * %2$s))',
            $width,
            ( 100 - $width ) / 100
        );
        $flex_style      = '0 0 ' . $computed_width;
        $max_width_style = $computed_width;
    } else {
        $flex_style      = '1 1 0px';
        $max_width_style = 'none';
    }

    $style = sprintf(
        '--col-pad-desktop:%s; --col-pad-mobile:%s; --col-current-pad:var(--col-pad-desktop); --mobile-order:%d; padding:var(--col-current-pad); display:flex; flex-direction:column; justify-content:%s; align-items:stretch; flex:%s; max-width:%s; box-sizing:border-box; position:relative; overflow:hidden; min-width:0;',
        esc_attr( $css_pad_desktop ),
        esc_attr( $css_pad_mobile ),
        $mobile_order,
        esc_attr( $v_align ),
        esc_attr( $flex_style ),
        esc_attr( $max_width_style )
    );

    $wrapper_attributes = get_block_wrapper_attributes( [
        'style' => $style,
    ] );

    ob_start();
    ?>
    <div <?php echo $wrapper_attributes; ?>>
        <?php if ( ! empty( $bg_color ) ) : ?>
            <div
                class="u-full_cover_absolute"
                style="background-color: <?php echo esc_attr( $bg_color ); ?>; pointer-events:none; z-index:0;"
            ></div>
        <?php endif; ?>

        <?php if ( ! empty( $bg_image ) ) : ?>
            <div
                class="u-full_cover_absolute"
                style="background-image:url('<?php echo esc_url( $bg_image ); ?>'); background-size:<?php echo esc_attr( $bg_size ); ?>; background-position:<?php echo esc_attr( $bg_position ); ?>; background-repeat:<?php echo esc_attr( $bg_repeat ); ?>; background-attachment:<?php echo esc_attr( $bg_attachment ); ?>; opacity:<?php echo esc_attr( $bg_opacity / 100 ); ?>; pointer-events:none; z-index:0;"
            ></div>
        <?php endif; ?>

        <div style="position:relative; z-index:1; width:100%; min-width:0;">
            <?php echo $content; ?>
        </div>
    </div>
    <?php
    return ob_get_clean();
};
