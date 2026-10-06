import {__experimentalSpacingSizesControl as SpacingSizesControl} from '@wordpress/block-editor';
import {Button} from '@wordpress/components';
import {useState} from '@wordpress/element';
import {__} from '@wordpress/i18n';
import namespace from '../../../namespace';
import type {PaddingAttribute} from '../../../models/attr-shapes/padding-margin';
import {getSpacingControlValues} from '../spacing';

interface SpacingControlProps {
    label: string;
    values: unknown;
    onChange: (values: PaddingAttribute) => void;
    allowNegative?: boolean;
    resetLabel?: string;
}

const SpacingControl = ({
    label,
    values,
    onChange,
    allowNegative = false,
    resetLabel = __('Reset', namespace),
}: SpacingControlProps) => {
    const [resetKey, setResetKey] = useState(0);

    return (
        <div>
            <SpacingSizesControl
                key={resetKey}
                label={label}
                // Keep overrides unset until edited. Passing inherited values
                // here would save them as explicit overrides on another edit.
                values={getSpacingControlValues(values)}
                minimumCustomValue={allowNegative ? -Infinity : 0}
                onChange={(next: unknown) => onChange(getSpacingControlValues(next))}
            />
            <Button
                variant="tertiary"
                size="small"
                onClick={() => {
                    onChange({});
                    setResetKey(key => key + 1);
                }}
            >
                {resetLabel}
            </Button>
        </div>
    );
};

export default SpacingControl;
