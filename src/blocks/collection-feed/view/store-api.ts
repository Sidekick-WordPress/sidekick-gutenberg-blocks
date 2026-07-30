import type { FeedConfig, FeedState, StoreProduct } from './types';

// wc/store/v1 client for the feed. Read-only GETs — no nonce needed. Cart
// mutations stay with wp.data.dispatch('wc/store/cart') in color-swatches/react.ts.

export interface ProductsPage {
    products: StoreProduct[];
    total: number;
    totalPages: number;
}

// Store API attribute filters use PHP bracket-array syntax; a JSON-encoded
// `attributes` param is rejected with rest_invalid_param (verified on WC 10.9).
const appendAttributeFilters = (state: FeedState, config: FeedConfig, qs: URLSearchParams): void => {
    let i = 0;
    for (const attr of config.attributes) {
        const selected = state.filters[attr.param];
        if (!selected || !selected.length) continue;
        qs.set(`attributes[${i}][attribute]`, attr.taxonomy);
        selected.forEach((slug, j) => qs.set(`attributes[${i}][slug][${j}]`, slug));
        qs.set(`attributes[${i}][operator]`, 'in');
        i++;
    }
};

export const fetchProducts = async (
    state: FeedState,
    config: FeedConfig,
    signal: AbortSignal
): Promise<ProductsPage> => {
    const qs = new URLSearchParams();
    qs.set('per_page', String(config.perPage));
    qs.set('page', String(state.page));
    qs.set('orderby', config.orderby);
    qs.set('order', config.order);
    // The server archive always excludes 'Hidden' / 'Search results only'
    // products; the Store API only does so when asked.
    qs.set('catalog_visibility', 'catalog');
    if (config.categoryId) qs.set('category', String(config.categoryId));
    appendAttributeFilters(state, config, qs);

    const res = await fetch(`${config.restRoot}/products?${qs.toString()}`, { signal });
    if (!res.ok) throw new Error(`Store API /products responded ${res.status}`);

    const products = (await res.json()) as StoreProduct[];
    const total = parseInt(res.headers.get('X-WP-Total') || String(products.length), 10);
    const totalPages = Math.max(1, parseInt(res.headers.get('X-WP-TotalPages') || '1', 10));

    return { products, total, totalPages };
};

/**
 * Per-term product counts under the CURRENT filters (hideEmpty parity for the
 * chips). The response is a flat [{term: <id>, count}] list with no taxonomy
 * grouping — callers join ids back via FeedConfig.attributes[].terms.
 */
export const fetchCounts = async (
    state: FeedState,
    config: FeedConfig,
    taxonomies: string[],
    signal: AbortSignal
): Promise<Map<number, number>> => {
    const counts = new Map<number, number>();
    if (!taxonomies.length) return counts;

    const qs = new URLSearchParams();
    qs.set('catalog_visibility', 'catalog'); // counts must match what the grid can show
    if (config.categoryId) qs.set('category', String(config.categoryId));
    appendAttributeFilters(state, config, qs);
    taxonomies.forEach((taxonomy, i) => {
        qs.set(`calculate_attribute_counts[${i}][taxonomy]`, taxonomy);
        qs.set(`calculate_attribute_counts[${i}][query_type]`, 'or');
    });

    const res = await fetch(`${config.restRoot}/products/collection-data?${qs.toString()}`, { signal });
    if (!res.ok) throw new Error(`Store API /products/collection-data responded ${res.status}`);

    const data = (await res.json()) as { attribute_counts?: Array<{ term: number; count: number }> };
    for (const row of data.attribute_counts || []) counts.set(row.term, row.count);

    return counts;
};
