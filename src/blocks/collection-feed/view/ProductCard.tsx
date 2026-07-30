import React from 'react';
import { __ } from '@wordpress/i18n';

import type { FeedConfig, SgbSwatch, StoreProduct } from './types';

// Client-rendered TWIN of the server product card. The markup mirrors the
// PHP-rendered contract EXACTLY — same classes and data-sgb-* attributes as
// woocommerce/product-image + post-title + sgb/product-attribute +
// woocommerce/product-price + add-to-cart/save.php + color-swatches/save.php —
// so the theme SCSS and the delegated swatch / add-to-cart handlers in
// color-swatches/react.ts drive these cards with zero changes.

const BUTTON_WRAPPER = 'wp-block-button is-style-cutout-frame-black kgm-product-card__button wp-block-sgb-add-to-cart';

// Store API `name` passes through WC's HtmlFormatter (kses + texturize), so it
// can carry entities ('&amp;', '&#8217;'). Fine for the innerHTML title, but
// plain-text uses (img alt) need them decoded or screen readers get raw codes.
const decodeEntities = (value: string): string => {
    const el = document.createElement('textarea');
    el.innerHTML = value;
    return el.value;
};

const calText = (product: StoreProduct, config: FeedConfig): string => {
    const attr = product.attributes?.find((a) => a.taxonomy === config.calTaxonomy);
    if (!attr || !attr.terms?.length) return '';
    return attr.terms.map((t) => t.name).join(', ');
};

const Swatches = ({ swatches }: { swatches: SgbSwatch[] }) => {
    if (!swatches.length) return null;
    return (
        <div
            className="sgb-color-swatches wp-block-sgb-color-swatches"
            role="group"
            aria-label={__('Available colors', 'sidekick-gutenberg-blocks')}
        >
            {swatches.map((s) => {
                const shared = {
                    className: `sgb-color-swatches__swatch${s.in_stock ? '' : ' sgb-color-swatches__swatch--oos'}`,
                    style: { '--sgb-swatch-color': s.hex || '#cccccc' } as React.CSSProperties,
                    title: s.name,
                    'aria-label': s.name,
                    'data-sgb-color': s.slug,
                };
                if (!s.variation_id) {
                    return <span key={s.slug} {...shared} />;
                }
                return (
                    <button
                        key={s.slug}
                        type="button"
                        {...shared}
                        data-sgb-variation-id={String(s.variation_id)}
                        data-sgb-in-stock={s.in_stock ? '1' : '0'}
                        {...(s.is_default ? { 'data-sgb-default': '1' } : {})}
                        data-sgb-price-html={s.price_html || ''}
                        data-sgb-swatch-image={s.image_src || ''}
                        data-sgb-swatch-srcset={s.image_srcset || ''}
                        aria-pressed={false}
                        disabled={!s.in_stock}
                    />
                );
            })}
        </div>
    );
};

const AddToCart = ({ product }: { product: StoreProduct }) => {
    const ext = product.extensions?.sgb;

    // Extension payload missing (plugin PHP inactive?) — degrade to WooCommerce's
    // own add-to-cart link rather than guessing at gating.
    if (!ext) {
        return (
            <div className={BUTTON_WRAPPER}>
                <a
                    className="wp-block-button__link wp-element-button kgm-add-to-cart-link"
                    href={product.add_to_cart?.url || product.permalink}
                >
                    {product.add_to_cart?.text || __('View Product', 'sidekick-gutenberg-blocks')}
                </a>
            </div>
        );
    }

    if (!ext.addable) return null;

    // Multi-axis variable products route to the product page (same as save.php).
    if (product.type === 'variable' && !ext.inline_addable) {
        return (
            <div className={BUTTON_WRAPPER}>
                <a className="wp-block-button__link wp-element-button kgm-add-to-cart-link" href={product.permalink}>
                    {__('Select Options', 'sidekick-gutenberg-blocks')}
                </a>
            </div>
        );
    }

    const inline = ext.inline_addable;
    const addLabel = __('Add to Cart', 'sidekick-gutenberg-blocks');
    return (
        <div className={BUTTON_WRAPPER}>
            <button
                type="button"
                className="wp-block-button__link wp-element-button kgm-add-to-cart"
                data-product-id={String(product.id)}
                data-product-type={inline ? 'variable' : 'simple'}
                data-product-url={product.permalink}
                data-add-label={addLabel}
                disabled={inline}
            >
                {inline ? __('Select a Color', 'sidekick-gutenberg-blocks') : addLabel}
            </button>
            <span className="kgm-add-to-cart__status" role="status" aria-live="polite" />
        </div>
    );
};

export default function ProductCard({ product, config }: { product: StoreProduct; config: FeedConfig }) {
    const image = product.images?.[0];
    const cal = calText(product, config);

    return (
        <li className={`wc-block-product post-${product.id} product type-product product-type-${product.type}`}>
            <div className="wp-block-group kgm-product-card">
                <div className="wp-block-group kgm-product-card__body">
                    <div className="wc-block-components-product-image wc-block-grid__product-image kgm-product-card__image wp-block-woocommerce-product-image">
                        <a href={product.permalink}>
                            {image ? (
                                <img
                                    src={image.src}
                                    srcSet={image.srcset || undefined}
                                    sizes={image.sizes || undefined}
                                    alt={image.alt || decodeEntities(product.name)}
                                    style={{ objectFit: 'contain' }}
                                    loading="lazy"
                                    decoding="async"
                                />
                            ) : null}
                        </a>
                    </div>

                    <h3 className="has-text-align-center kgm-product-card__title wp-block-post-title">
                        {/* Store API `name` is post_title markup (may carry entities) — trusted store content. */}
                        <a href={product.permalink} target="_self" dangerouslySetInnerHTML={{ __html: product.name }} />
                    </h3>

                    {cal ? (
                        <span className="sgb-product-attribute kgm-product-card__cal wp-block-sgb-product-attribute">
                            {config.calPrefix}
                            {cal}
                        </span>
                    ) : null}

                    <div className="has-text-align-center has-font-size has-small-font-size kgm-product-card__price wp-block-woocommerce-product-price">
                        {/* WC-generated price markup (sale <del>/<ins> included) — trusted. */}
                        <div
                            className="wc-block-components-product-price wc-block-grid__product-price"
                            dangerouslySetInnerHTML={{ __html: product.price_html || '' }}
                        />
                    </div>

                    <AddToCart product={product} />
                </div>

                <Swatches swatches={product.extensions?.sgb?.swatches ?? []} />
            </div>
        </li>
    );
}
