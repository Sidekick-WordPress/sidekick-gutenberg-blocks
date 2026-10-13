import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';

// Plugin
import namespace from '../../namespace';

// Block
import { parentAttributes } from './attributes';
import Edit from './edit';
import Save from './save';
import './column';
import Icon from './icon';
import {ZERO_SPACING, recoverClearedColumnsPadding} from './spacing';

addFilter('blocks.getBlockAttributes', `${namespace}/columns-padding`, recoverClearedColumnsPadding);

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
        shadow: true,
        spacing: {
            margin: false,
            __experimentalSkipSerialization: ['margin'],
        },
    },
    edit: Edit,
    save: Save,
} as any);
