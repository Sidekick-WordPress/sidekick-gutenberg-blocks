import {useSettings} from '@wordpress/block-editor';
import {BaseControl, BoxControl, Button, RangeControl} from '@wordpress/components';
import {useState} from '@wordpress/element';
import {__, sprintf} from '@wordpress/i18n';
import namespace from '../../../namespace';
import type {PaddingAttribute} from '../../../models/attr-shapes/padding-margin';
import {getSpacingControlValues} from '../spacing';

interface SpacingControlProps {
    label: string;
    values: unknown;
    inheritedValues?: unknown;
    onChange: (values: PaddingAttribute) => void;
    allowNegative?: boolean;
    resetLabel?: string;
}

interface SpacingPreset {
    slug: string | number;
    name: string;
    size: string | number;
}

const SIDES = ['top', 'right', 'bottom', 'left'] as const;
const SIDE_LABELS = {
    top: __('Top', namespace),
    right: __('Right', namespace),
    bottom: __('Bottom', namespace),
    left: __('Left', namespace),
};

const SpacingControl = ({
    label,
    values,
    inheritedValues,
    onChange,
    allowNegative = false,
    resetLabel = __('Reset', namespace),
}: SpacingControlProps) => {
    const [custom, setCustom] = useState(false);
    const [view, setView] = useState<'auto' | 'axes' | 'sides'>('auto');
    const [customSizes, themeSizes, defaultSizes, defaultSizesEnabled, themeUnits] = useSettings(
        'spacing.spacingSizes.custom',
        'spacing.spacingSizes.theme',
        'spacing.spacingSizes.default',
        'spacing.defaultSpacingSizes',
        'spacing.units'
    );
    const presets: SpacingPreset[] = [
        ...(Array.isArray(customSizes) ? customSizes : []),
        ...(Array.isArray(themeSizes) ? themeSizes : []),
        ...(defaultSizesEnabled !== false && Array.isArray(defaultSizes) ? defaultSizes : []),
    ];
    const sizes: SpacingPreset[] = [{slug: '0', name: __('None', namespace), size: 0}];
    for (const preset of presets) {
        if (!sizes.some(size => String(size.slug) === String(preset.slug))) sizes.push(preset);
    }
    if (sizes.every(size => /^[0-9]/.test(String(size.slug)))) {
        sizes.sort((a, b) => String(a.slug).localeCompare(String(b.slug), 'und', {numeric: true}));
    }
    const current = getSpacingControlValues(values);
    const inherited = getSpacingControlValues(inheritedValues);
    const effective = Object.fromEntries(SIDES.map(side => [
        side, current[side] ?? inherited[side] ?? (allowNegative ? undefined : '0'),
    ])) as PaddingAttribute;
    const presetFor = (value: string | undefined) => {
        const slug = /^var:preset\|spacing\|(.+)$/.exec(value || '')?.[1];
        return sizes.find(size => slug ? String(size.slug) === slug : String(size.size) === value);
    };

    const describeValue = (value: string | undefined) => {
        if (value === undefined) return allowNegative ? __('Theme default', namespace) : __('None', namespace);
        const preset = presetFor(value);
        return preset?.name || sprintf(__('Custom (%s)', namespace), value);
    };

    const descriptions = SIDES.map(side => {
        const isInherited = inheritedValues !== undefined && current[side] === undefined;
        const value = describeValue(effective[side]);
        return isInherited ? sprintf(__('%s (inherited)', namespace), value) : value;
    });
    let summary: string;
    if (descriptions.every(value => value === descriptions[0])) {
        summary = sprintf(__('All sides: %s', namespace), descriptions[0]);
    } else if (descriptions[0] === descriptions[2] && descriptions[1] === descriptions[3]) {
        summary = sprintf(__('Top / bottom: %1$s; left / right: %2$s', namespace), descriptions[0], descriptions[1]);
    } else {
        summary = SIDES.map((side, index) => `${SIDE_LABELS[side]}: ${descriptions[index]}`).join('; ');
    }

    const symmetric = effective.top === effective.bottom && effective.left === effective.right;
    const separated = view === 'sides' || (view === 'auto' && !symmetric);
    const groups: {label: string; sides: (typeof SIDES[number])[]}[] = separated
        ? SIDES.map(side => ({label: SIDE_LABELS[side], sides: [side]}))
        : [
            {label: __('Top / bottom', namespace), sides: ['top', 'bottom']},
            {label: __('Left / right', namespace), sides: ['left', 'right']},
        ];
    const changeGroup = (sides: (typeof SIDES[number])[], index: number | undefined) => {
        if (index === undefined || !Number.isInteger(index) || !sizes[index]) return;
        const size = sizes[index];
        const value = String(size.slug) === '0' ? '0' : `var:preset|spacing|${size.slug}`;
        onChange({...current, ...Object.fromEntries(sides.map(side => [side, value]))});
    };
    const units = Array.from(new Set([
        ...(Array.isArray(themeUnits) ? themeUnits.filter((unit): unit is string => typeof unit === 'string') : []),
        'px', 'em', 'rem',
    ])).map(value => ({value, label: value, step: value === 'px' ? 1 : 0.01}));
    const customValues = Object.fromEntries(Object.entries(current).map(([side, value]) => [
        side, /^var:preset\|spacing\|/.test(value) ? String(presetFor(value)?.size ?? value) : value,
    ]));
    const changeCustom = (next: unknown) => {
        const normalized = getSpacingControlValues(next);
        const displayed = getSpacingControlValues(customValues);
        const updated = {...current};
        let changed = false;
        for (const side of SIDES) {
            if (normalized[side] === displayed[side]) continue;
            changed = true;
            if (normalized[side] === undefined) delete updated[side];
            else updated[side] = normalized[side];
        }
        if (changed) onChange(updated);
    };

    return (
        <div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px'}}>
                <BaseControl.VisualLabel>{label}</BaseControl.VisualLabel>
                <Button variant="tertiary" size="small" isPressed={custom} onClick={() => setCustom(value => !value)}>
                    {custom ? __('Use presets', namespace) : __('Custom size', namespace)}
                </Button>
            </div>
            {custom ? (
                <BoxControl
                    label={label}
                    values={customValues}
                    units={units}
                    inputProps={{min: allowNegative ? -Infinity : 0}}
                    allowReset={false}
                    onChange={changeCustom}
                />
            ) : (
                <>
                    <Button variant="tertiary" size="small" onClick={() => setView(separated ? 'axes' : 'sides')}>
                        {separated ? __('Link opposite sides', namespace) : __('Edit individual sides', namespace)}
                    </Button>
                    {groups.map(group => {
                        const value = effective[group.sides[0]];
                        const mixed = group.sides.some(side => effective[side] !== value);
                        const preset = mixed ? undefined : presetFor(value);
                        const index = preset ? sizes.indexOf(preset) : NaN;
                        const inheritedSides = group.sides.filter(side => inheritedValues !== undefined && current[side] === undefined);
                        const inheritanceLabel = inheritedSides.length === group.sides.length
                            ? __(' (inherited)', namespace)
                            : inheritedSides.length
                                ? sprintf(__(' (%s inherited)', namespace), inheritedSides.map(side => SIDE_LABELS[side].toLowerCase()).join(', '))
                                : '';
                        const rangeLabel = `${group.label}: ${mixed ? __('Mixed', namespace) : describeValue(value)}${inheritanceLabel}`;
                        return sizes.length > 1 ? (
                            <RangeControl
                                key={group.sides.join('-')}
                                label={rangeLabel}
                                value={index}
                                min={0}
                                max={sizes.length - 1}
                                step={1}
                                marks={sizes.map((_, value) => ({value}))}
                                withInputField={false}
                                renderTooltipContent={(value?: number | '' | null) => typeof value === 'number' ? sizes[value]?.name : undefined}
                                aria-valuetext={mixed ? __('Mixed', namespace) : describeValue(value)}
                                onChange={(next: number | undefined) => changeGroup(group.sides, next)}
                            />
                        ) : (
                            <div key={group.sides.join('-')}>
                                <p className="components-base-control__help">{rangeLabel}</p>
                                <Button variant="secondary" size="small" onClick={() => changeGroup(group.sides, 0)}>{__('None', namespace)}</Button>
                            </div>
                        );
                    })}
                </>
            )}
            <p className="components-base-control__help" style={{margin: '8px 0 0'}}>{summary}</p>
            <Button
                variant="tertiary"
                size="small"
                onClick={() => {
                    onChange({});
                    setCustom(false);
                    setView('auto');
                }}
            >
                {resetLabel}
            </Button>
        </div>
    );
};

export default SpacingControl;
