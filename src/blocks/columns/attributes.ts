import {BlockAttribute} from '@wordpress/blocks';
import {PaddingAttribute} from "../../models/attr-shapes/padding-margin";
import type {MarginAttributes} from './margins';

export interface CoreColumnsAttributes extends MarginAttributes {
    htmlId: string;
    columns: number;
    tabletBreakpoint: number;
    desktopBreakpoint: number;

    // Base Layout (Mobile)
    mobileGap: number;
    mobilePadding: PaddingAttribute;
    mobileMaxWidth: string;
    mobileMaxHeight: string;
    horizontalAlignment: string;

    // Tablet Layout (Overrides)
    tabletGap: number;
    tabletPadding: PaddingAttribute;
    tabletMaxWidth: string;
    tabletMaxHeight: string;
    tabletHorizontalAlignment: string;

    // Desktop Layout (Overrides)
    gap: number; // Keep 'gap' as desktop for backward compatibility
    padding: PaddingAttribute; // Keep 'padding' as desktop for backward compatibility
    desktopMaxWidth: string;
    desktopMaxHeight: string;
    desktopHorizontalAlignment: string;

    // Border Radius (Mobile base, Tablet/Desktop overrides)
    borderRadius: string | Record<string, string>;
    tabletBorderRadius: string | Record<string, string>;
    desktopBorderRadius: string | Record<string, string>;

    backgroundImage: string;
    backgroundColor: string;
    backgroundGradient: string;
    backgroundVideo: string;
    tabletBackgroundImage: string;
    tabletBackgroundColor: string;
    tabletBackgroundGradient: string;
    tabletBackgroundVideo: string;
    desktopBackgroundImage: string;
    desktopBackgroundColor: string;
    desktopBackgroundGradient: string;
    desktopBackgroundVideo: string;
    backgroundImageOpacity: number;
    backgroundSize: string;
    backgroundPosition: string;
    tabletBackgroundPosition: string;
    desktopBackgroundPosition: string;
    backgroundRepeat: string;
    backgroundFixedPosition: boolean;
}

export const parentAttributes: Record<keyof CoreColumnsAttributes, BlockAttribute<any>> = {
    htmlId: {type: 'string', default: ''},
    columns: {type: 'number', default: 2},
    tabletBreakpoint: {type: 'number', default: 768},
    desktopBreakpoint: {type: 'number', default: 1024},
    style: { type: 'object' },
    mobileMargin: { type: 'object' },
    tabletMargin: { type: 'object' },
    desktopMargin: { type: 'object' },

    // Base Layout (Mobile)
    mobileGap: { type: 'number', default: 20 },
    mobilePadding: {
        type: 'object',
        default: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    },
    mobileMaxWidth: { type: 'string', default: '' },
    mobileMaxHeight: { type: 'string', default: '' },
    horizontalAlignment: { type: 'string', default: 'center' },

    // Tablet Layout (Overrides) - NO DEFAULTS
    tabletGap: { type: 'number' },
    tabletPadding: { type: 'object' },
    tabletMaxWidth: { type: 'string' },
    tabletMaxHeight: { type: 'string' },
    tabletHorizontalAlignment: { type: 'string' },

    // Desktop Layout (Overrides) - NO DEFAULTS
    gap: { type: 'number' },
    padding: { type: 'object' },
    desktopMaxWidth: { type: 'string' },
    desktopMaxHeight: { type: 'string' },
    desktopHorizontalAlignment: { type: 'string' },

    borderRadius: { type: 'object' },
    tabletBorderRadius: { type: 'object' },
    desktopBorderRadius: { type: 'object' },

    backgroundImage: { type: 'string', default: '' },
    backgroundColor: { type: 'string', default: '' },
    backgroundGradient: { type: 'string', default: '' },
    backgroundVideo: { type: 'string', default: '' },
    tabletBackgroundImage: { type: 'string' },
    tabletBackgroundColor: { type: 'string' },
    tabletBackgroundGradient: { type: 'string' },
    tabletBackgroundVideo: { type: 'string' },
    desktopBackgroundImage: { type: 'string' },
    desktopBackgroundColor: { type: 'string' },
    desktopBackgroundGradient: { type: 'string' },
    desktopBackgroundVideo: { type: 'string' },
    backgroundImageOpacity: { type: 'number', default: 100 },
    backgroundSize: { type: 'string', default: 'cover' },
    backgroundPosition: { type: 'string', default: 'center' },
    tabletBackgroundPosition: { type: 'string' },
    desktopBackgroundPosition: { type: 'string' },
    backgroundRepeat: { type: 'string', default: 'no-repeat' },
    backgroundFixedPosition: { type: 'boolean', default: false },
};
