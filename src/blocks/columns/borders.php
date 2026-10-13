<?php
defined( 'ABSPATH' ) || exit;

/**
 * Resolve the Columns border cascade, preserving explicit zero and "none".
 * Each side/property can override the previous breakpoint independently.
 */
function sgb_get_columns_borders( $attributes ) {
    $sides = [ 'top', 'right', 'bottom', 'left' ];
    $defaults = [ 'width' => '0px', 'style' => 'solid', 'color' => 'currentColor' ];
    $styles = [ 'none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset' ];
    $normalize = function( $value, $property ) use ( $styles ) {
        if ( ! is_string( $value ) && ! is_int( $value ) && ! is_float( $value ) ) {
            return null;
        }
        if ( is_float( $value ) && ! is_finite( $value ) ) {
            return null;
        }
        $value = trim( (string) $value );
        if ( $value === '' || preg_match( '/[;{}<>\\\\\x00-\x1F\x7F]/', $value ) || strpos( $value, '/*' ) !== false || strpos( $value, '*/' ) !== false ) {
            return null;
        }
        if ( $property === 'style' ) {
            return in_array( $value, $styles, true ) ? $value : null;
        }
        if ( $property === 'width' && is_numeric( $value ) ) {
            $number = (float) $value;
            return is_finite( $number ) && $number >= 0 ? (string) ( $number == 0 ? 0 : $number ) . 'px' : null;
        }
        if ( $property === 'width' && strpos( $value, '-' ) === 0 ) {
            return null;
        }
        if ( $property === 'color' && preg_match( '/^var:preset\|color\|([a-z0-9-]+)$/i', $value, $matches ) ) {
            return 'var(--wp--preset--color--' . $matches[1] . ')';
        }
        return $value;
    };

    $resolved = [];
    $css_vars = [];
    $previous = array_fill_keys( $sides, $defaults );
    foreach ( [ 'mobile' => 'border', 'tablet' => 'tabletBorder', 'desktop' => 'desktopBorder' ] as $tier => $attribute ) {
        $input = $attributes[$attribute] ?? [];
        $input = is_array( $input ) ? $input : [];
        $resolved[$tier] = [];
        foreach ( $sides as $side ) {
            $side_input = isset( $input[$side] ) && is_array( $input[$side] ) ? $input[$side] : [];
            $resolved[$tier][$side] = [];
            foreach ( $defaults as $property => $default ) {
                $flat_value = $normalize( $input[$property] ?? null, $property );
                $side_value = $normalize( $side_input[$property] ?? null, $property );
                $value = $side_value ?? $flat_value ?? $previous[$side][$property];
                $resolved[$tier][$side][$property] = $value;
                // Initialize every variable to prevent a nested Columns block
                // from inheriting its parent's border settings.
                $css_vars['--cols-border-' . $side . '-' . $property . '-' . $tier] = $value;
            }
        }
        $previous = $resolved[$tier];
    }

    return [ 'resolved' => $resolved, 'css_vars' => $css_vars ];
}

/** Return declarations for one of the three supported breakpoint tiers. */
function sgb_get_columns_border_rules( $tier ) {
    if ( ! in_array( $tier, [ 'mobile', 'tablet', 'desktop' ], true ) ) {
        return '';
    }
    $rules = '';
    foreach ( [ 'top', 'right', 'bottom', 'left' ] as $side ) {
        foreach ( [ 'width', 'style', 'color' ] as $property ) {
            $rules .= 'border-' . $side . '-' . $property . ': var(--cols-border-' . $side . '-' . $property . '-' . $tier . '); ';
        }
    }
    return $rules;
}
