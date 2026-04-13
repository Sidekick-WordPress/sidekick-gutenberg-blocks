import { BlockAttribute } from '@wordpress/blocks';
import {PaddingAttribute} from "../../../models/attr-shapes/padding-margin";

export interface ColumnAttributes {
    width: number;
    padding: PaddingAttribute;
    mobilePadding: PaddingAttribute;
    vAlign: string;
    mobileOrder: number;
    backgroundImage: string;
    backgroundColor: string;
    backgroundImageOpacity: number;
    backgroundSize: string;
    backgroundPosition: string;
    backgroundRepeat: string;
    backgroundFixedPosition: boolean;
    innerMaxWidth: string;
    contentHAlign: string;
    // Both Border Attributes
    border: Record<string, any>;
    borderRadius: string;
}

export const columnAttributes: Record<keyof ColumnAttributes, BlockAttribute<any>> = {
    width: { type: 'number', default: 0 },
    padding: { type: 'object' },
    mobilePadding: {
        type: 'object',
        default: { top: '10px', right: '10px', bottom: '10px', left: '10px' }
    },
    vAlign: { type: 'string', default: 'flex-start' },
    mobileOrder: { type: 'number', default: 0 },
    backgroundImage: { type: 'string', default: '' },
    backgroundColor: { type: 'string', default: '' },
    backgroundImageOpacity: { type: 'number', default: 100 },
    backgroundSize: { type: 'string', default: 'cover' },
    backgroundPosition: { type: 'string', default: 'center' },
    backgroundRepeat: { type: 'string', default: 'no-repeat' },
    backgroundFixedPosition: { type: 'boolean', default: false },
    innerMaxWidth: { type: 'string', default: '' },
    contentHAlign: { type: 'string', default: 'left' },
    // Both Border Attributes
    border: { type: 'object' },
    borderRadius: { type: 'string', default: '' },
};
