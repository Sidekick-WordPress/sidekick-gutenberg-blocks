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

export interface MenuStyle {
    spacing?: {
        padding?: PaddingAttribute | string;
        margin?: PaddingAttribute | string;
        [key: string]: unknown;
    };
    typography?: {
        fontWeight?: string;
        textTransform?: string;
        [key: string]: unknown;
    };
    border?: { radius?: BorderRadius; [key: string]: unknown };
    [key: string]: unknown;
}

export interface NavMenuAttributes {
    style?: MenuStyle;
    subMenuStyle?: MenuStyle;
    styleVersion?: number;
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
