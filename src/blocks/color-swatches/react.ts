// Front-end coordinator for product cards: colour-swatch selection + Add-to-Cart
// via the WooCommerce Store API data store (so the header mini-cart badge
// auto-updates). Fully DELEGATED on `document` so it keeps working after WC's
// Interactivity router replaces the product grid on filter/pagination navigation.
// Plain DOM only — no jQuery, no raw Store API fetch (that would leave the badge stale).

const SWATCH = '.sgb-color-swatches__swatch';
const ACTIVE = 'sgb-color-swatches__swatch--active';
const CARD = '.kgm-product-card';
const ADD_BTN = '.kgm-add-to-cart';
const CARD_ROOT = '.kgm-collection';

// The wc/store/cart store is registered by the header woocommerce/mini-cart block.
// addItemToCart() POSTs to the Store API and feeds the response back into the store,
// which auto-refreshes the header badge — no manual nonce or DOM work.
const getCartStore = () => {
    const store = (window as any).wp?.data?.dispatch?.('wc/store/cart');
    return store && typeof store.addItemToCart === 'function' ? store : null;
};

const selectSwatch = (swatch: HTMLElement) => {
    const card = swatch.closest(CARD) as HTMLElement | null;
    if (!card) return;
    const d = swatch.dataset;

    // Swap the card image to the variation's photo.
    const img = card.querySelector('.kgm-product-card__image img') as HTMLImageElement | null;
    if (img && d.sgbSwatchImage) {
        img.src = d.sgbSwatchImage;
        if (d.sgbSwatchSrcset) img.srcset = d.sgbSwatchSrcset;
        else img.removeAttribute('srcset');
    }

    // Update the price to the variation's (only when WC provided one). d.sgbPriceHtml
    // is WC-generated price markup (trusted; must never carry user input).
    const price = card.querySelector('.wc-block-components-product-price') as HTMLElement | null;
    if (price && d.sgbPriceHtml) price.innerHTML = d.sgbPriceHtml;

    // Move the selected state across this card's swatches.
    card.querySelectorAll(SWATCH).forEach((s) => {
        s.classList.remove(ACTIVE);
        s.setAttribute('aria-pressed', 'false');
    });
    swatch.classList.add(ACTIVE);
    swatch.setAttribute('aria-pressed', 'true');

    // Record the selection on the card + arm the Add-to-Cart button.
    if (d.sgbVariationId) {
        card.dataset.selectedVariation = d.sgbVariationId;
        const btn = card.querySelector(ADD_BTN) as HTMLButtonElement | null;
        if (btn) {
            btn.disabled = false;
            if (btn.dataset.addLabel) btn.textContent = btn.dataset.addLabel;
        }
    }
};

const addToCart = async (btn: HTMLButtonElement) => {
    if (btn.disabled) return;
    const card = btn.closest(CARD) as HTMLElement | null;
    const isVariable = btn.dataset.productType === 'variable';
    const id = isVariable
        ? parseInt(card?.dataset.selectedVariation || '0', 10)
        : parseInt(btn.dataset.productId || '0', 10);
    if (!id) return;

    const cart = getCartStore();
    if (!cart) {
        // Store unavailable (no block cart on page): fall back to the product page.
        if (btn.dataset.productUrl) window.location.href = btn.dataset.productUrl;
        return;
    }

    const status = card?.querySelector('.kgm-add-to-cart__status') as HTMLElement | null;
    const original = btn.textContent;
    btn.disabled = true;
    btn.classList.add('is-loading');
    try {
        await cart.addItemToCart(id, 1);
        btn.classList.remove('is-loading');
        btn.classList.add('is-added');
        btn.textContent = 'Added ✓';
        if (status) status.textContent = 'Added to cart';
        window.setTimeout(() => {
            btn.classList.remove('is-added');
            btn.textContent = original;
            btn.disabled = false;
        }, 1600);
    } catch (err: any) {
        btn.classList.remove('is-loading');
        btn.classList.add('is-error');
        btn.disabled = false;
        const message = err && err.message ? err.message : 'Sorry, this could not be added to your cart.';
        if (status) status.textContent = message;
        window.setTimeout(() => btn.classList.remove('is-error'), 2200);
        // eslint-disable-next-line no-console
        console.error('sgb/add-to-cart failed', err);
    }
};

document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const swatch = target.closest(SWATCH) as HTMLElement | null;
    if (swatch) {
        // Only interactive (variation, in-stock) swatches act; indicator dots are inert.
        if (swatch.dataset.sgbVariationId && swatch.dataset.sgbInStock !== '0') {
            event.preventDefault();
            selectSwatch(swatch);
        }
        return;
    }

    const btn = target.closest(ADD_BTN) as HTMLButtonElement | null;
    if (btn) {
        event.preventDefault();
        addToCart(btn);
    }
});

// --- Default selection ------------------------------------------------------
// Pre-select each variable card's default colour (or the first in-stock swatch)
// so the image/price match and the Add-to-Cart button is armed on load — the
// button then references that variation, and picking another swatch changes it.
const preselectCard = (card: HTMLElement) => {
    if (card.dataset.selectedVariation) return; // already chosen (idempotent)
    const variantSwatches = Array.from(card.querySelectorAll<HTMLElement>(SWATCH)).filter(
        (s) => s.dataset.sgbVariationId
    );
    if (!variantSwatches.length) return;
    const inStock = variantSwatches.filter((s) => s.dataset.sgbInStock !== '0');
    const target = inStock.find((s) => s.dataset.sgbDefault === '1') || inStock[0] || null;
    if (target) selectSwatch(target);
};

const initCards = () => document.querySelectorAll<HTMLElement>(CARD).forEach(preselectCard);

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCards);
} else {
    initCards();
}

// The WC Interactivity router replaces the grid on filter/pagination with fresh,
// unselected cards — re-run the pre-selection when the collection subtree changes.
const collectionRoot = document.querySelector(CARD_ROOT);
if (collectionRoot && 'MutationObserver' in window) {
    let scheduled = false;
    new MutationObserver(() => {
        if (scheduled) return;
        scheduled = true;
        window.requestAnimationFrame(() => {
            scheduled = false;
            initCards();
        });
    }).observe(collectionRoot, { childList: true, subtree: true });
}

