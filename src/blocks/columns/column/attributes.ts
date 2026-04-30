import { BlockAttribute } from '@wordpress/blocks';
import { PaddingAttribute } from "../../../models/attr-shapes/padding-margin";

export interface ColumnAttributes {
    // Widths
    width: number; // Base (Mobile)
    tabletWidth: number;
    desktopWidth: number;

    // Padding
    mobilePadding: PaddingAttribute; // Base
    tabletPadding: PaddingAttribute;
    padding: PaddingAttribute; // Desktop (Keep for compatibility)

    // Vertical Alignment
    vAlign: string; // Base
    tabletVAlign: string;
    desktopVAlign: string;

    mobileOrder: number;
    backgroundImage: string;
    backgroundColor: string;
    tabletBackgroundImage: string;
    tabletBackgroundColor: string;
    desktopBackgroundImage: string;
    desktopBackgroundColor: string;
    backgroundImageOpacity: number;
    backgroundSize: string;
    backgroundPosition: string;
    backgroundRepeat: string;
    backgroundFixedPosition: boolean;

    // Inner Content
    innerMaxWidth: string; // Base
    tabletInnerMaxWidth: string;
    desktopInnerMaxWidth: string;

    contentHAlign: string; // Base
    tabletContentHAlign: string;
    desktopContentHAlign: string;

    border: Record<string, any>;
    borderRadius: string;

    // Advanced Layout - Base (All Screens)
    extendTop: string;
    extendBottom: string;
    translateX: string;
    translateY: string;

    // Advanced Layout - Tablet Overrides
    tabExtendTop: string;
    tabExtendBottom: string;
    tabTranslateX: string;
    tabTranslateY: string;

    // Advanced Layout - Desktop Overrides
    deskExtendTop: string;
    deskExtendBottom: string;
    deskTranslateX: string;
    deskTranslateY: string;

    zIndex: number;
}

export const columnAttributes: Record<keyof ColumnAttributes, BlockAttribute<any>> = {
    // Widths
    width: { type: 'number', default: 100 },
    tabletWidth: { type: 'number' },
    desktopWidth: { type: 'number' },

    // Padding
    mobilePadding: {
        type: 'object',
        default: { top: '10px', right: '10px', bottom: '10px', left: '10px' }
    },
    tabletPadding: { type: 'object' },
    padding: { type: 'object' },

    // Vertical Alignment
    vAlign: { type: 'string', default: 'flex-start' },
    tabletVAlign: { type: 'string' },
    desktopVAlign: { type: 'string' },

    mobileOrder: { type: 'number', default: 0 },
    backgroundImage: { type: 'string', default: '' },
    backgroundColor: { type: 'string', default: '' },
    tabletBackgroundImage: { type: 'string' },
    tabletBackgroundColor: { type: 'string' },
    desktopBackgroundImage: { type: 'string' },
    desktopBackgroundColor: { type: 'string' },
    backgroundImageOpacity: { type: 'number', default: 100 },
    backgroundSize: { type: 'string', default: 'cover' },
    backgroundPosition: { type: 'string', default: 'center' },
    backgroundRepeat: { type: 'string', default: 'no-repeat' },
    backgroundFixedPosition: { type: 'boolean', default: false },

    // Inner Content
    innerMaxWidth: { type: 'string', default: '' },
    tabletInnerMaxWidth: { type: 'string' },
    desktopInnerMaxWidth: { type: 'string' },

    contentHAlign: { type: 'string', default: 'left' },
    tabletContentHAlign: { type: 'string' },
    desktopContentHAlign: { type: 'string' },

    border: { type: 'object' },
    borderRadius: { type: 'string', default: '' },

    // Advanced Layout - Base
    extendTop: { type: 'string', default: '' },
    extendBottom: { type: 'string', default: '' },
    translateX: { type: 'string', default: '' },
    translateY: { type: 'string', default: '' },

    // Advanced Layout - Tablet
    tabExtendTop: { type: 'string', default: '' },
    tabExtendBottom: { type: 'string', default: '' },
    tabTranslateX: { type: 'string', default: '' },
    tabTranslateY: { type: 'string', default: '' },

    // Advanced Layout - Desktop
    deskExtendTop: { type: 'string', default: '' },
    deskExtendBottom: { type: 'string', default: '' },
    deskTranslateX: { type: 'string', default: '' },
    deskTranslateY: { type: 'string', default: '' },

    zIndex: { type: 'number', default: 1 },
};
