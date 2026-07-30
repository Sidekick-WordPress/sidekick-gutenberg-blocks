export interface CollectionFeedAttributes {
    /** Taxonomy rendered as the card's spec line (matches sgb/product-attribute in the template). */
    calAttribute?: string;
    calPrefix?: string;
}

export const collectionFeedAttributes = {
    calAttribute: { type: 'string', default: 'pa_caliber' },
    calPrefix: { type: 'string', default: 'Cal: ' },
} as const;
