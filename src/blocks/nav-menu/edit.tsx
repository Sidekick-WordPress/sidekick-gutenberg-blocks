import {__} from '@wordpress/i18n';
import {
    useBlockProps, InspectorControls, PanelColorSettings,
    __experimentalBorderRadiusControl as BorderRadiusControl,
} from '@wordpress/block-editor';
import {
    PanelBody,
    RangeControl,
    SelectControl,
    Spinner,
    TextControl,
    TextareaControl,
    ToggleControl,
    __experimentalBoxControl as BoxControl
} from '@wordpress/components';
import {useSelect} from '@wordpress/data';
import {useEffect, useRef} from '@wordpress/element';
import ServerSideRender from '@wordpress/server-side-render';
import {BlockEditProps} from '@wordpress/blocks';

// Plugin
import namespace from '../../namespace';
import {NavMenuAttributes, BorderRadius} from './attributes';
import {migrateMenuStyles} from './migrate';
import {setupCollapsibleSubmenus} from './collapsible';
import metadata from './block.json';

// Shared className stamped on every inspector panel below so the light editor
// polish in _edit.scss can target these panels without leaking onto other
// blocks' sidebars.
const PANEL_CLASS = `${namespace}-inspector-panel`;

export default function Edit(
    {
        attributes,
        setAttributes,
        className
    }: BlockEditProps<NavMenuAttributes>) {
    const normalizedAttributes = migrateMenuStyles(attributes);
    useEffect(() => {
        if (normalizedAttributes !== attributes) setAttributes(normalizedAttributes);
    }, [attributes, normalizedAttributes, setAttributes]);

    const {
        ref,
        orientation = 'horizontal',
        gap = 24,
        mobileGap = 12,
        mobileFontSize = 24,
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
        subMenuStyle = {},
        subMenuWidth = '240px',
        subMenuBoxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)',
        subMenuTextAlign = 'right',
        subMenuAlignment = 'left',
        nestedSubMenuDirection = 'right',
        showSubMenuArrows = true,
        collapsibleSubMenus = true,
        subMenuIndicator = '',
        subMenuIndentColor = '',
        subMenuToggleShadowColor = '',
        overlayBgColor = '',
        overlayColor = '',
    } = normalizedAttributes;

    const subMenuPadding = subMenuStyle.spacing?.padding;

    // The editor wrapper already receives native block margin. Exclude only
    // that spacing from the nested server preview so it is not applied twice.
    const previewAttributes = {
        ...normalizedAttributes,
        style: {
            ...normalizedAttributes.style,
            spacing: {...normalizedAttributes.style?.spacing, margin: undefined},
        },
    };

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
        {label: __('Select a menu', namespace), value: '0'},
        ...(navigationMenus?.map((menu: any) => ({
            label: menu.title?.rendered || __('(Untitled)', namespace),
            value: String(menu.id),
        })) || [])
    ];

    const isVertical = orientation === 'vertical';

    // The collapsible toggle buttons are injected by front-end JS, which never
    // runs in the editor, so ServerSideRender alone shows no toggles. Mirror the
    // injection onto the preview here so the circular, ringed toggle — and its
    // spacing/ring color — are visible while customizing. Sub-menus are kept
    // expanded (defaultOpen) so every item stays on screen in the preview.
    const previewRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const container = previewRef.current;
        if (!container) return;
        if (orientation !== 'vertical' || !collapsibleSubMenus) return;

        const inject = () => {
            const inner = container.querySelector('.sgb-nav-menu__inner') as HTMLElement | null;
            if (inner) setupCollapsibleSubmenus(inner, {defaultOpen: () => true});
        };

        // ServerSideRender fetches asynchronously and replaces its subtree on
        // every attribute change (including the ring color), so re-inject on any
        // DOM change. The helper is idempotent — it skips items that already have
        // a toggle — so this settles after one pass and never stacks duplicates.
        inject();
        const observer = new MutationObserver(inject);
        observer.observe(container, {childList: true, subtree: true});
        return () => observer.disconnect();
    }, [orientation, collapsibleSubMenus, ref]);

    return (
        <div {...blockProps}>
            {/* Settings contain menu selection and behavior; appearance lives in Styles. */}
            <InspectorControls>
                <PanelBody className={PANEL_CLASS} title={__('Menu', namespace)}>
                    {!navigationMenus ? (
                        <Spinner/>
                    ) : (
                        <SelectControl
                            label={__('Navigation Menu', namespace)}
                            help={__('Choose which saved navigation menu this block displays.', namespace)}
                            value={String(ref || 0)}
                            options={menuOptions}
                            onChange={(value) => setAttributes({ref: parseInt(value, 10)})}
                        />
                    )}
                </PanelBody>

                <PanelBody className={PANEL_CLASS} title={__('Layout', namespace)}>
                    <SelectControl
                        label={__('Orientation', namespace)}
                        help={__('Horizontal for header bars; vertical for sidebars and stacked menus.', namespace)}
                        value={orientation}
                        options={[
                            {label: __('Horizontal', namespace), value: 'horizontal'},
                            {label: __('Vertical', namespace), value: 'vertical'},
                        ]}
                        onChange={(value) => setAttributes({orientation: value as NavMenuAttributes['orientation']})}
                    />
                </PanelBody>

                <PanelBody className={PANEL_CLASS} title={__('Submenu behavior', namespace)}>
                    {!isVertical && (
                        <ToggleControl
                            label={__('Show Sub-Menu Arrows', namespace)}
                            help={__('Show an indicator next to items that contain a sub-menu.', namespace)}
                            checked={showSubMenuArrows}
                            onChange={(value) => setAttributes({ showSubMenuArrows: value })}
                        />
                    )}
                    {isVertical && (
                        <ToggleControl
                            label={__('Collapsible Sub-Menus', namespace)}
                            help={__('Start sub-menus collapsed; visitors expand them with an arrow toggle next to the parent item. The editor preview shows the toggle but keeps sub-menus expanded so you can style everything.', namespace)}
                            checked={collapsibleSubMenus}
                            onChange={(value) => setAttributes({ collapsibleSubMenus: value })}
                        />
                    )}
                </PanelBody>
            </InspectorControls>

            <InspectorControls group="dimensions">
                <p style={{gridColumn: '1 / -1'}}>{__('Padding applies inside top-level links; margin applies around the menu block. Submenu links have their own padding under Submenus.', namespace)}</p>
            </InspectorControls>

            <InspectorControls group="styles">
                <PanelBody className={PANEL_CLASS} title={__('Menu items', namespace)}>
                    <RangeControl
                        label={__('Item Spacing (px)', namespace)}
                        help={__('Gap between top-level menu items on desktop.', namespace)}
                        value={gap}
                        onChange={(value) => setAttributes({gap: value ?? 24})}
                        min={0} max={120}
                    />
                    <PanelColorSettings
                        enableAlpha={true}
                        className={PANEL_CLASS}
                        title={__('Colors', namespace)}
                        initialOpen={true}
                        colorSettings={[
                            { value: parentBgColor, onChange: (v: string | undefined) => setAttributes({ parentBgColor: v || 'transparent' }), label: __('Background', namespace) },
                            { value: parentBgColorHover, onChange: (v: string | undefined) => setAttributes({ parentBgColorHover: v || '' }), label: __('Background (Hover)', namespace) },
                            { value: parentColor, onChange: (v: string | undefined) => setAttributes({ parentColor: v || 'inherit' }), label: __('Text Color', namespace) },
                            { value: parentColorHover, onChange: (v: string | undefined) => setAttributes({ parentColorHover: v || '' }), label: __('Text Color (Hover)', namespace) },
                        ]}
                    />
                </PanelBody>

                <PanelBody className={PANEL_CLASS} title={__('Submenus', namespace)} initialOpen={false}>
                    {!isVertical && (<>
                        <SelectControl
                            label={__('Top-Level Sub-Menu Alignment', namespace)}
                            help={__('Which edge a first-level dropdown aligns to (horizontal desktop).', namespace)}
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
                            help={__('Which side deeper fly-out sub-menus open toward (horizontal desktop).', namespace)}
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
                        <TextControl
                            label={__('Maximum width', namespace)}
                            help={__('Desktop dropdown limit, e.g. 240px, 20rem, 50vw, 100%, or min(24rem, 80vw). Use none for no limit.', namespace)}
                            value={String(subMenuWidth)}
                            onChange={(value) => setAttributes({subMenuWidth: value})}
                        />
                        <BorderRadiusControl
                            values={subMenuStyle.border?.radius}
                            onChange={(radius: BorderRadius | undefined) => setAttributes({
                                subMenuStyle: {...subMenuStyle, border: {...subMenuStyle.border, radius}},
                            })}
                        />
                        <TextControl
                            label={__('Box shadow', namespace)}
                            help={__('CSS box-shadow for desktop dropdowns. Use none to remove.', namespace)}
                            value={subMenuBoxShadow}
                            onChange={(value) => setAttributes({subMenuBoxShadow: value})}
                        />
                    </>)}
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
                    <BoxControl
                        label={__('Submenu link padding', namespace)}
                        values={typeof subMenuPadding === 'string'
                            ? {top: subMenuPadding, right: subMenuPadding, bottom: subMenuPadding, left: subMenuPadding}
                            : subMenuPadding}
                        onChange={(padding) => setAttributes({
                            subMenuStyle: {...subMenuStyle, spacing: {...subMenuStyle.spacing, padding}},
                        })}
                    />
                    {((!isVertical && showSubMenuArrows) || (isVertical && collapsibleSubMenus)) && (
                        <TextareaControl
                            label={__('Sub-Menu Indicator (SVG)', namespace)}
                            help={__('SVG markup shown next to items with a sub-menu. Painted as a CSS mask, so it follows the menu text color. Clear to restore the default chevron.', namespace)}
                            value={subMenuIndicator}
                            onChange={(value) => setAttributes({ subMenuIndicator: value })}
                            rows={4}
                        />
                    )}
                    <PanelColorSettings
                        enableAlpha={true}
                        className={PANEL_CLASS}
                        title={__('Colors', namespace)}
                        initialOpen={false}
                        colorSettings={[
                            { value: subMenuBgColor, onChange: (v: string | undefined) => setAttributes({ subMenuBgColor: v || 'transparent' }), label: __('Container Background', namespace) },
                            { value: subMenuBgColorHover, onChange: (v: string | undefined) => setAttributes({ subMenuBgColorHover: v || '' }), label: __('Item Background (Hover)', namespace) },
                            { value: subMenuColor, onChange: (v: string | undefined) => setAttributes({ subMenuColor: v || 'inherit' }), label: __('Text Color', namespace) },
                            { value: subMenuColorHover, onChange: (v: string | undefined) => setAttributes({ subMenuColorHover: v || '' }), label: __('Text Color (Hover)', namespace) },
                            { value: subMenuIndentColor, onChange: (v: string | undefined) => setAttributes({ subMenuIndentColor: v || '' }), label: __('Indent Indicator', namespace) },
                            // The collapsible toggle only exists for vertical menus, so its
                            // ring color is only worth surfacing there.
                            ...(isVertical && collapsibleSubMenus ? [
                                { value: subMenuToggleShadowColor, onChange: (v: string | undefined) => setAttributes({ subMenuToggleShadowColor: v || '' }), label: __('Collapsible Toggle Ring', namespace) },
                            ] : []),
                        ]}
                    />
                </PanelBody>

                {!isVertical && (
                    <PanelBody className={PANEL_CLASS} title={__('Mobile overlay', namespace)} initialOpen={false}>
                        <RangeControl
                            label={__('Mobile Gap (px)', namespace)}
                            help={__('Gap between items in the mobile overlay menu.', namespace)}
                            value={mobileGap}
                            onChange={(value) => setAttributes({mobileGap: value ?? 12})}
                            min={0} max={120}
                        />
                        <RangeControl
                            label={__('Mobile Font Size (px)', namespace)}
                            help={__('Font size for menu items in the mobile overlay.', namespace)}
                            value={mobileFontSize}
                            onChange={(value) => setAttributes({mobileFontSize: value ?? 24})}
                            min={12} max={48}
                        />
                        <PanelColorSettings
                            enableAlpha={true}
                            className={PANEL_CLASS}
                            title={__('Colors', namespace)}
                            initialOpen={false}
                            colorSettings={[
                                { value: overlayBgColor, onChange: (v: string | undefined) => setAttributes({ overlayBgColor: v || '' }), label: __('Overlay Background', namespace) },
                                { value: overlayBgColorHover, onChange: (v: string | undefined) => setAttributes({ overlayBgColorHover: v || '' }), label: __('Item Background (Hover)', namespace) },
                                { value: overlayColor, onChange: (v: string | undefined) => setAttributes({ overlayColor: v || '' }), label: __('Text Color', namespace) },
                                { value: overlayColorHover, onChange: (v: string | undefined) => setAttributes({ overlayColorHover: v || '' }), label: __('Text Color (Hover)', namespace) },
                            ]}
                        />
                    </PanelBody>
                )}
            </InspectorControls>

            {ref ? (
                // Swallow link clicks so the editor doesn't navigate away (a
                // click then just selects the block). Hover stays live, so the
                // CSS-driven sub-menu dropdowns still open for previewing. The
                // ref lets the effect above inject collapsible toggles into the
                // rendered preview.
                <div
                    ref={previewRef}
                    onClickCapture={(e) => {
                        if ((e.target as HTMLElement).closest('a')) {
                            e.preventDefault();
                        }
                    }}
                >
                    <ServerSideRender
                        block={metadata.name}
                        attributes={previewAttributes}
                    />
                </div>
            ) : (
                <div style={{padding: '24px', border: '2px dashed #ccc', textAlign: 'center'}}>
                    {__('Please select a Navigation Menu.', namespace)}
                </div>
            )}
        </div>
    );
}
