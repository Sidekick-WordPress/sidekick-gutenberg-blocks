import { registerBlockType, createBlock } from '@wordpress/blocks';
import metadata from './block.json';
import Edit from './edit';
import Save from './save';
import './nav-item';

type WPBlock = {
    name: string;
    attributes?: Record<string, any>;
    innerBlocks?: WPBlock[];
};

function mapCoreNavLinkToNavItem(block: WPBlock) {
    if (block.name !== 'core/navigation-link') {
        return null;
    }

    const attrs = block.attributes || {};

    return createBlock('sgb/nav-item', {
        label: attrs.label || attrs.title || 'Menu Item',
        url: attrs.url || '',
        opensInNewTab: !!attrs.opensInNewTab,
        rel: attrs.rel || '',
        showIcon: false,
        icon: '',
        iconPosition: 'left',
        styleVariant: 'default',
    });
}

function mapCoreNavigationToNavMenu(block: WPBlock) {
    const innerBlocks = Array.isArray(block.innerBlocks) ? block.innerBlocks : [];

    const mappedChildren = innerBlocks
        .map(mapCoreNavLinkToNavItem)
        .filter(Boolean) as any[];

    return createBlock(
        'sgb/nav-menu',
        {
            orientation: 'horizontal',
            justifyContent: 'right',
            gap: 24,
            mobileGap: 12,
            desktopBreakpoint: 768,
        },
        mappedChildren
    );
}

registerBlockType(metadata.name, {
    transforms: {
        from: [
            {
                type: 'block',
                blocks: ['core/navigation'],
                transform: (block: WPBlock) => mapCoreNavigationToNavMenu(block),
                isMatch: (block: WPBlock) => {
                    const innerBlocks = Array.isArray(block.innerBlocks) ? block.innerBlocks : [];
                    return (
                        innerBlocks.length > 0 &&
                        innerBlocks.every((child) => child.name === 'core/navigation-link')
                    );
                },
            },
        ],
    },
    edit: Edit,
    save: Save,
} as any);
