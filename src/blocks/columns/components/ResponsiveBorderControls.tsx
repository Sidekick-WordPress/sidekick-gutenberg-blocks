import {
    InspectorControls,
    __experimentalBorderRadiusControl as BorderRadiusControl,
} from '@wordpress/block-editor';
import {
    BorderBoxControl,
    Button,
    PanelBody,
    TabPanel,
    __experimentalDivider as Divider,
} from '@wordpress/components';
import {useState} from '@wordpress/element';
import {__} from '@wordpress/i18n';
import namespace from '../../../namespace';
import type {CoreColumnsAttributes} from '../attributes';
import TierNote from './TierNote';

interface ResponsiveBorderControlsProps {
    attributes: CoreColumnsAttributes;
    setAttributes: (attributes: Partial<CoreColumnsAttributes>) => void;
    layoutClass: string;
    width: number;
    colors: any[];
}

type BorderKey = 'border' | 'tabletBorder' | 'desktopBorder';
type RadiusKey = 'borderRadius' | 'tabletBorderRadius' | 'desktopBorderRadius';

const ATTRIBUTE_KEYS: Record<string, {border: BorderKey; radius: RadiusKey}> = {
    mobile: {border: 'border', radius: 'borderRadius'},
    tablet: {border: 'tabletBorder', radius: 'tabletBorderRadius'},
    desktop: {border: 'desktopBorder', radius: 'desktopBorderRadius'},
};

// Radius attributes use an object schema, including when all corners are linked.
const normalizeRadius = (value: unknown): Record<string, string> | undefined => {
    const corners = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'];
    const values = typeof value === 'string' || typeof value === 'number'
        ? Object.fromEntries(corners.map(corner => [corner, value]))
        : value;
    if (!values || typeof values !== 'object' || Array.isArray(values)) return undefined;

    const result: Record<string, string> = {};
    for (const corner of corners) {
        const radius = (values as Record<string, unknown>)[corner];
        if (typeof radius === 'number' || (typeof radius === 'string' && radius !== '')) {
            result[corner] = String(radius);
        }
    }
    return Object.keys(result).length ? result : undefined;
};

export default function ResponsiveBorderControls({
    attributes,
    setAttributes,
    layoutClass,
    width,
    colors,
}: ResponsiveBorderControlsProps) {
    const [resetKey, setResetKey] = useState(0);

    return (
        <InspectorControls group="styles">
            <PanelBody title={__('Responsive Borders', namespace)} initialOpen={false}>
                <TabPanel
                    className={`${namespace}-responsive-tabs`}
                    activeClass="is-active"
                    tabs={[
                        {name: 'mobile', title: __('Base', namespace), className: 'tab-mobile'},
                        {name: 'tablet', title: __('Tablet', namespace), className: 'tab-tablet'},
                        {name: 'desktop', title: __('Desktop', namespace), className: 'tab-desktop'},
                    ]}
                >
                    {(tab) => {
                        const keys = ATTRIBUTE_KEYS[tab.name];
                        const help = tab.name === 'mobile'
                            ? __('Base borders apply at every breakpoint unless overridden.', namespace)
                            : tab.name === 'tablet'
                                ? __('Blank border values inherit Base. Set a width of 0 to remove an inherited border.', namespace)
                                : __('Blank border values inherit Tablet or Base. Set a width of 0 to remove an inherited border.', namespace);
                        const resetLabel = tab.name === 'mobile'
                            ? __('Reset borders', namespace)
                            : tab.name === 'tablet'
                                ? __('Inherit Base', namespace)
                                : __('Inherit Tablet / Base', namespace);

                        return (
                            <div key={`${tab.name}-${resetKey}`} style={{paddingTop: '16px'}}>
                                <TierNote tab={tab.name} activeTier={layoutClass} width={width} />
                                <p className="components-base-control__help">{help}</p>
                                <BorderBoxControl
                                    __next40pxDefaultSize
                                    enableAlpha
                                    label={__('Borders', namespace)}
                                    colors={colors}
                                    value={attributes[keys.border]}
                                    onChange={(value) => setAttributes({[keys.border]: value})}
                                />
                                <Divider />
                                <BorderRadiusControl
                                    values={attributes[keys.radius] as any}
                                    onChange={(value: unknown) => setAttributes({[keys.radius]: normalizeRadius(value)})}
                                />
                                <Button
                                    variant="tertiary"
                                    size="small"
                                    onClick={() => {
                                        setAttributes({[keys.border]: undefined, [keys.radius]: undefined});
                                        setResetKey(key => key + 1);
                                    }}
                                >
                                    {resetLabel}
                                </Button>
                            </div>
                        );
                    }}
                </TabPanel>
            </PanelBody>
        </InspectorControls>
    );
}
