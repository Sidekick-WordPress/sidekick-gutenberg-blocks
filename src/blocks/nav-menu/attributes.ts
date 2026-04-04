export interface NavMenuAttributes {
    ref?: number;
    orientation?: 'horizontal' | 'vertical';
    gap?: number;
    mobileGap?: number;
    desktopBreakpoint?: number;
}

export const navMenuAttributes = {
    ref: {
        type: 'number',
        default: 0,
    },
    orientation: {
        type: 'string',
        default: 'horizontal',
    },
    gap: {
        type: 'number',
        default: 24,
    },
    mobileGap: {
        type: 'number',
        default: 12,
    },
    desktopBreakpoint: {
        type: 'number',
        default: 768,
    },
} as const;
