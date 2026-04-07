import {__} from '@wordpress/i18n';
import {useBlockProps, InspectorControls, PanelColorSettings} from '@wordpress/block-editor';
import {
    PanelBody,
    RangeControl,
    SelectControl,
    Spinner,
    __experimentalBoxControl as BoxControl
} from '@wordpress/components';
import {useSelect} from '@wordpress/data';
import ServerSideRender from '@wordpress/server-side-render';
import {BlockEditProps} from '@wordpress/blocks';

// Plugin
import namespace from '../../namespace';
import {NavMenuAttributes, PaddingAttribute} from './attributes';
import metadata from './block.json';

export default function Edit(
    {
        attributes,
        setAttributes,
        className
    }: BlockEditProps<NavMenuAttributes>) {
    const {
        ref,
        orientation = 'horizontal',
        gap = 24,
        mobileGap = 12,
        parentPadding = {top: '0.5rem', right: '1rem', bottom: '0.5rem', left: '1rem'},
        parentBgColor = 'transparent',
        parentColor = 'inherit',
        subMenuColor = 'inherit',
        subMenuBgColor = 'transparent',
        subMenuPadding = {top: '0.5rem', right: '1rem', bottom: '0.5rem', left: '1rem'},
        subMenuWidth = 240,
        overlayBgColor = '',
        overlayColor = '',
    } = attributes;

    const blockProps = useBlockProps({
        className: `${className ?? ''} ${namespace}-nav-menu`.trim(),
    });

    const navigationMenus = useSelect((select: any) => {
        return select('core').getEntityRecords('postType', 'wp_navigation', {
            per_page: -1,
            status: 'publish',
        });
    }, []);

    const menuOptions = [
        {label: __('Select a menu', namespace), value: 0},
        ...(navigationMenus?.map((menu: any) => ({
            label: menu.title?.rendered || __('(Untitled)', namespace),
            value: menu.id,
        })) || [])
    ];

    return (
        <div {...blockProps}>
            {/* Standard Settings Tab */}
            <InspectorControls>
                <PanelBody title={__('Menu Selection', namespace)}>
                    {!navigationMenus ? (
                        <Spinner/>
                    ) : (
                        <SelectControl
                            label={__('Navigation Menu', namespace)}
                            value={ref || 0}
                            options={menuOptions}
                            onChange={(value) => setAttributes({ref: parseInt(value, 10)})}
                        />
                    )}
                </PanelBody>

                <PanelBody title={__('Layout Settings', namespace)}>
                    <SelectControl
                        label={__('Orientation', namespace)}
                        value={orientation}
                        options={[
                            {label: __('Horizontal', namespace), value: 'horizontal'},
                            {label: __('Vertical', namespace), value: 'vertical'},
                        ]}
                        onChange={(value) => setAttributes({orientation: value as NavMenuAttributes['orientation']})}
                    />
                    <RangeControl
                        label={__('Desktop Gap', namespace)}
                        value={gap}
                        onChange={(value) => setAttributes({gap: value ?? 24})}
                        min={0} max={120}
                    />
                    <RangeControl
                        label={__('Mobile Gap', namespace)}
                        value={mobileGap}
                        onChange={(value) => setAttributes({mobileGap: value ?? 12})}
                        min={0} max={120}
                    />
                </PanelBody>
            </InspectorControls>

            {/* Styles Tab (Half-Filled Circle Icon) */}
            <InspectorControls group="styles">
                <PanelBody title={__('Padding & Spacing', namespace)}>
                    <BoxControl
                        label={__('Parent Item Padding', namespace)}
                        values={parentPadding}
                        onChange={(v) => {
                            const isReset = !v || Object.values(v).every(val => val === undefined || val === '');
                            setAttributes({
                                parentPadding: isReset
                                    ? {top: '0px', right: '0px', bottom: '0px', left: '0px'}
                                    : v as PaddingAttribute
                            });
                        }}
                    />
                    <BoxControl
                        label={__('Sub-Menu Item Padding', namespace)}
                        values={subMenuPadding}
                        onChange={(v) => {
                            const isReset = !v || Object.values(v).every(val => val === undefined || val === '');
                            setAttributes({
                                subMenuPadding: isReset
                                    ? {top: '0px', right: '0px', bottom: '0px', left: '0px'}
                                    : v as PaddingAttribute
                            });
                        }}
                    />
                    <RangeControl
                        label={__('Sub-Menu Max Width (px)', namespace)}
                        value={subMenuWidth}
                        onChange={(value) => setAttributes({subMenuWidth: value ?? 240})}
                        min={100} max={600}
                    />
                </PanelBody>

                <PanelColorSettings
                    title={__('Menu Colors', namespace)}
                    colorSettings={[
                        {
                            value: parentBgColor,
                            onChange: (colorValue) => setAttributes({ parentBgColor: colorValue || 'transparent' }),
                            label: __('Parent Menu Background', namespace),
                        },
                        {
                            value: parentColor,
                            onChange: (colorValue) => setAttributes({ parentColor: colorValue || 'inherit' }),
                            label: __('Parent Menu Text Color', namespace),
                        },
                        {
                            value: subMenuBgColor,
                            onChange: (colorValue) => setAttributes({ subMenuBgColor: colorValue || 'transparent' }),
                            label: __('Sub-Menu Background', namespace),
                        },
                        {
                            value: subMenuColor,
                            onChange: (colorValue) => setAttributes({ subMenuColor: colorValue || 'inherit' }),
                            label: __('Sub-Menu Text Color', namespace),
                        },
                        {
                            value: overlayBgColor,
                            onChange: (colorValue) => setAttributes({ overlayBgColor: colorValue || '' }),
                            label: __('Overlay Background', namespace),
                        },
                        {
                            value: overlayColor,
                            onChange: (colorValue) => setAttributes({ overlayColor: colorValue || '' }),
                            label: __('Overlay Text Color', namespace),
                        },
                    ]}
                />
            </InspectorControls>

            {ref ? (
                <ServerSideRender
                    block={metadata.name}
                    attributes={attributes}
                />
            ) : (
                <div style={{padding: '24px', border: '2px dashed #ccc', textAlign: 'center'}}>
                    {__('Please select a Navigation Menu.', namespace)}
                </div>
            )}
        </div>
    );
}
