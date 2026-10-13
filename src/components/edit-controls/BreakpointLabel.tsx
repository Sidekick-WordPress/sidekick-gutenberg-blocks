import {Icon, mobile, tablet, desktop} from '@wordpress/icons';
import {__, sprintf} from '@wordpress/i18n';
import namespace from '../../namespace';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export const BREAKPOINT_ICONS = {mobile, tablet, desktop};

export const getBreakpointLabel = (breakpoint: Breakpoint, label?: string): string => {
    const name = breakpoint === 'tablet' ? __('Tablet', namespace)
        : breakpoint === 'desktop' ? __('Desktop', namespace) : __('Base', namespace);
    // translators: 1: Breakpoint name (Base, Tablet, Desktop). 2: Control label.
    return label ? sprintf(__('%1$s %2$s', namespace), name, label) : name;
};

export const BreakpointIcon = ({breakpoint}: {breakpoint: Breakpoint}) => (
    <Icon icon={BREAKPOINT_ICONS[breakpoint]} size={18} aria-hidden="true" focusable="false" />
);

export default function BreakpointLabel({breakpoint, label}: {breakpoint: Breakpoint; label?: string}) {
    return (
        <span className={`${namespace}-breakpoint-label`}>
            <BreakpointIcon breakpoint={breakpoint} />
            <span>{getBreakpointLabel(breakpoint, label)}</span>
        </span>
    );
}
