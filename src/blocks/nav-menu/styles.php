<?php
defined( 'ABSPATH' ) || exit;

/** Keep older saved menus readable without requiring a database migration. */
function sgb_nav_menu_migrate_styles( $attributes ) {
    if ( ( $attributes['styleVersion'] ?? null ) === 1 ) {
        return $attributes;
    }

    $default_padding = array( 'top' => '0.5rem', 'right' => '1rem', 'bottom' => '0.5rem', 'left' => '1rem' );
    $style = $attributes['style'] ?? array();
    $sub_style = $attributes['subMenuStyle'] ?? array();
    $style['spacing']['padding'] = $attributes['parentPadding'] ?? $style['spacing']['padding'] ?? $default_padding;
    foreach ( array( 'fontWeight', 'textTransform' ) as $property ) {
        if ( ! isset( $style['typography'][ $property ] ) && ! empty( $attributes[ $property ] ) ) {
            $style['typography'][ $property ] = $attributes[ $property ];
        }
    }
    $sub_style['spacing']['padding'] = $sub_style['spacing']['padding'] ?? $attributes['subMenuPadding'] ?? $default_padding;
    $sub_style['border']['radius'] = $sub_style['border']['radius'] ?? ( ( $attributes['subMenuBorderRadius'] ?? 0 ) . 'px' );
    $attributes['style'] = $style;
    $attributes['subMenuStyle'] = $sub_style;
    $attributes['styleVersion'] = 1;
    unset( $attributes['parentPadding'], $attributes['subMenuPadding'], $attributes['subMenuBorderRadius'], $attributes['fontWeight'], $attributes['textTransform'] );
    return $attributes;
}

/** Resolve native preset tokens and reject CSS declaration separators. */
function sgb_nav_menu_css_value( $value, $fallback = '0px' ) {
    if ( ! is_string( $value ) && ! is_numeric( $value ) ) {
        return $fallback;
    }
    $value = trim( (string) $value );
    if ( $value === '' || preg_match( '/[;{}<>\\\\]/', $value ) ) {
        return $fallback;
    }
    if ( preg_match( '/^var:preset\|([a-z0-9-]+)\|([a-z0-9-]+)$/i', $value, $matches ) ) {
        return 'var(--wp--preset--' . $matches[1] . '--' . $matches[2] . ')';
    }
    return $value;
}

function sgb_nav_menu_padding_sides( $padding ) {
    $sides = array();
    foreach ( array( 'top', 'right', 'bottom', 'left' ) as $side ) {
        $value = sgb_nav_menu_css_value( is_array( $padding ) ? ( $padding[ $side ] ?? null ) : $padding );
        // Unitless zero is valid padding, but needs a unit when added in calc().
        $sides[ $side ] = $value === '0' ? '0px' : $value;
    }
    return $sides;
}

function sgb_nav_menu_radius_corners( $radius ) {
    $corners = array();
    foreach ( array( 'topLeft', 'topRight', 'bottomRight', 'bottomLeft' ) as $corner ) {
        $corners[ $corner ] = sgb_nav_menu_css_value( is_array( $radius ) ? ( $radius[ $corner ] ?? null ) : $radius );
    }
    return $corners;
}

/** Share the same typography schema across the four menu contexts. */
function sgb_nav_menu_typography( $typography ) {
    $properties = array(
        'fontFamily' => 'font-family',
        'fontSize' => 'font-size',
        'fontStyle' => 'font-style',
        'fontWeight' => 'font-weight',
        'lineHeight' => 'line-height',
        'letterSpacing' => 'letter-spacing',
        'textTransform' => 'text-transform',
        'textDecoration' => 'text-decoration',
    );
    $declarations = array();
    foreach ( $properties as $attribute => $property ) {
        $value = sgb_nav_menu_css_value( $typography[ $attribute ] ?? null, '' );
        if ( $value !== '' ) {
            // The size picker can emit a numeric pixel value. Line height and
            // font weight intentionally remain unitless.
            if ( $property === 'font-size' && is_numeric( $value ) ) {
                $value .= 'px';
            }
            $declarations[ $property ] = $value;
        }
    }
    return $declarations;
}

function sgb_nav_menu_desktop_typography( $attributes ) {
    $typography = $attributes['style']['typography'] ?? array();
    foreach ( array( 'fontFamily' => 'font-family', 'fontSize' => 'font-size' ) as $attribute => $preset ) {
        if ( ! empty( $attributes[ $attribute ] ) ) {
            $typography[ $attribute ] = 'var:preset|' . $preset . '|' . $attributes[ $attribute ];
        }
    }
    return sgb_nav_menu_typography( $typography );
}
