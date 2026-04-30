import {BlockAttribute} from '@wordpress/blocks';
import {PaddingAttribute} from "../../models/attr-shapes/padding-margin";

export interface CoreColumnsAttributes {
    columns: number;
    tabletBreakpoint: number;
    desktopBreakpoint: number;

    // Base Layout (Mobile)
    mobileGap: number;
    mobilePadding: PaddingAttribute;
    mobileMaxWidth: number;
    mobileMaxHeight: number;
    horizontalAlignment: string;

    // Tablet Layout (Overrides)
    tabletGap: number;
    tabletPadding: PaddingAttribute;
    tabletMaxWidth: number;
    tabletMaxHeight: number;
    tabletHorizontalAlignment: string;

    // Desktop Layout (Overrides)
    gap: number; // Keep 'gap' as desktop for backward compatibility
    padding: PaddingAttribute; // Keep 'padding' as desktop for backward compatibility
    desktopMaxWidth: number;
    desktopMaxHeight: number;
    desktopHorizontalAlignment: string;

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
}

export const parentAttributes: Record<keyof CoreColumnsAttributes, BlockAttribute<any>> = {
    columns: {type: 'number', default: 2},
    tabletBreakpoint: {type: 'number', default: 768},
    desktopBreakpoint: {type: 'number', default: 1024},

    // Base Layout (Mobile)
    mobileGap: { type: 'number', default: 20 },
    mobilePadding: {
        type: 'object',
        default: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    },
    mobileMaxWidth: { type: 'number', default: 0 },
    mobileMaxHeight: { type: 'number', default: 0 },
    horizontalAlignment: { type: 'string', default: 'center' },

    // Tablet Layout (Overrides) - NO DEFAULTS
    tabletGap: { type: 'number' },
    tabletPadding: { type: 'object' },
    tabletMaxWidth: { type: 'number' },
    tabletMaxHeight: { type: 'number' },
    tabletHorizontalAlignment: { type: 'string' },

    // Desktop Layout (Overrides) - NO DEFAULTS
    gap: { type: 'number' },
    padding: { type: 'object' },
    desktopMaxWidth: { type: 'number' },
    desktopMaxHeight: { type: 'number' },
    desktopHorizontalAlignment: { type: 'string' },

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
};
