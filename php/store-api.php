<?php
defined( 'ABSPATH' ) || exit;

/**
 * Store API extension: `extensions.sgb` on wc/store/v1 product objects.
 *
 * The archive product card shows data the Store API does not expose natively:
 * wc-visual term hex colours (term meta `color`), per-variation image / price
 * / stock for the inline colour add-to-cart, and the card's add-to-cart gating
 * (sgb_is_inline_color_addable). The React collection feed
 * (sgb/collection-feed) renders cards straight from /products JSON, so this
 * publishes the exact payload the PHP-rendered card computes — via the same
 * helpers — instead of forcing N+1 /products/<variation-id> requests.
 */

add_action( 'woocommerce_blocks_loaded', function () {
	if ( ! function_exists( 'woocommerce_store_api_register_endpoint_data' )
		|| ! class_exists( \Automattic\WooCommerce\StoreApi\Schemas\V1\ProductSchema::class ) ) {
		return;
	}

	woocommerce_store_api_register_endpoint_data(
		array(
			'endpoint'        => \Automattic\WooCommerce\StoreApi\Schemas\V1\ProductSchema::IDENTIFIER,
			'namespace'       => defined( 'SGB_NS' ) ? SGB_NS : 'sgb',
			'schema_type'     => ARRAY_A,
			'schema_callback' => function () {
				return array(
					'addable'        => array(
						'description' => __( 'Whether the archive card can add this product (or one of its variations) to the cart.', 'sidekick-gutenberg-blocks' ),
						'type'        => 'boolean',
						'context'     => array( 'view', 'edit' ),
						'readonly'    => true,
					),
					'inline_addable' => array(
						'description' => __( 'Whether the card offers the inline colour-swatch add-to-cart (single-axis pa_color variable product with purchasable variations).', 'sidekick-gutenberg-blocks' ),
						'type'        => 'boolean',
						'context'     => array( 'view', 'edit' ),
						'readonly'    => true,
					),
					'swatches'       => array(
						'description' => __( 'Colour swatches for the archive card: term hex + per-variation image/price/stock when inline-addable, inert indicators otherwise.', 'sidekick-gutenberg-blocks' ),
						'type'        => 'array',
						'context'     => array( 'view', 'edit' ),
						'readonly'    => true,
						'items'       => array(
							'type'       => 'object',
							'properties' => array(
								'slug'         => array( 'type' => 'string' ),
								'name'         => array( 'type' => 'string' ),
								'hex'          => array( 'type' => 'string' ),
								'variation_id' => array( 'type' => 'integer' ),
								'in_stock'     => array( 'type' => 'boolean' ),
								'is_default'   => array( 'type' => 'boolean' ),
								'price_html'   => array( 'type' => 'string' ),
								'image_src'    => array( 'type' => 'string' ),
								'image_srcset' => array( 'type' => 'string' ),
							),
						),
					),
				);
			},
			'data_callback'   => function ( $product ) {
				// The product endpoint also serves variation objects directly
				// (/products/<variation-id>); the card payload is meaningless there.
				if ( ! $product instanceof WC_Product || $product->is_type( 'variation' ) ) {
					return array(
						'addable'        => false,
						'inline_addable' => false,
						'swatches'       => array(),
					);
				}

				// Mirrors the gating in add-to-cart/save.php exactly.
				if ( $product->is_type( 'variable' ) ) {
					$addable = method_exists( $product, 'has_purchasable_variations' ) ? $product->has_purchasable_variations() : true;
				} else {
					$addable = $product->is_purchasable();
				}

				$swatches = array();
				foreach ( sgb_get_product_color_swatches( $product ) as $slug => $s ) {
					$swatches[] = array(
						'slug'         => (string) $slug,
						'name'         => (string) $s['name'],
						'hex'          => (string) $s['hex'],
						'variation_id' => (int) $s['variation'],
						'in_stock'     => (bool) $s['in_stock'],
						'is_default'   => ! empty( $s['default'] ),
						'price_html'   => (string) $s['price'],
						'image_src'    => (string) $s['img'],
						'image_srcset' => (string) $s['srcset'],
					);
				}

				return array(
					'addable'        => (bool) $addable,
					'inline_addable' => sgb_is_inline_color_addable( $product ),
					'swatches'       => $swatches,
				);
			},
		)
	);
} );
