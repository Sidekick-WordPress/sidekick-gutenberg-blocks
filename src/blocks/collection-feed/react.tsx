import React from 'react';
import { createRoot } from '@wordpress/element';

import App from './view/App';
import { applyCounts, applySelection, expandGroup, getChipGroups } from './view/chips';
import { fetchCounts, fetchProducts } from './view/store-api';
import { buildUrl, parseState, toggleFilter } from './view/url-state';
import type { FeedConfig } from './view/types';

// sgb/collection-feed — front-end controller.
//
// The server keeps rendering the real woocommerce/product-collection grid
// (SEO + first paint untouched). This controller hijacks the native
// product-filters chips and the query-pagination links BEFORE WooCommerce's
// Interactivity handlers run (document CAPTURE phase + stopPropagation kills
// the event before it reaches the element's own listeners), rewrites the URL
// exactly like WooCommerce would, fetches wc/store/v1 JSON, and mounts a React
// twin of the grid in the collection's grid slot on the first interaction.
//
// Anything missing or broken (no config script, no grid, Store API failure)
// falls back to classic full-page navigation — never a dead end.

const CONFIG_ID = 'sgb-collection-feed-config';
const WC_GRID = '.wp-block-woocommerce-product-collection.kgm-collection__grid';
const CHIP = '.wc-block-product-filter-chips__item';
const CHIPS_SHOW_MORE = '.wc-block-product-filter-chips__show-more';
const FILTERS_BLOCK = '.wp-block-woocommerce-product-filters';
const FILTER_GROUP = '.wp-block-woocommerce-product-filter-attribute';
const PAGINATION_LINK = '.kgm-collection__pagination a[href]';

// --- popstate ownership ------------------------------------------------------
// The WP Interactivity router (lazily imported by WC's pagination prefetch /
// mini-cart) also listens on popstate and calls window.location.reload() for
// history entries it didn't create — which is every entry this feed pushes.
// This listener is registered at script-evaluation time: classic footer scripts
// run during parsing, BEFORE any deferred WP script module, so it always
// precedes the router's listener and stopImmediatePropagation() can cut the
// router (and its reload) off for feed-owned history traffic.
interface FeedHooks {
    engaged: () => boolean;
    navigate: (url: URL) => void;
}
let feedHooks: FeedHooks | null = null;

window.addEventListener('popstate', (event) => {
    const fromFeed = (event.state as { sgbCollectionFeed?: boolean } | null)?.sgbCollectionFeed;
    // Pristine sessions (feed never engaged, entry not ours) keep native behavior.
    if (!feedHooks || (!feedHooks.engaged() && !fromFeed)) return;
    event.stopImmediatePropagation();
    feedHooks.navigate(new URL(window.location.href));
});

const bootstrap = () => {
    const configEl = document.getElementById(CONFIG_ID);
    if (!configEl) return; // not a feed-enabled archive

    let config: FeedConfig;
    try {
        config = JSON.parse(configEl.textContent || '');
    } catch {
        return;
    }
    if (!config || !config.restRoot || !Array.isArray(config.attributes)) return;

    let mountEl: HTMLElement | null = null;
    let root: ReturnType<typeof createRoot> | null = null;
    let generation = 0;
    let controller: AbortController | null = null;
    // True from the first hijacked interaction on — the moment direct chip DOM
    // writes exist that a Woo-driven re-render would wipe.
    let hasEngaged = false;

    const wcGrid = (): HTMLElement | null => document.querySelector<HTMLElement>(WC_GRID);

    // Only count taxonomies that actually have a chip group on the page.
    const countableTaxonomies = (): string[] => {
        const groupIds = new Set(getChipGroups().map((g) => g.attributeId));
        return config.attributes.filter((a) => groupIds.has(a.id)).map((a) => a.taxonomy);
    };

    const ensureMount = (): boolean => {
        if (mountEl && root) return true;
        const grid = wcGrid();
        if (!grid || !grid.parentElement) return false;

        // Clone the WC block's classes so the mount inherits the theme's grid-slot
        // styling AND its auto-placement slot ([hidden] removes the WC block from
        // grid layout entirely, so the mount slides into its cell).
        mountEl = document.createElement('div');
        mountEl.className = 'wp-block-woocommerce-product-collection kgm-collection__grid sgb-collection-feed';
        grid.insertAdjacentElement('afterend', mountEl);
        grid.classList.remove('sgb-feed-loading');
        grid.setAttribute('hidden', '');
        root = createRoot(mountEl);
        return true;
    };

    const setBusy = (busy: boolean) => {
        if (mountEl) {
            mountEl.setAttribute('aria-busy', busy ? 'true' : 'false');
        } else {
            // First takeover: dim the still-visible server grid while JSON loads.
            wcGrid()?.classList.toggle('sgb-feed-loading', busy);
        }
    };

    const run = async (target: URL, push: boolean) => {
        hasEngaged = true;
        const state = parseState(target, config);
        if (push) window.history.pushState({ sgbCollectionFeed: true }, '', target.toString());

        applySelection(state, config); // optimistic chip feedback before the fetch lands

        const gen = ++generation;
        controller?.abort();
        controller = new AbortController();
        setBusy(true);

        try {
            const [pageData, counts] = await Promise.all([
                fetchProducts(state, config, controller.signal),
                fetchCounts(state, config, countableTaxonomies(), controller.signal),
            ]);
            if (gen !== generation) return; // superseded by a newer interaction

            if (!ensureMount() || !root) {
                window.location.assign(target.toString());
                return;
            }
            root.render(<App data={{ ...pageData, generation: gen, state, config }} />);
            applyCounts(counts, state, config);
            setBusy(false);
        } catch (err) {
            if ((err as Error | null)?.name === 'AbortError' || gen !== generation) return;
            // JSON path broke — the classic navigation still shows the right page.
            window.location.assign(target.toString());
        }
    };

    document.addEventListener(
        'click',
        (event) => {
            if (event.defaultPrevented) return;
            const target = event.target as HTMLElement | null;
            if (!target) return;

            // --- Filter chip -------------------------------------------------
            const chip = target.closest<HTMLElement>(CHIP);
            if (chip && chip.closest(FILTERS_BLOCK)) {
                const group = chip.closest<HTMLElement>(FILTER_GROUP);
                const attr = group
                    ? config.attributes.find((a) => a.id === parseInt(group.dataset.attributeId || '0', 10))
                    : undefined;
                const slug = chip.getAttribute('value') || '';
                if (!attr || !slug) return; // unknown chip: let WooCommerce have it

                event.preventDefault();
                event.stopPropagation(); // WooCommerce's toggle→navigate never runs
                const state = parseState(new URL(window.location.href), config);
                void run(buildUrl(toggleFilter(state, attr.param, slug), config), true);
                return;
            }

            // --- Chips '+N more' overflow, once the feed owns chip state -----
            const showMore = target.closest<HTMLElement>(CHIPS_SHOW_MORE);
            if (showMore && hasEngaged && showMore.closest(FILTERS_BLOCK)) {
                const group = showMore.closest<HTMLElement>(FILTER_GROUP);
                if (group) {
                    event.preventDefault();
                    event.stopPropagation(); // Woo's showAll re-renders chips from stale page-load context
                    expandGroup(group);
                    return;
                }
            }

            // --- Pagination (server-rendered AND React-rendered links) -------
            const link = target.closest<HTMLAnchorElement>(PAGINATION_LINK);
            if (link) {
                // Respect new-tab / modified clicks.
                if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                event.preventDefault();
                event.stopPropagation(); // beats WC's enhanced-pagination directive
                void run(new URL(link.href), true);
                // Bring the top of the feed back into view like a page change would.
                (mountEl || wcGrid())?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        },
        true
    );

    // Hand the module-scope popstate listener (registered before WP's script
    // modules — see top of file) this feed's state and navigation entry point.
    feedHooks = {
        engaged: () => hasEngaged,
        navigate: (url) => void run(url, false),
    };
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}
