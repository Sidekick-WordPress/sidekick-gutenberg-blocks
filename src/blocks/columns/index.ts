import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

// Plugin
import namespace from '../../namespace';

// Block
import { parentAttributes } from './attributes';
import Edit from './edit';
import Save from './save';
import './column';

registerBlockType(`${namespace}/columns`, {
    apiVersion: 3,
    title: __('Sidekick Columns', namespace),
    icon: 'columns',
    category: 'layout',
    attributes: parentAttributes,
    providesContext: {
        [`${namespace}/desktopBreakpoint`]: 'desktopBreakpoint'
    },
    edit: Edit,
    save: Save,
} as any);
