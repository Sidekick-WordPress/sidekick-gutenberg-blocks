import type { FeedConfig, FeedState } from './types';

// Sync the NATIVE WooCommerce filter chips after the feed hijacks their clicks.
// Woo's own Interactivity bindings (context.item.selected / .hidden) don't fire
// for the toggle path — the capture listener suppresses it — so direct
// attribute writes stick. The OTHER signal path is the chips' '+N more'
// overflow button (actions.showAll): flipping isExpanded re-renders the whole
// data-wp-each list from page-load context, wiping every direct write. The
// bootstrap intercepts that button too once the feed is engaged, and expansion
// is reproduced here instead (data-sgb-expanded), including Woo's displayLimit
// rule: chips past the limit stay hidden until expanded, except selected ones.

const GROUP = '.wp-block-woocommerce-product-filter-attribute';
const CHIP = '.wc-block-product-filter-chips__item';
const CHIPS_BLOCK = '.wp-block-woocommerce-product-filter-chips';
const SHOW_MORE = '.wc-block-product-filter-chips__show-more';

interface ChipGroup {
    el: HTMLElement;
    attributeId: number;
}

// Last successful sync inputs, so expandGroup() can re-run the full rule set
// for one group without a new fetch.
let lastCounts: Map<number, number> | null = null;
let lastState: FeedState | null = null;
let lastConfig: FeedConfig | null = null;

export const getChipGroups = (): ChipGroup[] =>
    Array.from(document.querySelectorAll<HTMLElement>(GROUP))
        .map((el) => ({ el, attributeId: parseInt(el.dataset.attributeId || '0', 10) }))
        .filter((group) => group.attributeId > 0);

const displayLimit = (groupEl: HTMLElement): number => {
    // WC 10.9 serialises displayLimit (default 15) into the chips block context.
    try {
        const raw = groupEl.querySelector(CHIPS_BLOCK)?.getAttribute('data-wp-context') || '{}';
        const limit = (JSON.parse(raw) as { displayLimit?: number }).displayLimit;
        if (typeof limit === 'number' && limit > 0) return limit;
    } catch {
        // fall through to the WC default
    }
    return 15;
};

const isExpanded = (groupEl: HTMLElement, chips: HTMLElement[], limit: number): boolean => {
    if (groupEl.dataset.sgbExpanded === '1') return true;
    // First touch: infer Woo's state — expanded iff an overflow chip is visible
    // (covers a pre-engagement '+N more' click, which Woo handled natively).
    return chips.slice(limit).some((chip) => !chip.hasAttribute('hidden'));
};

/** aria-checked reflects the URL-derived selection (chips render as checkboxes). */
export const applySelection = (state: FeedState, config: FeedConfig): void => {
    for (const group of getChipGroups()) {
        const attr = config.attributes.find((a) => a.id === group.attributeId);
        if (!attr) continue;
        const selected = state.filters[attr.param] || [];
        group.el.querySelectorAll<HTMLElement>(CHIP).forEach((chip) => {
            const slug = chip.getAttribute('value') || '';
            chip.setAttribute('aria-checked', selected.includes(slug) ? 'true' : 'false');
        });
    }
};

const syncGroupVisibility = (
    groupEl: HTMLElement,
    attributeId: number,
    counts: Map<number, number>,
    state: FeedState,
    config: FeedConfig
): void => {
    const attr = config.attributes.find((a) => a.id === attributeId);
    if (!attr) return;

    const selected = state.filters[attr.param] || [];
    const chips = Array.from(groupEl.querySelectorAll<HTMLElement>(CHIP));
    const limit = displayLimit(groupEl);
    const expanded = isExpanded(groupEl, chips, limit);

    chips.forEach((chip, index) => {
        const slug = chip.getAttribute('value') || '';
        const isSelected = selected.includes(slug);
        const term = attr.terms.find((t) => t.slug === slug);
        const count = term ? counts.get(term.id) || 0 : 0;
        const overflow = !expanded && index >= limit;
        // Selected chips always stay visible so they can be un-picked.
        chip.toggleAttribute('hidden', !isSelected && (count === 0 || overflow));
    });

    // Once expanded there is nothing left for '+N more' to reveal.
    groupEl.querySelector<HTMLElement>(SHOW_MORE)?.toggleAttribute('hidden', expanded);
};

/**
 * hideEmpty parity: chips whose term matches nothing under the current
 * cross-attribute filters get [hidden], while Woo's displayLimit collapse is
 * preserved for un-expanded groups.
 */
export const applyCounts = (counts: Map<number, number>, state: FeedState, config: FeedConfig): void => {
    lastCounts = counts;
    lastState = state;
    lastConfig = config;
    for (const group of getChipGroups()) {
        syncGroupVisibility(group.el, group.attributeId, counts, state, config);
    }
};

/** Feed-owned replacement for the chips' '+N more' (Woo's showAll re-render). */
export const expandGroup = (groupEl: HTMLElement): void => {
    groupEl.dataset.sgbExpanded = '1';

    const attributeId = parseInt(groupEl.dataset.attributeId || '0', 10);
    if (lastCounts && lastState && lastConfig && attributeId > 0) {
        syncGroupVisibility(groupEl, attributeId, lastCounts, lastState, lastConfig);
        return;
    }

    // Engaged but no counts yet (first fetch still in flight): show everything.
    groupEl.querySelectorAll<HTMLElement>(CHIP).forEach((chip) => chip.removeAttribute('hidden'));
    groupEl.querySelector<HTMLElement>(SHOW_MORE)?.setAttribute('hidden', '');
};
