export interface PaddingAttribute {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
}

export type BorderRadius = string | {
    topLeft?: string;
    topRight?: string;
    bottomRight?: string;
    bottomLeft?: string;
};

export interface MenuTypography {
    fontFamily?: string;
    fontSize?: string | number;
    fontStyle?: string;
    fontWeight?: string;
    lineHeight?: string | number;
    letterSpacing?: string;
    textTransform?: string;
    textDecoration?: string;
}

export interface MenuStyle {
    spacing?: {
        padding?: PaddingAttribute | string;
        margin?: PaddingAttribute | string;
        [key: string]: unknown;
    };
    typography?: MenuTypography;
    border?: { radius?: BorderRadius; [key: string]: unknown };
    [key: string]: unknown;
}

export interface NavMenuAttributes {
    style?: MenuStyle;
    subMenuStyle?: MenuStyle;
    mobileMenuStyle?: MenuStyle;
    mobileSubMenuStyle?: MenuStyle;
    fontFamily?: string;
    fontSize?: string;
    styleVersion?: number;
    ref?: number;
    orientation?: 'horizontal' | 'vertical';
    gap?: number;
    mobileGap?: number;
    mobileItemSpacing?: number;
    mobileSubMenuIndent?: number;
    desktopItemPadding?: PaddingAttribute;
    mobileItemPadding?: PaddingAttribute;
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
    hoverTransitionDuration?: number;
    subMenuPadding?: PaddingAttribute;
    subMenuWidth?: string | number;
    subMenuBoxShadow?: string;
    subMenuBorderRadius?: number;
    subMenuTextAlign?: 'left' | 'center' | 'right';
    subMenuAlignment?: 'left' | 'right';
    nestedSubMenuDirection?: 'left' | 'right';
    showSubMenuArrows?: boolean;
    collapsibleSubMenus?: boolean;
    subMenuIndicator?: string;
    subMenuIndentColor?: string;
    subMenuToggleShadowColor?: string;
    overlayBgColor?: string;
    overlayColor?: string;
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    fontWeight?: string;
}
