import {BlockAttribute} from '@wordpress/blocks';
import {PaddingAttribute} from "../../models/attr-shapes/padding-margin";

export interface CoreColumnsAttributes {
    columns: number;
    desktopBreakpoint: number;
    gap: number;
    mobileGap: number;
    padding: PaddingAttribute;
    mobilePadding: PaddingAttribute;
    desktopMaxWidth: number;
    mobileMaxWidth: number;
    backgroundImage: string;
    backgroundColor: string;
    backgroundImageOpacity: number;
    backgroundSize: string;
    backgroundPosition: string;
    backgroundRepeat: string;
    backgroundFixedPosition: boolean;
    backgroundVideo: string;
    backgroundVideoOpacity: number;
    horizontalAlignment: string;
    desktopMaxHeight: number;
    mobileMaxHeight: number;
}

export const parentAttributes: Record<keyof CoreColumnsAttributes, BlockAttribute<any>> = {
    columns: {type: 'number', default: 2},
    desktopBreakpoint: {type: 'number', default: 768},

    // Desktop Layout (Overrides) - NO DEFAULTS
    gap: { type: 'number' },
    padding: { type: 'object' },
    desktopMaxWidth: { type: 'number' },
    desktopMaxHeight: { type: 'number' },

    // Default layout values
    mobileGap: { type: 'number', default: 20 },
    mobilePadding: {
        type: 'object',
        default: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    },
    mobileMaxWidth: { type: 'number', default: 0 },
    mobileMaxHeight: { type: 'number', default: 0 },

    backgroundImage: { type: 'string', default: '' },
    backgroundColor: { type: 'string', default: '' },
    backgroundImageOpacity: { type: 'number', default: 100 },
    backgroundSize: { type: 'string', default: 'cover' },
    backgroundPosition: { type: 'string', default: 'center' },
    backgroundRepeat: { type: 'string', default: 'no-repeat' },
    backgroundFixedPosition: { type: 'boolean', default: false },
    backgroundVideo: { type: 'string', default: '' },
    backgroundVideoOpacity: { type: 'number', default: 100 },
    horizontalAlignment: { type: 'string', default: 'center' }
};
