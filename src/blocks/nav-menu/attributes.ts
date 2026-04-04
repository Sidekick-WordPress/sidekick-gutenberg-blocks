export interface NavMenuAttributes {
    ref?: number; // Added to store the menu ID
    orientation?: 'horizontal' | 'vertical';
    justifyContent?: 'left' | 'center' | 'right' | 'space-between';
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
    justifyContent: {
        type: 'string',
        default: 'right',
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
