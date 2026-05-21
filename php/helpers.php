<?php
defined('ABSPATH') || exit;

// Note: Because PHP cannot use constants in function names, we use a static prefix here.
if ( ! function_exists( 'sgb_get_padding_str' ) ) {
    function sgb_get_padding_str( $p, $fallback = '0px' ) {
        if ( empty( $p ) ) {
            return "{$fallback} {$fallback} {$fallback} {$fallback}";
        }
        if ( is_numeric( $p ) ) {
            return "{$p}px {$p}px {$p}px {$p}px";
        }
        if ( is_array( $p ) ) {
            $top    = isset($p['top']) && $p['top'] !== '' ? (is_numeric($p['top']) ? "{$p['top']}px" : $p['top']) : $fallback;
            $right  = isset($p['right']) && $p['right'] !== '' ? (is_numeric($p['right']) ? "{$p['right']}px" : $p['right']) : $fallback;
            $bottom = isset($p['bottom']) && $p['bottom'] !== '' ? (is_numeric($p['bottom']) ? "{$p['bottom']}px" : $p['bottom']) : $fallback;
            $left   = isset($p['left']) && $p['left'] !== '' ? (is_numeric($p['left']) ? "{$p['left']}px" : $p['left']) : $fallback;

            return "{$top} {$right} {$bottom} {$left}";
        }
        return "{$fallback} {$fallback} {$fallback} {$fallback}";
    }
}

if ( ! function_exists( 'sgb_get_border_styles' ) ) {
    function sgb_get_border_styles( $b, $important = false ) {
        if ( empty( $b ) ) return '';

        $suffix = $important ? ' !important;' : ';';
        $styles = '';
        if ( isset($b['width']) ) $styles .= " border-width: {$b['width']}{$suffix}";
        if ( isset($b['style']) ) $styles .= " border-style: {$b['style']}{$suffix}";
        if ( isset($b['color']) ) $styles .= " border-color: {$b['color']}{$suffix}";

        // Per-side borders
        $sides = ['top', 'right', 'bottom', 'left'];
        foreach ($sides as $side) {
            if ( isset($b[$side]) ) {
                if ( isset($b[$side]['width']) ) $styles .= " border-{$side}-width: {$b[$side]['width']}{$suffix}";
                if ( isset($b[$side]['style']) ) $styles .= " border-{$side}-style: {$b[$side]['style']}{$suffix}";
                if ( isset($b[$side]['color']) ) $styles .= " border-{$side}-color: {$b[$side]['color']}{$suffix}";
            }
        }

        return $styles;
    }
}

// See `normalizeColumnWidth` in src/helpers/styles.ts — keep this map in sync.
if ( ! function_exists( 'sgb_normalize_column_width' ) ) {
    function sgb_normalize_column_width( $w ) {
        if ( $w === null || $w === '' ) return null;
        if ( ! is_numeric( $w ) ) return null;
        $num = (float) $w;
        if ( floor( $num ) === $num ) {
            $map = [
                16 => 16.666667,
                17 => 16.666667,
                33 => 33.333333,
                66 => 66.666667,
                67 => 66.666667,
                83 => 83.333333,
            ];
            $int = (int) $num;
            if ( array_key_exists( $int, $map ) ) {
                return $map[ $int ];
            }
        }
        return $num;
    }
}

if ( ! function_exists( 'sgb_sanitize_html_id' ) ) {
    function sgb_sanitize_html_id( $id ) {
        if ( ! is_string( $id ) ) {
            return '';
        }

        $id = trim( $id );
        $id = ltrim( $id, '#' );
        $id = preg_replace( '/\s+/', '-', $id );
        $id = preg_replace( '/[^A-Za-z0-9\-_.:]/', '-', $id );

        return trim( $id, '-' );
    }
}
