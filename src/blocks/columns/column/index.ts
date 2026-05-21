import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

// Plugin
import namespace from '../../../namespace';

// Block
import { columnAttributes } from './attributes';
import Edit from './edit';
import Save from './save';
import Icon from './Icon';

registerBlockType(`${namespace}/column`, {
    apiVersion: 3,
    title: __('Sidekick Single Column', namespace),
    parent: [`${namespace}/columns`],
    icon: Icon,
    category: 'layout',
    attributes: columnAttributes,
    usesContext: [
        `${namespace}/tabletBreakpoint`,
        `${namespace}/desktopBreakpoint`
    ],
    edit: Edit,
    save: Save,
} as any);
