import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    InspectorControls,
    RichText,
    __experimentalLinkControl as LinkControl
} from '@wordpress/block-editor';
import {
    PanelBody,
    ToggleControl,
    SelectControl,
    TextControl
} from '@wordpress/components';
import { BlockEditProps } from '@wordpress/blocks';
import type { CSSProperties } from 'react';

// Plugin
import namespace from '../../../namespace';

// Block
import { NavItemAttributes } from './attributes';

type LinkValue = {
    url?: string;
    opensInNewTab?: boolean;
};

export default function Edit({
                                 attributes,
                                 setAttributes,
                                 className
                             }: BlockEditProps<NavItemAttributes>) {
    const {
        label = 'Menu Item',
        url = '',
        opensInNewTab = false,
        rel = '',
        icon = '',
        iconPosition = 'left',
        showIcon = false,
        styleVariant = 'default',
    } = attributes;

    const blockProps = useBlockProps({
        className,
    });

    const iconMarkup = showIcon && icon ? (
        <span
            className={`${namespace}-nav-item__icon is-${iconPosition}`}
            aria-hidden="true"
        >
            {icon}
        </span>
    ) : null;

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Link Settings', namespace)}>
                    <TextControl
                        label={__('URL', namespace)}
                        value={url}
                        onChange={(value) => setAttributes({ url: value })}
                    />

                    <ToggleControl
                        label={__('Open in new tab', namespace)}
                        checked={opensInNewTab}
                        onChange={(value) => setAttributes({ opensInNewTab: value })}
                    />

                    <TextControl
                        label={__('Rel attribute', namespace)}
                        value={rel}
                        onChange={(value) => setAttributes({ rel: value })}
                        help={__('Optional. Example: nofollow', namespace)}
                    />
                </PanelBody>

                <PanelBody title={__('Icon Settings', namespace)} initialOpen={false}>
                    <ToggleControl
                        label={__('Show icon', namespace)}
                        checked={showIcon}
                        onChange={(value) => setAttributes({ showIcon: value })}
                    />

                    <TextControl
                        label={__('Icon slug / text', namespace)}
                        value={icon}
                        onChange={(value) => setAttributes({ icon: value })}
                        help={__('Temporary V1 field. Example: home, arrow, ★', namespace)}
                    />

                    <SelectControl
                        label={__('Icon Position', namespace)}
                        value={iconPosition}
                        options={[
                            { label: __('Left', namespace), value: 'left' },
                            { label: __('Right', namespace), value: 'right' },
                        ]}
                        onChange={(value) => setAttributes({ iconPosition: value as NavItemAttributes['iconPosition'] })}
                    />
                </PanelBody>

                <PanelBody title={__('Style Settings', namespace)} initialOpen={false}>
                    <SelectControl
                        label={__('Style Variant', namespace)}
                        value={styleVariant}
                        options={[
                            { label: __('Default', namespace), value: 'default' },
                            { label: __('Text', namespace), value: 'text' },
                            { label: __('Button', namespace), value: 'button' },
                        ]}
                        onChange={(value) => setAttributes({ styleVariant: value as NavItemAttributes['styleVariant'] })}
                    />
                </PanelBody>

                <PanelBody title={__('Better Link Picker', namespace)} initialOpen={false}>
                    <LinkControl
                        value={{ url, opensInNewTab } as LinkValue}
                        onChange={(value: LinkValue) =>
                            setAttributes({
                                url: value?.url || '',
                                opensInNewTab: !!value?.opensInNewTab,
                            })
                        }
                    />
                </PanelBody>
            </InspectorControls>

            <div {...blockProps}>
                <div
                    className={`${namespace}-nav-item is-variant-${styleVariant}`}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5em',
                    } as CSSProperties}
                >
                    {showIcon && iconPosition === 'left' && iconMarkup}

                    <RichText
                        tagName="span"
                        value={label}
                        allowedFormats={[]}
                        onChange={(value) => setAttributes({ label: value })}
                        placeholder={__('Menu label…', namespace)}
                        className={`${namespace}-nav-item__label`}
                    />

                    {showIcon && iconPosition === 'right' && iconMarkup}
                </div>
            </div>
        </>
    );
}
