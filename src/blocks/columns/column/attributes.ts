import { BlockAttribute } from '@wordpress/blocks';
import {PaddingAttribute} from "../../../models/attr-shapes/padding-margin";

export interface ColumnAttributes {
    width: number;
    padding: PaddingAttribute;
    mobilePadding: PaddingAttribute;
    vAlign: string;
    mobileOrder: number;
}

export const columnAttributes: Record<keyof ColumnAttributes, BlockAttribute<any>> = {
    width: { type: 'number', default: 0 },
    // Desktop Layout (Override) - NO DEFAULT
    padding: { type: 'object' },
    // Mobile Layout (Base) - HAS DEFAULT
    mobilePadding: {
        type: 'object',
        default: { top: '10px', right: '10px', bottom: '10px', left: '10px' }
    },
    vAlign: { type: 'string', default: 'flex-start' },
    mobileOrder: { type: 'number', default: 0 }
};
