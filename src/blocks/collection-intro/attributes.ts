export interface CollectionIntroAttributes {
    headingLevel?: number;
}

export const collectionIntroAttributes = {
    headingLevel: { type: 'number', default: 2 },
} as const;
