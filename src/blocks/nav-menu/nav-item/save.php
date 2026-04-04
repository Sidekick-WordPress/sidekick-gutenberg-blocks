<?php
defined('ABSPATH') || exit;

return function( $attributes ) {
    $namespace = defined('SGB_NS') ? SGB_NS : 'sgb';

    $label = isset( $attributes['label'] ) ? $attributes['label'] : 'Menu Item';
    $url = isset( $attributes['url'] ) ? $attributes['url'] : '';
    $opens_in_new_tab = ! empty( $attributes['opensInNewTab'] );
    $rel = isset( $attributes['rel'] ) ? $attributes['rel'] : '';
    $icon = isset( $attributes['icon'] ) ? $attributes['icon'] : '';
    $icon_position = isset( $attributes['iconPosition'] ) ? $attributes['iconPosition'] : 'left';
    $show_icon = ! empty( $attributes['showIcon'] );
    $style_variant = isset( $attributes['styleVariant'] ) ? $attributes['styleVariant'] : 'default';

    $classes = [
        "{$namespace}-nav-item",
        "is-variant-" . sanitize_html_class( $style_variant ),
        "is-icon-" . sanitize_html_class( $icon_position ),
    ];

    $target = $opens_in_new_tab ? '_blank' : '';
    $computed_rel = trim( $rel );

    if ( $opens_in_new_tab ) {
        $rels = preg_split( '/\s+/', $computed_rel ?: '' );
        $rels = is_array( $rels ) ? $rels : [];
        $rels[] = 'noopener';
        $rels[] = 'noreferrer';
        $rels = array_unique( array_filter( $rels ) );
        $computed_rel = implode( ' ', $rels );
    }

    $wrapper_attributes = get_block_wrapper_attributes( [
        'class' => implode( ' ', array_filter( $classes ) ),
    ] );

    $icon_html = '';
    if ( $show_icon && ! empty( $icon ) ) {
        $icon_html = sprintf(
            '<span class="%1$s-nav-item__icon" aria-hidden="true">%2$s</span>',
            esc_attr( $namespace ),
            esc_html( $icon )
        );
    }

    $label_html = sprintf(
        '<span class="%1$s-nav-item__label">%2$s</span>',
        esc_attr( $namespace ),
        wp_kses_post( $label )
    );

    $inner_html = '';
    if ( $show_icon && $icon_position === 'left' ) {
        $inner_html .= $icon_html;
    }

    $inner_html .= $label_html;

    if ( $show_icon && $icon_position === 'right' ) {
        $inner_html .= $icon_html;
    }

    if ( empty( $url ) ) {
        return sprintf(
            '<div %1$s><span class="%2$s-nav-item__content is-placeholder">%3$s</span></div>',
            $wrapper_attributes,
            esc_attr( $namespace ),
            $inner_html
        );
    }

    return sprintf(
        '<div %1$s><a class="%2$s-nav-item__content" href="%3$s"%4$s%5$s>%6$s</a></div>',
        $wrapper_attributes,
        esc_attr( $namespace ),
        esc_url( $url ),
        $target ? ' target="' . esc_attr( $target ) . '"' : '',
        $computed_rel ? ' rel="' . esc_attr( $computed_rel ) . '"' : '',
        $inner_html
    );
};
