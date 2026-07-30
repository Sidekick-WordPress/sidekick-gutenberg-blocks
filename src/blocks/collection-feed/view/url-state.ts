import type { FeedConfig, FeedState } from './types';

// URL <-> state. The URL is the single source of truth, in EXACTLY the format
// WooCommerce's product-filters block writes (verified against WC 10.9):
//   filter_<param>=slug-a,slug-b & query_type_<param>=or   (per attribute)
//   /page/N/                                               (pretty pagination)
// so every feed URL stays shareable and hard-refreshes server-render the same view.

export const parseState = (url: URL, config: FeedConfig): FeedState => {
    const filters: Record<string, string[]> = {};
    for (const attr of config.attributes) {
        const raw = url.searchParams.get(`filter_${attr.param}`);
        if (!raw) continue;
        const slugs = raw
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        if (slugs.length) filters[attr.param] = slugs;
    }

    const match = url.pathname.match(/\/page\/(\d+)(?:\/|$)/);
    const page = match ? Math.max(1, parseInt(match[1], 10)) : 1;

    return { filters, page };
};

export const buildUrl = (state: FeedState, config: FeedConfig): URL => {
    const base = new URL(config.canonicalUrl, window.location.origin);

    let pathname = base.pathname.replace(/\/+$/, '/');
    if (state.page > 1) {
        pathname = `${pathname.replace(/\/+$/, '')}/page/${state.page}/`;
    }
    const url = new URL(pathname, base.origin);

    // Carry foreign query params (utm etc.) across navigations; ours are rebuilt.
    new URL(window.location.href).searchParams.forEach((value, key) => {
        if (!/^(filter_|query_type_)/.test(key)) url.searchParams.set(key, value);
    });

    for (const attr of config.attributes) {
        const selected = state.filters[attr.param];
        if (selected && selected.length) {
            url.searchParams.set(`filter_${attr.param}`, selected.join(','));
            url.searchParams.set(`query_type_${attr.param}`, attr.queryType || 'or');
        }
    }

    return url;
};

/** Toggle one term; any filter change resets pagination (as WooCommerce does). */
export const toggleFilter = (state: FeedState, param: string, slug: string): FeedState => {
    const current = state.filters[param] || [];
    const next = current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug];

    const filters = { ...state.filters };
    if (next.length) {
        filters[param] = next;
    } else {
        delete filters[param];
    }

    return { filters, page: 1 };
};

export const withPage = (state: FeedState, page: number): FeedState => ({
    filters: state.filters,
    page: Math.max(1, page),
});
