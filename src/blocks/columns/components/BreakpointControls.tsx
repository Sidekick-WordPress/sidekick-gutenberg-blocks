import {__experimentalBorderRadiusControl as BorderRadiusControl} from '@wordpress/block-editor';
import {BorderBoxControl, RangeControl} from '@wordpress/components';
import {__} from '@wordpress/i18n';
import type {ComponentProps} from 'react';
import namespace from '../../../namespace';
import BreakpointLabel, {
    BreakpointIcon,
    getBreakpointLabel,
    type Breakpoint,
} from '../../../components/edit-controls/BreakpointLabel';

type BreakpointRangeControlProps = ComponentProps<typeof RangeControl> & {
    breakpoint: Breakpoint;
    label: string;
};

type BreakpointBorderBoxControlProps = ComponentProps<typeof BorderBoxControl> & {
    breakpoint: Breakpoint;
    label: string;
};

// Gutenberg's experimental radius control has no public TypeScript declaration.
interface BreakpointBorderRadiusControlProps {
    breakpoint: Breakpoint;
    values?: any;
    onChange: (value: any) => void;
    presets?: any;
}

export function BreakpointRangeControl({breakpoint, label, ...props}: BreakpointRangeControlProps) {
    return (
        <div className={`${namespace}-breakpoint-control ${namespace}-breakpoint-control--range`}>
            <span className={`${namespace}-breakpoint-control__icon`} aria-hidden="true">
                <BreakpointIcon breakpoint={breakpoint} />
            </span>
            <RangeControl {...props} label={getBreakpointLabel(breakpoint, label)} />
        </div>
    );
}

export function BreakpointBorderBoxControl({breakpoint, label, ...props}: BreakpointBorderBoxControlProps) {
    return (
        <div className={`${namespace}-breakpoint-control ${namespace}-breakpoint-control--border`}>
            <span className={`${namespace}-breakpoint-control__icon`} aria-hidden="true">
                <BreakpointIcon breakpoint={breakpoint} />
            </span>
            <BorderBoxControl {...props} label={getBreakpointLabel(breakpoint, label)} />
        </div>
    );
}

export function BreakpointBorderRadiusControl({breakpoint, ...props}: BreakpointBorderRadiusControlProps) {
    const label = __('Border Radius', namespace);

    return (
        <div
            className={`${namespace}-breakpoint-radius`}
            role="group"
            aria-label={getBreakpointLabel(breakpoint, label)}
        >
            <div className={`${namespace}-breakpoint-radius__label`}>
                <BreakpointLabel breakpoint={breakpoint} label={label} />
            </div>
            <BorderRadiusControl {...props} />
        </div>
    );
}
