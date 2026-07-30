<?php
defined( 'ABSPATH' ) || exit;

/**
 * sgb/collection-feed — server render.
 *
 * Emits ONLY a JSON config <script> (nothing visible; a <script> is also
 * invisible to the body's CSS grid auto-placement). The grid the visitor first
 * sees stays the server-rendered woocommerce/product-collection block — SEO and
 * first paint are untouched. The view script (react.tsx) reads this config,
 * hijacks the native filter-chip / pagination clicks, fetches wc/store/v1 JSON
 * and mounts a React grid in the collection's slot on the first interaction.
 * No config on the page = the view no-ops = native full-page navigation.
 */
return function( $attributes, $content, $block ) {
	if ( ! function_exists( 'wc_get_attribute_taxonomies' ) ) {
		return '';
	}

	// Only the shop page + product-category archives: those are the only
	// contexts the Store API `category` scoping below reproduces faithfully.
	// Anything else (tag / attribute archives, editor preview) renders nothing
	// and keeps the native navigation behavior.
	$is_shop = function_exists( 'is_shop' ) && is_shop();
	$is_cat  = is_tax( 'product_cat' );
	if ( ! $is_shop && ! $is_cat ) {
		return '';
	}

	// Plain permalinks break every assumption below: the archive identity would
	// live in canonicalUrl's (stripped) query string, and rest_url() becomes a
	// ?rest_route= URL the client's path-appending fetches can't extend. No
	// config = the view no-ops and native navigation still works.
	if ( ! get_option( 'permalink_structure' ) ) {
		return '';
	}

	global $wp_query;

	// Filterable attribute map: taxonomy + the URL param WooCommerce's filter
	// block writes (filter_<name>), plus id/slug term pairs so the flat term-id
	// counts from /products/collection-data can be joined back onto the chips.
	$attributes_config = array();
	foreach ( wc_get_attribute_taxonomies() as $tax ) {
		$taxonomy = wc_attribute_taxonomy_name( $tax->attribute_name );
		$terms    = get_terms(
			array(
				'taxonomy'   => $taxonomy,
				'hide_empty' => true,
			)
		);

		$term_pairs = array();
		if ( ! is_wp_error( $terms ) ) {
			foreach ( $terms as $term ) {
				$term_pairs[] = array(
					'id'   => (int) $term->term_id,
					'slug' => $term->slug,
				);
			}
		}

		$attributes_config[] = array(
			'id'        => (int) $tax->attribute_id,
			'taxonomy'  => $taxonomy,
			'param'     => $tax->attribute_name,
			'queryType' => 'or',
			'terms'     => $term_pairs,
		);
	}

	// Ordering parity with the server-rendered loop: WooCommerce's default
	// catalog ordering is `menu_order title` — the Store API only takes a single
	// key, so the first token it understands wins.
	$query_orderby = $wp_query->get( 'orderby' );
	if ( is_array( $query_orderby ) ) {
		$query_orderby = implode( ' ', array_keys( $query_orderby ) );
	}
	$valid_orderby = array( 'menu_order', 'title', 'date', 'price', 'popularity', 'rating', 'id', 'slug' );
	$orderby       = 'menu_order';
	foreach ( preg_split( '/\s+/', (string) $query_orderby ) as $token ) {
		if ( in_array( $token, $valid_orderby, true ) ) {
			$orderby = $token;
			break;
		}
	}
	$order = 'desc' === strtolower( (string) $wp_query->get( 'order' ) ) ? 'desc' : 'asc';

	$config = array(
		'restRoot'     => esc_url_raw( rest_url( 'wc/store/v1' ) ),
		// Archive base URL with /page/N/ and the query string stripped — the same
		// base the WooCommerce filters block builds its URLs against.
		'canonicalUrl' => strtok( html_entity_decode( get_pagenum_link( 1, false ) ), '?' ),
		'categoryId'   => $is_cat ? (int) get_queried_object_id() : 0,
		'perPage'      => max( 1, (int) $wp_query->get( 'posts_per_page' ) ),
		'orderby'      => $orderby,
		'order'        => $order,
		'calTaxonomy'  => isset( $attributes['calAttribute'] ) ? (string) $attributes['calAttribute'] : 'pa_caliber',
		'calPrefix'    => isset( $attributes['calPrefix'] ) ? (string) $attributes['calPrefix'] : 'Cal: ',
		'attributes'   => $attributes_config,
	);

	// JSON_HEX_TAG keeps a literal "</script>" in any value from closing the tag.
	return sprintf(
		'<script type="application/json" id="sgb-collection-feed-config">%s</script>',
		wp_json_encode( $config, JSON_HEX_TAG | JSON_HEX_AMP )
	);
};
