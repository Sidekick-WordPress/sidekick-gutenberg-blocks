import { __ } from '@wordpress/i18n';
import namespace from '../../../namespace';

export const TIER_LABELS: Record<string, string> = {
    'is-mobile-layout': __('Mobile', namespace),
    'is-tablet-layout': __('Tablet', namespace),
    'is-desktop-layout': __('Desktop', namespace),
};

const TIER_BY_TAB: Record<string, string> = {
    mobile: 'is-mobile-layout',
    tablet: 'is-tablet-layout',
    desktop: 'is-desktop-layout',
};

interface TierNoteProps {
    tab: string;
    activeTier: string;
    width?: number;
}

/**
 * Shown inside a responsive tab when the editor canvas is currently previewing
 * a DIFFERENT breakpoint than the one being edited — the number one source of
 * "I changed it and nothing happened" confusion.
 */
const TierNote = ({ tab, activeTier, width }: TierNoteProps) => {
    if (!activeTier || TIER_BY_TAB[tab] === activeTier) return null;

    const label = TIER_LABELS[activeTier] || activeTier;
    const size = width ? ` (${width}px wide)` : '';

    return (
        <p
            style={{
                margin: '0 0 12px',
                padding: '6px 8px',
                fontSize: '11px',
                lineHeight: 1.4,
                background: 'rgba(56, 88, 233, 0.08)',
                borderLeft: '3px solid var(--wp-admin-theme-color, #3858e9)',
                color: '#1e1e1e',
            }}
        >
            {__('Canvas is previewing the', namespace)} <strong>{label}</strong> {__('layout', namespace)}{size}
            {__(' — changes on this tab may not be visible until the canvas matches this breakpoint. Resize the editor or use Preview ▸ device sizes.', namespace)}
        </p>
    );
};

export default TierNote;
