import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import namespace from '../../../namespace';

const PRESETS = [
    { label: __('Auto', namespace), value: 0 },
    { label: '¼', value: 25 },
    { label: '⅓', value: 33.333333 },
    { label: '½', value: 50 },
    { label: '⅔', value: 66.666667 },
    { label: '¾', value: 75 },
    { label: '100%', value: 100 },
];

interface WidthPresetButtonsProps {
    // Pass undefined when the breakpoint is inheriting (no explicit value) so no chip lights up.
    current?: number;
    onSelect: (width: number) => void;
}

const WidthPresetButtons = ({ current, onSelect }: WidthPresetButtonsProps) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', margin: '-4px 0 8px' }}>
        {PRESETS.map((p) => {
            const isActive = current !== undefined && Math.abs(current - p.value) < 0.01;
            return (
                <Button
                    key={p.value}
                    size="small"
                    variant={isActive ? 'primary' : 'secondary'}
                    onClick={() => onSelect(p.value)}
                >
                    {p.label}
                </Button>
            );
        })}
    </div>
);

export default WidthPresetButtons;
