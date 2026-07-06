import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import Edit from './edit';
import Save from './save';
import Icon from './icon';

registerBlockType(metadata.name, {
    edit: Edit,
    save: Save,
    // Overrides block.json's "menu" dashicon with a red (#cc2936) SVG matching
    // the Sidekick Columns block. A dashicon string in block.json can't carry a
    // color, so the icon is supplied here in JS instead.
    icon: Icon,
} as any);
