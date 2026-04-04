export interface NavItemAttributes {
    label?: string;
    url?: string;
    opensInNewTab?: boolean;
    rel?: string;
    icon?: string;
    iconPosition?: 'left' | 'right';
    showIcon?: boolean;
    styleVariant?: 'default' | 'button' | 'text';
}

export const navItemAttributes = {
    label: {
        type: 'string',
        default: 'Menu Item',
    },
    url: {
        type: 'string',
        default: '',
    },
    opensInNewTab: {
        type: 'boolean',
        default: false,
    },
    rel: {
        type: 'string',
        default: '',
    },
    icon: {
        type: 'string',
        default: '',
    },
    iconPosition: {
        type: 'string',
        default: 'left',
    },
    showIcon: {
        type: 'boolean',
        default: false,
    },
    styleVariant: {
        type: 'string',
        default: 'default',
    },
} as const;
