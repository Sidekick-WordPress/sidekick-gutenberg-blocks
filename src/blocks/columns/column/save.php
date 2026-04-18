<?php
defined('ABSPATH') || exit;

return function( $attributes, $content ) {
    $namespace = SGB_NS;

    $v_align      = isset( $attributes['vAlign'] ) ? $attributes['vAlign'] : 'flex-start';
    $width        = isset( $attributes['width'] ) ? (float) $attributes['width'] : 0;
    $mobile_order = isset( $attributes['mobileOrder'] ) ? (int) $attributes['mobileOrder'] : 0;

    $bg_video      = isset( $attributes['backgroundVideo'] ) ? $attributes['backgroundVideo'] : '';
    $video_opacity = isset( $attributes['backgroundVideoOpacity'] ) ? $attributes['backgroundVideoOpacity'] : 100;
    $bg_image      = isset( $attributes['backgroundImage'] ) ? $attributes['backgroundImage'] : '';
    $bg_color      = isset( $attributes['backgroundColor'] ) ? $attributes['backgroundColor'] : '';
    $bg_opacity    = isset( $attributes['backgroundImageOpacity'] ) ? $attributes['backgroundImageOpacity'] : 100;
    $bg_size       = isset( $attributes['backgroundSize'] ) ? $attributes['backgroundSize'] : 'cover';
    $bg_position   = isset( $attributes['backgroundPosition'] ) ? $attributes['backgroundPosition'] : 'center';
    $bg_repeat     = isset( $attributes['backgroundRepeat'] ) ? $attributes['backgroundRepeat'] : 'no-repeat';
    $bg_attachment = ! empty( $attributes['backgroundFixedPosition'] ) ? 'fixed' : 'scroll';

    $inner_max_width = isset( $attributes['innerMaxWidth'] ) ? $attributes['innerMaxWidth'] : '';
    $content_h_align = isset( $attributes['contentHAlign'] ) ? $attributes['contentHAlign'] : 'left';

    // Advanced Layout Check
    $is_advanced_layout = ! empty( $attributes['extendTop'] ) || ! empty( $attributes['extendBottom'] ) ||
        ! empty( $attributes['translateX'] ) || ! empty( $attributes['translateY'] ) ||
        ! empty( $attributes['deskExtendTop'] ) || ! empty( $attributes['deskExtendBottom'] ) ||
        ! empty( $attributes['deskTranslateX'] ) || ! empty( $attributes['deskTranslateY'] ) ||
        ( isset( $attributes['zIndex'] ) && $attributes['zIndex'] !== 1 );

    $classes = $is_advanced_layout ? 'has-advanced-layout' : '';

    // Border Processing
    $border_css = '';
    $border = isset( $attributes['border'] ) ? $attributes['border'] : null;
    if ( is_array( $border ) ) {
        if ( isset( $border['width'] ) || isset( $border['color'] ) || isset( $border['style'] ) ) {
            if ( ! empty( $border['width'] ) ) $border_css .= sprintf( 'border-width:%s;', esc_attr( $border['width'] ) );
            if ( ! empty( $border['style'] ) ) $border_css .= sprintf( 'border-style:%s;', esc_attr( $border['style'] ) );
            if ( ! empty( $border['color'] ) ) $border_css .= sprintf( 'border-color:%s;', esc_attr( $border['color'] ) );
        } else {
            $sides = ['top', 'right', 'bottom', 'left'];
            foreach ( $sides as $side ) {
                if ( isset( $border[ $side ] ) && is_array( $border[ $side ] ) ) {
                    if ( ! empty( $border[ $side ]['width'] ) ) $border_css .= sprintf( 'border-%s-width:%s;', $side, esc_attr( $border[ $side ]['width'] ) );
                    if ( ! empty( $border[ $side ]['style'] ) ) $border_css .= sprintf( 'border-%s-style:%s;', $side, esc_attr( $border[ $side ]['style'] ) );
                    if ( ! empty( $border[ $side ]['color'] ) ) $border_css .= sprintf( 'border-%s-color:%s;', $side, esc_attr( $border[ $side ]['color'] ) );
                }
            }
        }
    }

    $border_radius = isset( $attributes['borderRadius'] ) ? $attributes['borderRadius'] : '';
    if ( ! empty( $border_radius ) ) {
        $border_css .= ' border-radius:' . esc_attr( $border_radius ) . ';';
    }

    $default_mobile_padding = [ 'top' => '10px', 'right' => '10px', 'bottom' => '10px', 'left' => '10px' ];
    $mobile_padding = isset( $attributes['mobilePadding'] ) ? $attributes['mobilePadding'] : $default_mobile_padding;
    $has_desk_pad   = ! empty( $attributes['padding'] ) && count( array_filter( (array) $attributes['padding'] ) ) > 0;
    $css_pad_mobile  = sgb_get_padding_str( $mobile_padding, '10px' );
    $css_pad_desktop = $has_desk_pad ? sgb_get_padding_str( $attributes['padding'], '10px' ) : 'var(--col-pad-mobile)';

    if ( $width > 0 ) {
        $computed_width = sprintf( 'calc(%1$s%% - (var(--current-gap) * %2$s))', $width, ( 100 - $width ) / 100 );
        $flex_style      = '0 0 ' . $computed_width;
        $max_width_style = $computed_width;
    } else {
        $flex_style      = '1 1 0px';
        $max_width_style = 'none';
    }

    $styles = [
        '--col-pad-desktop:' . esc_attr( $css_pad_desktop ),
        '--col-pad-mobile:' . esc_attr( $css_pad_mobile ),
        '--col-current-pad:var(--col-pad-desktop)',
        '--mobile-order:' . $mobile_order,

        // Base Variables
        '--base-ext-top:' . esc_attr( !empty($attributes['extendTop']) ? $attributes['extendTop'] : '0px' ),
        '--base-ext-bottom:' . esc_attr( !empty($attributes['extendBottom']) ? $attributes['extendBottom'] : '0px' ),
        '--base-trans-x:' . esc_attr( !empty($attributes['translateX']) ? $attributes['translateX'] : '0px' ),
        '--base-trans-y:' . esc_attr( !empty($attributes['translateY']) ? $attributes['translateY'] : '0px' ),
    ];

    // Desktop Overrides
    if ( !empty($attributes['deskExtendTop']) )    $styles[] = '--desk-ext-top:' . esc_attr($attributes['deskExtendTop']);
    if ( !empty($attributes['deskExtendBottom']) ) $styles[] = '--desk-ext-bottom:' . esc_attr($attributes['deskExtendBottom']);
    if ( !empty($attributes['deskTranslateX']) )   $styles[] = '--desk-trans-x:' . esc_attr($attributes['deskTranslateX']);
    if ( !empty($attributes['deskTranslateY']) )   $styles[] = '--desk-trans-y:' . esc_attr($attributes['deskTranslateY']);

    array_push($styles,
        '--curr-ext-top:var(--base-ext-top)',
        '--curr-ext-bottom:var(--base-ext-bottom)',
        '--curr-trans-x:var(--base-trans-x)',
        '--curr-trans-y:var(--base-trans-y)',
        '--curr-z-index:' . (isset($attributes['zIndex']) ? (int)$attributes['zIndex'] : 1),

        // ONLY inline variables here. Math happens in the SCSS block.
        'padding:var(--col-current-pad)',
        'display:flex',
        'flex-direction:column',
        'justify-content:' . esc_attr($v_align),
        'align-items:stretch',
        'flex:' . esc_attr($flex_style),
        'max-width:' . esc_attr($max_width_style),
        'box-sizing:border-box',
        'position:relative',
        'overflow:hidden',
        'min-width:0'
    );

    $final_style = implode('; ', $styles) . '; ' . $border_css;

    $wrapper_attributes = get_block_wrapper_attributes( [
        'class' => trim( $classes ),
        'style' => $final_style,
    ] );

    $align_map = [
        'left'   => 'flex-start',
        'center' => 'center',
        'right'  => 'flex-end',
    ];
    $inner_align_self = isset( $align_map[ $content_h_align ] ) ? $align_map[ $content_h_align ] : 'flex-start';

    $inner_style = 'position:relative; z-index:1; width:100%; min-width:0;';
    if ( ! empty( $inner_max_width ) ) {
        $inner_style .= ' max-width:' . esc_attr( $inner_max_width ) . ';';
    }
    $inner_style .= ' align-self:' . esc_attr( $inner_align_self ) . ';';

    ob_start();
    ?>
    <div <?php echo $wrapper_attributes; ?>>
        <?php if ( ! empty( $bg_color ) ) : ?>
            <div
                class="u-full_cover_absolute"
                style="background-color: <?php echo esc_attr( $bg_color ); ?>; pointer-events:none; z-index:0;"
            ></div>
        <?php endif; ?>

        <?php
        // BACKGROUND VIDEO
        if ( ! empty( $bg_video ) ) :
            ?>
            <video
                class="u-full_cover_absolute"
                autoplay muted loop playsinline
                <?php if ( ! empty( $bg_image ) ) echo 'poster="' . esc_url( $bg_image ) . '"'; ?>
                style="width: 100%; height: 100%; object-fit: cover; opacity: <?php echo esc_attr( $video_opacity / 100 ); ?>; pointer-events:none; z-index:0;"
            >
                <source src="<?php echo esc_url( $bg_video ); ?>" type="video/mp4">
            </video>
        <?php
        // BACKGROUND IMAGE FALLBACK
        elseif ( ! empty( $bg_image ) ) :
            ?>
            <div
                class="u-full_cover_absolute"
                style="background-image:url('<?php echo esc_url( $bg_image ); ?>'); background-size:<?php echo esc_attr( $bg_size ); ?>; background-position:<?php echo esc_attr( $bg_position ); ?>; background-repeat:<?php echo esc_attr( $bg_repeat ); ?>; background-attachment:<?php echo esc_attr( $bg_attachment ); ?>; opacity:<?php echo esc_attr( $bg_opacity / 100 ); ?>; pointer-events:none; z-index:0;"
            ></div>
        <?php endif; ?>

        <div class="<?php echo esc_attr( "{$namespace}-column__inner" ); ?>" style="<?php echo $inner_style; ?>">
            <?php echo $content; ?>
        </div>
    </div>
    <?php
    return ob_get_clean();
};
