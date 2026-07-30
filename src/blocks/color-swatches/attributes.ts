export interface ColorSwatchesAttributes {
    swatchSize?: number;
}

export const colorSwatchesAttributes = {
    swatchSize: { type: 'number', default: 18 },
} as const;
