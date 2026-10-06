import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

// Plugin
import namespace from '../../namespace';

// Block
import { parentAttributes } from './attributes';
import Edit from './edit';
import Save from './save';
import './column';
import Icon from './icon';
import {ZERO_SPACING} from './spacing';

registerBlockType(`${namespace}/columns`, {
    apiVersion: 3,
    title: __('Sidekick Columns', namespace),
    icon: Icon,
    category: 'layout',
    attributes: parentAttributes,
    // Inserter defaults are serialized explicitly. Schema defaults would also
    // apply to older blocks and mask their saved core margins or cleared values.
    variations: [{
        name: 'default',
        isDefault: true,
        scope: ['inserter'],
        attributes: {mobileMargin: {...ZERO_SPACING}},
    }],
    providesContext: {
        [`${namespace}/tabletBreakpoint`]: 'tabletBreakpoint',
        [`${namespace}/desktopBreakpoint`]: 'desktopBreakpoint'
    },
    supports: {
        spacing: {
            margin: false,
            __experimentalSkipSerialization: ['margin'],
        },
    },
    edit: Edit,
    save: Save,
} as any);
