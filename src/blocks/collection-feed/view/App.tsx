import React from 'react';
import { __, sprintf } from '@wordpress/i18n';

import ProductCard from './ProductCard';
import { buildUrl, withPage } from './url-state';
import type { FeedConfig, FeedState, StoreProduct } from './types';

export interface AppData {
    products: StoreProduct[];
    total: number;
    totalPages: number;
    /** Increments per successful fetch; keys off it so every fetch REMOUNTS the
     * cards — the delegated swatch handler mutates card DOM (image/price/active
     * class) outside React, and a remount guarantees a clean slate instead of a
     * stale diff. The theme-side MutationObserver then re-runs pre-selection. */
    generation: number;
    state: FeedState;
    config: FeedConfig;
}

// Core query-pagination-numbers shape: 1 … p-1 p p+1 … N (dedup + sorted).
const pageNumbers = (page: number, totalPages: number): Array<number | '…'> => {
    const wanted = new Set<number>([1, totalPages, page - 1, page, page + 1]);
    const pages = Array.from(wanted)
        .filter((n) => n >= 1 && n <= totalPages)
        .sort((a, b) => a - b);

    const out: Array<number | '…'> = [];
    let prev = 0;
    for (const n of pages) {
        if (prev && n - prev > 1) out.push('…');
        out.push(n);
        prev = n;
    }
    return out;
};

// Plain hrefs — the bootstrap's capture listener intercepts these exactly like
// the server-rendered pagination, so middle-click/new-tab keep working natively.
const Pagination = ({ data }: { data: AppData }) => {
    const { state, config, totalPages } = data;
    const page = state.page;
    if (totalPages <= 1) return null;

    const href = (n: number) => buildUrl(withPage(state, n), config).toString();

    return (
        <nav className="kgm-collection__pagination wp-block-query-pagination" aria-label={__('Pagination', 'sidekick-gutenberg-blocks')}>
            {page > 1 ? (
                <a className="wp-block-query-pagination-previous" href={href(page - 1)}>
                    {__('Previous', 'sidekick-gutenberg-blocks')}
                </a>
            ) : null}
            <div className="wp-block-query-pagination-numbers">
                {pageNumbers(page, totalPages).map((n, i) =>
                    n === '…' ? (
                        <span key={`dots-${i}`} className="page-numbers dots">
                            …
                        </span>
                    ) : n === page ? (
                        <span key={n} aria-current="page" className="page-numbers current">
                            {n}
                        </span>
                    ) : (
                        <a key={n} className="page-numbers" href={href(n)} aria-label={sprintf(__('Page %d', 'sidekick-gutenberg-blocks'), n)}>
                            {n}
                        </a>
                    )
                )}
            </div>
            {page < totalPages ? (
                <a className="wp-block-query-pagination-next" href={href(page + 1)}>
                    {__('Next', 'sidekick-gutenberg-blocks')}
                </a>
            ) : null}
        </nav>
    );
};

export default function App({ data }: { data: AppData }) {
    const { products, total, generation, config } = data;

    return (
        <>
            {products.length ? (
                // Same UL contract as woocommerce/product-template so the theme's
                // responsive-grid SCSS applies untouched.
                <ul className="wc-block-product-template wc-block-product-template__responsive wp-block-woocommerce-product-template">
                    {products.map((p) => (
                        <ProductCard key={`${generation}:${p.id}`} product={p} config={config} />
                    ))}
                </ul>
            ) : (
                // Mirror of the template's product-collection-no-results block.
                <div className="wp-block-group kgm-collection__no-results">
                    <h2 className="wp-block-heading">{__('No products found', 'sidekick-gutenberg-blocks')}</h2>
                    <p>{__('Try clearing a filter or browsing another collection.', 'sidekick-gutenberg-blocks')}</p>
                </div>
            )}

            <Pagination data={data} />

            <span className="sgb-collection-feed__status" role="status" aria-live="polite">
                {sprintf(__('Showing %1$d of %2$d products', 'sidekick-gutenberg-blocks'), products.length, total)}
            </span>
        </>
    );
}
