export interface PaddingAttribute {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
}

export interface NavMenuAttributes {
    ref?: number;
    orientation?: 'horizontal' | 'vertical';
    gap?: number;
    mobileGap?: number;
    parentPadding?: PaddingAttribute;
    parentBgColor?: string;
    parentColor?: string;
    subMenuColor?: string;
    subMenuBgColor?: string;
    subMenuPadding?: PaddingAttribute;
    subMenuWidth?: number;
}

export const navMenuAttributes = {
    ref: { type: 'number', default: 0 },
    orientation: { type: 'string', default: 'horizontal' },
    gap: { type: 'number', default: 24 },
    mobileGap: { type: 'number', default: 12 },
    parentPadding: {
        type: 'object',
        default: { top: '0.5rem', right: '1rem', bottom: '0.5rem', left: '1rem' }
    },
    parentBgColor: { type: 'string', default: 'transparent' },
    parentColor: { type: 'string', default: 'inherit' },
    subMenuColor: { type: 'string', default: 'inherit' },
    subMenuBgColor: { type: 'string', default: 'transparent' },
    subMenuPadding: {
        type: 'object',
        default: { top: '0.5rem', right: '1rem', bottom: '0.5rem', left: '1rem' }
    },
    subMenuWidth: { type: 'number', default: 240 },
} as const;
