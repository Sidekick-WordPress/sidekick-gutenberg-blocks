import {__} from '@wordpress/i18n';
import {useBlockProps, InspectorControls, PanelColorSettings} from '@wordpress/block-editor';
import {
    PanelBody,
    RangeControl,
    SelectControl,
    Spinner,
    ToggleControl,
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
        parentBgColorHover = '',
        parentColorHover = '',
        subMenuBgColorHover = '',
        subMenuColorHover = '',
        overlayBgColorHover = '',
        overlayColorHover = '',
        subMenuPadding = {top: '0.5rem', right: '1rem', bottom: '0.5rem', left: '1rem'},
        subMenuWidth = 240,
        subMenuTextAlign = 'right',
        subMenuAlignment = 'left',
        nestedSubMenuDirection = 'right',
        showSubMenuArrows = true,
        overlayBgColor = '',
        overlayColor = '',
        textTransform = 'none',
        fontWeight = '',
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
                    <ToggleControl
                        label={__('Show Sub-Menu Arrows', namespace)}
                        checked={showSubMenuArrows}
                        onChange={(value) => setAttributes({ showSubMenuArrows: value })}
                    />
                    <SelectControl
                        label={__('Top-Level Sub-Menu Alignment', namespace)}
                        value={subMenuAlignment}
                        options={[
                            { label: __('Align Left', namespace), value: 'left' },
                            { label: __('Align Right', namespace), value: 'right' },
                        ]}
                        onChange={(value) =>
                            setAttributes({
                                subMenuAlignment: value as NavMenuAttributes['subMenuAlignment'],
                            })
                        }
                    />
                    <SelectControl
                        label={__('Nested Sub-Menu Direction', namespace)}
                        value={nestedSubMenuDirection}
                        options={[
                            { label: __('Open Right', namespace), value: 'right' },
                            { label: __('Open Left', namespace), value: 'left' },
                        ]}
                        onChange={(value) =>
                            setAttributes({
                                nestedSubMenuDirection: value as NavMenuAttributes['nestedSubMenuDirection'],
                            })
                        }
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

                {/* Native Typography Tab Injection */}
                <InspectorControls group="typography">
                    <SelectControl
                        label={__('Sub-Menu Text Align', namespace)}
                        value={subMenuTextAlign}
                        options={[
                            { label: __('Left', namespace), value: 'left' },
                            { label: __('Center', namespace), value: 'center' },
                            { label: __('Right', namespace), value: 'right' },
                        ]}
                        onChange={(value) =>
                            setAttributes({
                                subMenuTextAlign: value as NavMenuAttributes['subMenuTextAlign'],
                            })
                        }
                    />
                    <SelectControl
                        label={__('Text Transform', namespace)}
                        value={textTransform}
                        options={[
                            { label: __('None', namespace), value: 'none' },
                            { label: __('Uppercase', namespace), value: 'uppercase' },
                            { label: __('Lowercase', namespace), value: 'lowercase' },
                            { label: __('Capitalize', namespace), value: 'capitalize' },
                        ]}
                        onChange={(value) =>
                            setAttributes({
                                textTransform: value as NavMenuAttributes['textTransform'],
                            })
                        }
                    />
                    {/* NEW FONT WEIGHT CONTROL */}
                    <SelectControl
                        label={__('Font Weight', namespace)}
                        value={fontWeight}
                        options={[
                            { label: __('Default', namespace), value: '' },
                            { label: __('Thin (100)', namespace), value: '100' },
                            { label: __('Extra Light (200)', namespace), value: '200' },
                            { label: __('Light (300)', namespace), value: '300' },
                            { label: __('Normal (400)', namespace), value: '400' },
                            { label: __('Medium (500)', namespace), value: '500' },
                            { label: __('Semi Bold (600)', namespace), value: '600' },
                            { label: __('Bold (700)', namespace), value: '700' },
                            { label: __('Extra Bold (800)', namespace), value: '800' },
                            { label: __('Black (900)', namespace), value: '900' },
                        ]}
                        onChange={(value) =>
                            setAttributes({
                                fontWeight: value as NavMenuAttributes['fontWeight'],
                            })
                        }
                    />
                </InspectorControls>

                <PanelColorSettings
                    title={__('Parent Menu Colors', namespace)}
                    initialOpen={true}
                    colorSettings={[
                        { value: parentBgColor, onChange: (v) => setAttributes({ parentBgColor: v || 'transparent' }), label: __('Background', namespace) },
                        { value: parentBgColorHover, onChange: (v) => setAttributes({ parentBgColorHover: v || '' }), label: __('Background (Hover)', namespace) },
                        { value: parentColor, onChange: (v) => setAttributes({ parentColor: v || 'inherit' }), label: __('Text Color', namespace) },
                        { value: parentColorHover, onChange: (v) => setAttributes({ parentColorHover: v || '' }), label: __('Text Color (Hover)', namespace) },
                    ]}
                />

                <PanelColorSettings
                    title={__('Sub-Menu Colors', namespace)}
                    initialOpen={false}
                    colorSettings={[
                        { value: subMenuBgColor, onChange: (v) => setAttributes({ subMenuBgColor: v || 'transparent' }), label: __('Container Background', namespace) },
                        { value: subMenuBgColorHover, onChange: (v) => setAttributes({ subMenuBgColorHover: v || '' }), label: __('Item Background (Hover)', namespace) },
                        { value: subMenuColor, onChange: (v) => setAttributes({ subMenuColor: v || 'inherit' }), label: __('Text Color', namespace) },
                        { value: subMenuColorHover, onChange: (v) => setAttributes({ subMenuColorHover: v || '' }), label: __('Text Color (Hover)', namespace) },
                    ]}
                />

                <PanelColorSettings
                    title={__('Mobile Overlay Colors', namespace)}
                    initialOpen={false}
                    colorSettings={[
                        { value: overlayBgColor, onChange: (v) => setAttributes({ overlayBgColor: v || '' }), label: __('Overlay Background', namespace) },
                        { value: overlayBgColorHover, onChange: (v) => setAttributes({ overlayBgColorHover: v || '' }), label: __('Item Background (Hover)', namespace) },
                        { value: overlayColor, onChange: (v) => setAttributes({ overlayColor: v || '' }), label: __('Text Color', namespace) },
                        { value: overlayColorHover, onChange: (v) => setAttributes({ overlayColorHover: v || '' }), label: __('Text Color (Hover)', namespace) },
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
