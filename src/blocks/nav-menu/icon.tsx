// Block icon for the inserter / list view. Uses the same red (#cc2936) as the
// Sidekick Columns block icon (see ../columns/icon.tsx) so the Sidekick blocks
// read as a set. The glyph mirrors the menu block's own mobile toggle so the
// icon clearly reads as "navigation menu".
const Icon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
    >
        <path
            d="M3 6h18M3 12h18M3 18h18"
            stroke="#cc2936"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export default Icon;
