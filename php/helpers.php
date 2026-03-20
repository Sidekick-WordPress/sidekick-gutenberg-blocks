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
