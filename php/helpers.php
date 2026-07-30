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

if ( ! function_exists( 'sgb_is_inline_color_addable' ) ) {
    /**
     * Whether a product supports the archive card's INLINE colour-swatch add-to-cart:
     * a variable product whose ONLY variation attribute is pa_color and that has at
     * least one purchasable variation. Multi-axis products (e.g. colour + size) or
     * all-out-of-stock variable products are NOT inline-addable — the card routes
     * them to the product page instead so the shopper can pick the remaining options
     * / see availability, and the swatches render as inert indicator dots.
     */
    function sgb_is_inline_color_addable( $product ) {
        if ( ! $product || ! is_a( $product, 'WC_Product' ) || ! $product->is_type( 'variable' ) ) {
            return false;
        }
        if ( method_exists( $product, 'has_purchasable_variations' ) && ! $product->has_purchasable_variations() ) {
            return false;
        }
        $variation_attributes = array_filter(
            $product->get_attributes(),
            function ( $attribute ) {
                return is_object( $attribute ) && method_exists( $attribute, 'get_variation' ) && $attribute->get_variation();
            }
        );

        return 1 === count( $variation_attributes ) && isset( $variation_attributes['pa_color'] );
    }
}

if ( ! function_exists( 'sgb_get_product_color_swatches' ) ) {
    /**
     * Colour-swatch data for a product card, keyed by colour slug in display order.
     *
     * INLINE-ADDABLE variable product (see sgb_is_inline_color_addable): one entry
     * per pa_color variation with everything the card needs to swap image/price and
     * arm add-to-cart. Everything else: inert indicator entries from the product's
     * pa_color terms (variation = 0).
     *
     * Single source of truth for BOTH renderers of the card — the PHP block
     * (color-swatches/save.php) and the Store API `extensions.sgb` payload the
     * React collection feed consumes (php/store-api.php). Change shape in one
     * place only.
     *
     * NOTE: get_available_variations() omits out-of-stock variations entirely when
     * "hide out of stock items" is ON, so in_stock=false entries only appear when
     * that store option is OFF.
     *
     * @param WC_Product $product Product to describe.
     * @return array[] slug => { name, hex, variation, in_stock, price, img, srcset, default }
     */
    function sgb_get_product_color_swatches( $product ) {
        if ( ! $product || ! is_a( $product, 'WC_Product' ) || $product->is_type( 'variation' ) ) {
            return array();
        }

        $swatches = array();

        if ( sgb_is_inline_color_addable( $product ) ) {
            // The product's default colour (if the merchant set one) is pre-selected
            // client-side; otherwise the first in-stock swatch is.
            $default_attributes = $product->get_default_attributes();
            $default_color      = isset( $default_attributes['pa_color'] ) ? $default_attributes['pa_color'] : '';

            // One swatch per colour variation (first variation seen per colour slug).
            foreach ( $product->get_available_variations() as $variation ) {
                $slug = isset( $variation['attributes']['attribute_pa_color'] ) ? $variation['attributes']['attribute_pa_color'] : '';
                if ( '' === $slug || isset( $swatches[ $slug ] ) ) {
                    continue;
                }
                $term = get_term_by( 'slug', $slug, 'pa_color' );
                $swatches[ $slug ] = array(
                    'name'      => $term ? $term->name : $slug,
                    'hex'       => $term ? ( get_term_meta( $term->term_id, 'color', true ) ?: '#cccccc' ) : '#cccccc',
                    'variation' => (int) $variation['variation_id'],
                    'in_stock'  => ( ! empty( $variation['is_in_stock'] ) && ! empty( $variation['is_purchasable'] ) ),
                    'price'     => isset( $variation['price_html'] ) ? $variation['price_html'] : '',
                    'img'       => isset( $variation['image']['src'] ) ? $variation['image']['src'] : '',
                    'srcset'    => isset( $variation['image']['srcset'] ) ? $variation['image']['srcset'] : '',
                    'default'   => ( '' !== $default_color && $slug === $default_color ),
                );
            }
        } else {
            // Simple / multi-axis / non-inline-addable variable product: colour terms
            // as inert indicator dots (the card routes to the product page to purchase).
            $terms = wc_get_product_terms( $product->get_id(), 'pa_color', array( 'fields' => 'all' ) );
            if ( ! is_wp_error( $terms ) ) {
                foreach ( $terms as $term ) {
                    $swatches[ $term->slug ] = array(
                        'name'      => $term->name,
                        'hex'       => get_term_meta( $term->term_id, 'color', true ) ?: '#cccccc',
                        'variation' => 0,
                        'in_stock'  => true,
                        'price'     => '',
                        'img'       => '',
                        'srcset'    => '',
                        'default'   => false,
                    );
                }
            }
        }

        return $swatches;
    }
}
