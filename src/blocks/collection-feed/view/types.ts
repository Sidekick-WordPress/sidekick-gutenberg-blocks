// Shapes for the collection-feed view. StoreProduct mirrors the wc/store/v1
// product object (only the fields the card consumes); SgbSwatch mirrors the
// `extensions.sgb` payload published by php/store-api.php.

export interface FeedTermPair {
    id: number;
    slug: string;
}

export interface FeedAttribute {
    /** wc attribute_id — matches data-attribute-id on the filter group DOM. */
    id: number;
    /** e.g. pa_series (Store API `attributes[][attribute]`). */
    taxonomy: string;
    /** e.g. series (URL param name: filter_series / query_type_series). */
    param: string;
    queryType: string;
    terms: FeedTermPair[];
}

export interface FeedConfig {
    restRoot: string;
    canonicalUrl: string;
    categoryId: number;
    perPage: number;
    orderby: string;
    order: string;
    calTaxonomy: string;
    calPrefix: string;
    attributes: FeedAttribute[];
}

/** URL-derived feed state: selected term slugs per attribute param + page. */
export interface FeedState {
    filters: Record<string, string[]>;
    page: number;
}

export interface StoreImage {
    id: number;
    src: string;
    thumbnail: string;
    srcset: string;
    sizes: string;
    name: string;
    alt: string;
}

export interface StoreAttributeTerm {
    id: number;
    name: string;
    slug: string;
}

export interface StoreAttribute {
    id: number;
    name: string;
    taxonomy: string | null;
    has_variations: boolean;
    terms: StoreAttributeTerm[];
}

export interface SgbSwatch {
    slug: string;
    name: string;
    hex: string;
    variation_id: number;
    in_stock: boolean;
    is_default: boolean;
    price_html: string;
    image_src: string;
    image_srcset: string;
}

export interface SgbExtension {
    addable: boolean;
    inline_addable: boolean;
    swatches: SgbSwatch[];
}

export interface StoreProduct {
    id: number;
    name: string;
    permalink: string;
    type: string;
    is_purchasable: boolean;
    is_in_stock: boolean;
    price_html: string;
    images: StoreImage[];
    attributes: StoreAttribute[];
    add_to_cart?: { text: string; url: string };
    extensions?: { sgb?: SgbExtension };
}
