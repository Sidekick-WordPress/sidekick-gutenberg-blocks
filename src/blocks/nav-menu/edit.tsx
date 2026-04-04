import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, RangeControl, SelectControl, Spinner } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import ServerSideRender from '@wordpress/server-side-render';
import { BlockEditProps } from '@wordpress/blocks';

// Plugin
import namespace from '../../namespace';
import { NavMenuAttributes } from './attributes';
import metadata from './block.json';

export default function Edit({
                                 attributes,
                                 setAttributes,
                                 className
                             }: BlockEditProps<NavMenuAttributes>) {
    const {
        ref,
        orientation = 'horizontal',
        justifyContent = 'right',
        gap = 24,
        mobileGap = 12,
        desktopBreakpoint = 768,
    } = attributes;

    const blockProps = useBlockProps({ className });

    // Fetch all available navigation menus (wp_navigation posts)
    const navigationMenus = useSelect((select: any) => {
        return select('core').getEntityRecords('postType', 'wp_navigation', {
            per_page: -1,
            status: 'publish',
        });
    }, []);

    const menuOptions = [
        { label: __('Select a menu', namespace), value: 0 },
        ...(navigationMenus?.map((menu: any) => ({
            label: menu.title?.rendered || __('(Untitled)', namespace),
            value: menu.id,
        })) || [])
    ];

    return (
        <div {...blockProps}>
            <InspectorControls>
                <PanelBody title={__('Menu Selection', namespace)}>
                    {!navigationMenus ? (
                        <Spinner />
                    ) : (
                        <SelectControl
                            label={__('Navigation Menu', namespace)}
                            value={ref || 0}
                            options={menuOptions}
                            onChange={(value) => setAttributes({ ref: parseInt(value, 10) })}
                            help={__('Select a menu managed in the FSE Navigation panel.', namespace)}
                        />
                    )}
                </PanelBody>

                <PanelBody title={__('Menu Settings', namespace)}>
                    <SelectControl
                        label={__('Orientation', namespace)}
                        value={orientation}
                        options={[
                            {label: __('Horizontal', namespace), value: 'horizontal'},
                            {label: __('Vertical', namespace), value: 'vertical'},
                        ]}
                        onChange={(value) => setAttributes({orientation: value as NavMenuAttributes['orientation']})}
                    />

                    <SelectControl
                        label={__('Justify Content', namespace)}
                        value={justifyContent}
                        options={[
                            {label: __('Left', namespace), value: 'left'},
                            {label: __('Center', namespace), value: 'center'},
                            {label: __('Right', namespace), value: 'right'},
                            {label: __('Space Between', namespace), value: 'space-between'},
                        ]}
                        onChange={(value) => setAttributes({justifyContent: value as NavMenuAttributes['justifyContent']})}
                    />

                    <RangeControl
                        label={__('Desktop Gap', namespace)}
                        value={gap}
                        onChange={(value) => setAttributes({gap: value ?? 24})}
                        min={0}
                        max={120}
                    />

                    <RangeControl
                        label={__('Mobile Gap', namespace)}
                        value={mobileGap}
                        onChange={(value) => setAttributes({mobileGap: value ?? 12})}
                        min={0}
                        max={120}
                    />

                    <RangeControl
                        label={__('Desktop Breakpoint (px)', namespace)}
                        value={desktopBreakpoint}
                        onChange={(value) => setAttributes({desktopBreakpoint: value ?? 768})}
                        min={320}
                        max={1600}
                    />
                </PanelBody>
            </InspectorControls>

            {ref ? (
                <ServerSideRender
                    block={metadata.name}
                    attributes={attributes}
                />
            ) : (
                <div style={{ padding: '24px', border: '2px dashed #ccc', textAlign: 'center', backgroundColor: '#f9f9f9' }}>
                    {__('Please select a Navigation Menu from the block settings in the sidebar.', namespace)}
                </div>
            )}
        </div>
    );
}
