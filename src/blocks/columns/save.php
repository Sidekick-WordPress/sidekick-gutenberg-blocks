<?php
defined('ABSPATH') || exit;

return function( $attributes, $content ) {
    $namespace = defined('SGB_NS') ? SGB_NS : 'sgb';
    $html_id = ! empty( $attributes['htmlId'] ) ? sgb_sanitize_html_id( $attributes['htmlId'] ) : '';

    // Breakpoints
    $tablet_bp  = isset( $attributes['tabletBreakpoint'] ) ? (int) $attributes['tabletBreakpoint'] : 768;
    $desktop_bp = isset( $attributes['desktopBreakpoint'] ) ? (int) $attributes['desktopBreakpoint'] : 1024;

    // Base (Mobile) Attributes
    $mobile_gap = isset( $attributes['mobileGap'] ) ? (int) $attributes['mobileGap'] : 20;
    $mobile_padding = isset( $attributes['mobilePadding'] ) ? $attributes['mobilePadding'] : [
        'top'    => '20px',
        'right'  => '20px',
        'bottom' => '20px',
        'left'   => '20px'
    ];
    $mobile_max_w = ! empty( $attributes['mobileMaxWidth'] ) ? $attributes['mobileMaxWidth'] : '';
    $mobile_max_h = ! empty( $attributes['mobileMaxHeight'] ) ? $attributes['mobileMaxHeight'] : '';
    $mobile_align = isset( $attributes['horizontalAlignment'] ) ? $attributes['horizontalAlignment'] : 'center';

    // Tablet Attributes (Overrides)
    $has_tab_gap = isset( $attributes['tabletGap'] ) && $attributes['tabletGap'] !== '';
    $has_tab_pad = ! empty( $attributes['tabletPadding'] ) && count( array_filter( (array) $attributes['tabletPadding'] ) ) > 0;
    $has_tab_max_w = ! empty( $attributes['tabletMaxWidth'] );
    $has_tab_max_h = ! empty( $attributes['tabletMaxHeight'] );
    $has_tab_align = ! empty( $attributes['tabletHorizontalAlignment'] );

    // Desktop Attributes (Overrides)
    $has_desk_gap = isset( $attributes['gap'] ) && $attributes['gap'] !== '';
    $has_desk_pad = ! empty( $attributes['padding'] ) && count( array_filter( (array) $attributes['padding'] ) ) > 0;
    $has_desk_max_w = ! empty( $attributes['desktopMaxWidth'] );
    $has_desk_max_h = ! empty( $attributes['desktopMaxHeight'] );
    $has_desk_align = ! empty( $attributes['desktopHorizontalAlignment'] );

    // CSS Variable Calculations
    $css_gap_mobile = $mobile_gap . 'px';
    $css_gap_tablet = $has_tab_gap ? $attributes['tabletGap'] . 'px' : 'var(--gap-mobile)';
    $css_gap_desktop = $has_desk_gap ? $attributes['gap'] . 'px' : 'var(--gap-tablet)';

    $css_pad_mobile = sgb_get_padding_str( $mobile_padding, '0px' );
    $css_pad_tablet = $has_tab_pad ? sgb_get_padding_str( $attributes['tabletPadding'], '0px' ) : 'var(--pad-mobile)';
    $css_pad_desktop = $has_desk_pad ? sgb_get_padding_str( $attributes['padding'], '0px' ) : 'var(--pad-tablet)';

    $css_max_w_mobile = $mobile_max_w ?: 'none';
    $css_max_w_tablet = $has_tab_max_w ? $attributes['tabletMaxWidth'] : 'var(--max-width-mobile)';
    $css_max_w_desktop = $has_desk_max_w ? $attributes['desktopMaxWidth'] : 'var(--max-width-tablet)';

    $css_max_h_mobile = $mobile_max_h ?: 'none';
    $css_max_h_tablet = $has_tab_max_h ? $attributes['tabletMaxHeight'] : 'var(--max-height-mobile)';
    $css_max_h_desktop = $has_desk_max_h ? $attributes['desktopMaxHeight'] : 'var(--max-height-tablet)';

    // Alignment logic
    $get_margin_l = function($align) { return $align === 'left' ? '0' : 'auto'; };
    $get_margin_r = function($align) { return $align === 'right' ? '0' : 'auto'; };

    $align_mobile = $mobile_align;
    $align_tablet = $has_tab_align ? $attributes['tabletHorizontalAlignment'] : $align_mobile;
    $align_desktop = $has_desk_align ? $attributes['desktopHorizontalAlignment'] : $align_tablet;

    // Background Attributes
    $bg_img_base = ! empty( $attributes['backgroundImage'] ) ? 'url(' . esc_url( $attributes['backgroundImage'] ) . ')' : 'none';
    $bg_col_base = ! empty( $attributes['backgroundColor'] ) ? $attributes['backgroundColor'] : 'transparent';
    $bg_grad_base = ! empty( $attributes['backgroundGradient'] ) ? $attributes['backgroundGradient'] : 'none';

    $bg_img_tab = ! empty( $attributes['tabletBackgroundImage'] ) ? 'url(' . esc_url( $attributes['tabletBackgroundImage'] ) . ')' : 'var(--bg-image-mobile)';
    $bg_col_tab = ! empty( $attributes['tabletBackgroundColor'] ) ? $attributes['tabletBackgroundColor'] : 'var(--bg-color-mobile)';
    $bg_grad_tab = ! empty( $attributes['tabletBackgroundGradient'] ) ? $attributes['tabletBackgroundGradient'] : 'var(--bg-gradient-mobile)';

    $bg_img_desk = ! empty( $attributes['desktopBackgroundImage'] ) ? 'url(' . esc_url( $attributes['desktopBackgroundImage'] ) . ')' : 'var(--bg-image-tablet)';
    $bg_col_desk = ! empty( $attributes['desktopBackgroundColor'] ) ? $attributes['desktopBackgroundColor'] : 'var(--bg-color-tablet)';
    $bg_grad_desk = ! empty( $attributes['desktopBackgroundGradient'] ) ? $attributes['desktopBackgroundGradient'] : 'var(--bg-gradient-tablet)';

    // Background Videos (with mobile→tablet→desktop cascade)
    $bg_vid_mobile  = ! empty( $attributes['backgroundVideo'] ) ? esc_url( $attributes['backgroundVideo'] ) : '';
    $bg_vid_tablet  = ! empty( $attributes['tabletBackgroundVideo'] ) ? esc_url( $attributes['tabletBackgroundVideo'] ) : $bg_vid_mobile;
    $bg_vid_desktop = ! empty( $attributes['desktopBackgroundVideo'] ) ? esc_url( $attributes['desktopBackgroundVideo'] ) : $bg_vid_tablet;
    $has_bg_video   = (bool) ( $bg_vid_mobile || $bg_vid_tablet || $bg_vid_desktop );

    $bg_opacity     = isset( $attributes['backgroundImageOpacity'] ) ? $attributes['backgroundImageOpacity'] : 100;
    $bg_size        = isset( $attributes['backgroundSize'] ) ? $attributes['backgroundSize'] : 'cover';
    $bg_repeat      = isset( $attributes['backgroundRepeat'] ) ? $attributes['backgroundRepeat'] : 'no-repeat';
    $bg_parallax    = ! empty( $attributes['backgroundFixedPosition'] );
    $bg_attachment  = $bg_parallax ? 'fixed' : 'scroll';

    // Position overrides only apply while that breakpoint has its own image.
    // Older saved blocks may retain positions after an image override was removed.
    $bg_pos_mobile  = ! empty( $attributes['backgroundPosition'] ) ? $attributes['backgroundPosition'] : 'center';
    $bg_pos_tablet  = ( ! empty( $attributes['tabletBackgroundImage'] ) && ! empty( $attributes['tabletBackgroundPosition'] ) ) ? $attributes['tabletBackgroundPosition'] : 'var(--bg-pos-mobile)';
    $bg_pos_desktop = ( ! empty( $attributes['desktopBackgroundImage'] ) && ! empty( $attributes['desktopBackgroundPosition'] ) ) ? $attributes['desktopBackgroundPosition'] : 'var(--bg-pos-tablet)';

    // Unique ID for this block instance (for targeting style overrides)
    $block_id = 'sgb-columns-' . wp_generate_uuid4();

    // Build Style String
    $style = sprintf(
        '--gap-mobile: %s; --gap-tablet: %s; --gap-desktop: %s; ' .
        '--pad-mobile: %s; --pad-tablet: %s; --pad-desktop: %s; ' .
        '--max-width-mobile: %s; --max-width-tablet: %s; --max-width-desktop: %s; ' .
        '--max-height-mobile: %s; --max-height-tablet: %s; --max-height-desktop: %s; ' .
        '--margin-l-mobile: %s; --margin-r-mobile: %s; ' .
        '--margin-l-tablet: %s; --margin-r-tablet: %s; ' .
        '--margin-l-desktop: %s; --margin-r-desktop: %s; ' .
        '--bg-image-mobile: %s; --bg-image-tablet: %s; --bg-image-desktop: %s; ' .
        '--bg-color-mobile: %s; --bg-color-tablet: %s; --bg-color-desktop: %s; ' .
        '--bg-gradient-mobile: %s; --bg-gradient-tablet: %s; --bg-gradient-desktop: %s; ' .
        '--bg-pos-mobile: %s; --bg-pos-tablet: %s; --bg-pos-desktop: %s; ' .
        'padding: var(--current-pad); position: relative; max-height: var(--current-max-height); box-sizing: border-box; display: block; width: 100%%; background-color: var(--current-bg-color);',
        esc_attr( $css_gap_mobile ), esc_attr( $css_gap_tablet ), esc_attr( $css_gap_desktop ),
        esc_attr( $css_pad_mobile ), esc_attr( $css_pad_tablet ), esc_attr( $css_pad_desktop ),
        esc_attr( $css_max_w_mobile ), esc_attr( $css_max_w_tablet ), esc_attr( $css_max_w_desktop ),
        esc_attr( $css_max_h_mobile ), esc_attr( $css_max_h_tablet ), esc_attr( $css_max_h_desktop ),
        $get_margin_l($align_mobile), $get_margin_r($align_mobile),
        $get_margin_l($align_tablet), $get_margin_r($align_tablet),
        $get_margin_l($align_desktop), $get_margin_r($align_desktop),
        esc_attr( $bg_img_base ), esc_attr( $bg_img_tab ), esc_attr( $bg_img_desk ),
        esc_attr( $bg_col_base ), esc_attr( $bg_col_tab ), esc_attr( $bg_col_desk ),
        esc_attr( $bg_grad_base ), esc_attr( $bg_grad_tab ), esc_attr( $bg_grad_desk ),
        esc_attr( $bg_pos_mobile ), esc_attr( $bg_pos_tablet ), esc_attr( $bg_pos_desktop )
    );

    $wrapper_args = [
        'style' => $style,
        'class' => $block_id
    ];

    if ( $html_id ) {
        $wrapper_args['id'] = $html_id;
    }

    $wrapper_attributes = get_block_wrapper_attributes( $wrapper_args );

    // Build Inner Styles
    $inner_style = 'display:flex; flex-wrap:wrap; flex-direction:row; justify-content:flex-start; align-items:stretch; gap:var(--current-gap); position:relative; z-index:1; max-width:var(--current-max-width); margin-left:var(--current-margin-left); margin-right:var(--current-margin-right); box-sizing:border-box; width:100%;';

    ob_start();
    ?>
    <div <?php echo $wrapper_attributes; ?>>
        <style>
            .<?php echo $block_id; ?> {
                --current-bg-pos: var(--bg-pos-mobile);
            }
            @media (min-width: <?php echo $tablet_bp; ?>px) {
                .<?php echo $block_id; ?> {
                    --current-gap: var(--gap-tablet);
                    --current-pad: var(--pad-tablet);
                    --current-max-width: var(--max-width-tablet);
                    --current-max-height: var(--max-height-tablet);
                    --current-margin-left: var(--margin-l-tablet);
                    --current-margin-right: var(--margin-r-tablet);
                    --current-bg-image: var(--bg-image-tablet);
                    --current-bg-color: var(--bg-color-tablet);
                    --current-bg-gradient: var(--bg-gradient-tablet);
                    --current-bg-pos: var(--bg-pos-tablet);
                }
            }
            @media (min-width: <?php echo $desktop_bp; ?>px) {
                .<?php echo $block_id; ?> {
                    --current-gap: var(--gap-desktop);
                    --current-pad: var(--pad-desktop);
                    --current-max-width: var(--max-width-desktop);
                    --current-max-height: var(--max-height-desktop);
                    --current-margin-left: var(--margin-l-desktop);
                    --current-margin-right: var(--margin-r-desktop);
                    --current-bg-image: var(--bg-image-desktop);
                    --current-bg-color: var(--bg-color-desktop);
                    --current-bg-gradient: var(--bg-gradient-desktop);
                    --current-bg-pos: var(--bg-pos-desktop);
                }
            }
        </style>

        <div
            class="<?php echo esc_attr( $namespace ); ?>-background-layer"
            style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; pointer-events: none; z-index: 0; background-image: var(--current-bg-gradient, none), var(--current-bg-image); background-size: <?php echo esc_attr( $bg_size ); ?>; background-position: var(--current-bg-pos, center); background-repeat: <?php echo esc_attr( $bg_repeat ); ?>; background-attachment: <?php echo esc_attr( $bg_attachment ); ?>; opacity: <?php echo esc_attr( $bg_opacity / 100 ); ?>;"
        ></div>

        <?php if ( $has_bg_video ) : ?>
        <video
            class="<?php echo esc_attr( $namespace ); ?>-background-video"
            data-sgb-bg-video="1"
            data-bg-mobile="<?php echo esc_attr( $bg_vid_mobile ); ?>"
            data-bg-tablet="<?php echo esc_attr( $bg_vid_tablet ); ?>"
            data-bg-desktop="<?php echo esc_attr( $bg_vid_desktop ); ?>"
            data-tablet-bp="<?php echo (int) $tablet_bp; ?>"
            data-desktop-bp="<?php echo (int) $desktop_bp; ?>"
            preload="none"
            muted
            loop
            playsinline
            autoplay
            style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; pointer-events: none; z-index: 0; opacity: <?php echo esc_attr( $bg_opacity / 100 ); ?>;"
        ></video>
        <?php endif; ?>

        <div class="<?php echo esc_attr( $namespace ); ?>-columns-inner" style="<?php echo esc_attr( $inner_style ); ?>">
            <?php echo $content; ?>
        </div>
    </div>
    <?php
    return ob_get_clean();
};
