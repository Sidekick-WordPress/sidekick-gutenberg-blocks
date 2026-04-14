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
    parentBgColorHover?: string;
    parentColorHover?: string;
    subMenuBgColorHover?: string;
    subMenuColorHover?: string;
    overlayBgColorHover?: string;
    overlayColorHover?: string;
    subMenuPadding?: PaddingAttribute;
    subMenuWidth?: number;
    subMenuTextAlign?: 'left' | 'center' | 'right';
    subMenuAlignment?: 'left' | 'right';
    nestedSubMenuDirection?: 'left' | 'right';
    showSubMenuArrows?: boolean;
    overlayBgColor?: string;
    overlayColor?: string;
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
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
    parentBgColorHover: { type: 'string', default: '' },
    parentColorHover: { type: 'string', default: '' },
    subMenuBgColorHover: { type: 'string', default: '' },
    subMenuColorHover: { type: 'string', default: '' },
    overlayBgColorHover: { type: 'string', default: '' },
    overlayColorHover: { type: 'string', default: '' },
    subMenuPadding: {
        type: 'object',
        default: { top: '0.5rem', right: '1rem', bottom: '0.5rem', left: '1rem' }
    },
    subMenuWidth: { type: 'number', default: 240 },
    subMenuTextAlign: { type: 'string', default: 'right' },
    subMenuAlignment: { type: 'string', default: 'left' },
    nestedSubMenuDirection: { type: 'string', default: 'right' },
    showSubMenuArrows: { type: 'boolean', default: true },
    overlayBgColor: { type: 'string', default: '' },
    overlayColor: { type: 'string', default: '' },
    textTransform: { type: 'string', default: 'none' },
} as const;
