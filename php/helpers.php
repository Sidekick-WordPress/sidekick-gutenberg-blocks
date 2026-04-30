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
    function sgb_get_border_styles( $b ) {
        if ( empty( $b ) ) return '';

        $styles = '';
        if ( isset($b['width']) ) $styles .= " border-width: {$b['width']};";
        if ( isset($b['style']) ) $styles .= " border-style: {$b['style']};";
        if ( isset($b['color']) ) $styles .= " border-color: {$b['color']};";

        // Per-side borders
        $sides = ['top', 'right', 'bottom', 'left'];
        foreach ($sides as $side) {
            if ( isset($b[$side]) ) {
                if ( isset($b[$side]['width']) ) $styles .= " border-{$side}-width: {$b[$side]['width']};";
                if ( isset($b[$side]['style']) ) $styles .= " border-{$side}-style: {$b[$side]['style']};";
                if ( isset($b[$side]['color']) ) $styles .= " border-{$side}-color: {$b[$side]['color']};";
            }
        }

        return $styles;
    }
}
