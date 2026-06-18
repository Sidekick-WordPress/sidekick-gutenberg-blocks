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
    mobileFontSize?: number;
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
    subMenuBoxShadow?: string;
    subMenuBorderRadius?: number;
    subMenuTextAlign?: 'left' | 'center' | 'right';
    subMenuAlignment?: 'left' | 'right';
    nestedSubMenuDirection?: 'left' | 'right';
    showSubMenuArrows?: boolean;
    subMenuIndicator?: string;
    overlayBgColor?: string;
    overlayColor?: string;
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    fontWeight?: string;
}

export const navMenuAttributes = {
    ref: { type: 'number', default: 0 },
    orientation: { type: 'string', default: 'horizontal' },
    gap: { type: 'number', default: 24 },
    mobileGap: { type: 'number', default: 12 },
    mobileFontSize: { type: 'number', default: 24 },
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
    subMenuBoxShadow: { type: 'string', default: '0 8px 24px rgba(0, 0, 0, 0.12)' },
    subMenuBorderRadius: { type: 'number', default: 0 },
    subMenuTextAlign: { type: 'string', default: 'right' },
    subMenuAlignment: { type: 'string', default: 'left' },
    nestedSubMenuDirection: { type: 'string', default: 'right' },
    showSubMenuArrows: { type: 'boolean', default: true },
    subMenuIndicator: {
        type: 'string',
        default: '<svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m16.843 10.211c.108-.141.157-.3.157-.456 0-.389-.306-.755-.749-.755h-8.501c-.445 0-.75.367-.75.755 0 .157.05.316.159.457 1.203 1.554 3.252 4.199 4.258 5.498.142.184.36.29.592.29.23 0 .449-.107.591-.291zm-7.564.289h5.446l-2.718 3.522z" fill-rule="nonzero"/></svg>'
    },
    overlayBgColor: { type: 'string', default: '' },
    overlayColor: { type: 'string', default: '' },
    textTransform: { type: 'string', default: 'none' },
    fontWeight: { type: 'string', default: '' }
} as const;
