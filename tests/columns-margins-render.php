<?php
// Run with `php tests/columns-margins-render.php`; no WordPress installation needed.
// These stubs exercise rendered CSS and attribute migration, not theme layout.
define( 'ABSPATH', __DIR__ );

function esc_attr( $value ) {
    return htmlspecialchars( (string) $value, ENT_QUOTES, 'UTF-8' );
}

function esc_url( $value ) {
    return $value;
}

function wp_generate_uuid4() {
    static $instance = 0;
    return 'test-' . ++$instance;
}

function get_block_wrapper_attributes( $attributes ) {
    $attributes['class'] = 'wp-block-sgb-columns ' . $attributes['class'];
    $output = [];
    foreach ( $attributes as $name => $value ) {
        $output[] = $name . '="' . esc_attr( $value ) . '"';
    }
    return implode( ' ', $output );
}

require dirname( __DIR__ ) . '/php/helpers.php';
$render_columns = require dirname( __DIR__ ) . '/src/blocks/columns/save.php';

function check_margin( $condition, $message ) {
    if ( ! $condition ) {
        throw new RuntimeException( $message );
    }
}

function column_margin_rules( $html ) {
    preg_match( '/<style>(.*?)<\/style>/s', $html, $style );
    preg_match_all( '/\.sgb-columns-test-\d+\s*\{([^{}]*)\}/s', $style[1], $rules );
    check_margin( count( $rules[1] ) === 3, 'Expected base, tablet, and desktop CSS rules.' );
    return $rules[1];
}

function has_margin_rule( $rule, $side ) {
    return str_contains( $rule, 'margin-' . $side . ': var(--cols-current-margin-' . $side . ') !important;' );
}

$default = $render_columns( [], '' );
$default_rules = column_margin_rules( $default );
foreach ( [ 'mobile', 'tablet', 'desktop' ] as $breakpoint ) {
    foreach ( [ 'top', 'right', 'bottom', 'left' ] as $side ) {
        check_margin( str_contains( $default, '--cols-margin-' . $side . '-' . $breakpoint . ': initial;' ), 'Missing raw reset variable.' );
        foreach ( $default_rules as $rule ) {
            check_margin( ! has_margin_rule( $rule, $side ), 'Untouched Columns overrides theme spacing.' );
        }
    }
}
check_margin( ! str_contains( implode( '', $default_rules ), 'width: auto' ), 'Untouched Columns changed width.' );

$legacy_attributes = [ 'style' => [ 'spacing' => [ 'margin' => [ 'top' => 0, 'bottom' => 'var:preset|spacing|40' ] ] ] ];
$legacy = $render_columns( $legacy_attributes, '' );
check_margin( str_contains( $legacy, '--cols-margin-top-mobile: 0px;' ), 'Saved core zero was lost.' );
check_margin( str_contains( $legacy, '--cols-margin-bottom-mobile: var(--wp--preset--spacing--40);' ), 'Saved core spacing preset was lost.' );
foreach ( column_margin_rules( $legacy ) as $rule ) {
    check_margin( has_margin_rule( $rule, 'top' ) && has_margin_rule( $rule, 'bottom' ), 'Saved core vertical margins did not cascade.' );
    check_margin( ! has_margin_rule( $rule, 'left' ) && ! has_margin_rule( $rule, 'right' ), 'Legacy vertical margins changed horizontal spacing.' );
    check_margin( ! str_contains( $rule, 'width: auto' ), 'Vertical-only margins changed width.' );
}

$cleared = $render_columns( $legacy_attributes + [ 'mobileMargin' => [] ], '' );
foreach ( column_margin_rules( $cleared ) as $rule ) {
    check_margin( ! has_margin_rule( $rule, 'top' ) && ! has_margin_rule( $rule, 'bottom' ), 'Clearing base margins restored saved core values.' );
}

$tablet = $render_columns( [ 'tabletBreakpoint' => 620, 'desktopBreakpoint' => 1100, 'tabletMargin' => [ 'top' => '-2rem' ] ], '' );
$tablet_rules = column_margin_rules( $tablet );
check_margin( ! has_margin_rule( $tablet_rules[0], 'top' ), 'Tablet-only margin affected mobile.' );
check_margin( has_margin_rule( $tablet_rules[1], 'top' ) && has_margin_rule( $tablet_rules[2], 'top' ), 'Tablet-only margin did not cascade to desktop.' );
check_margin( str_contains( $tablet, '@media (min-width: 620px)' ) && str_contains( $tablet, '@media (min-width: 1100px)' ), 'Custom breakpoints were ignored.' );
check_margin( str_contains( $tablet_rules[2], '--cols-current-margin-top: var(--cols-margin-top-desktop, var(--cols-margin-top-tablet, var(--cols-margin-top-mobile)))' ), 'Desktop fallback chain is incomplete.' );

$desktop = $render_columns( [ 'desktopMargin' => [ 'right' => '2rem', 'left' => 'auto' ] ], '' );
$desktop_rules = column_margin_rules( $desktop );
foreach ( [ 0, 1 ] as $tier ) {
    check_margin( ! has_margin_rule( $desktop_rules[$tier], 'right' ) && ! str_contains( $desktop_rules[$tier], 'width: auto' ), 'Desktop-only horizontal margin affected a smaller breakpoint.' );
}
check_margin( has_margin_rule( $desktop_rules[2], 'left' ) && has_margin_rule( $desktop_rules[2], 'right' ), 'Desktop horizontal margins missing.' );
check_margin( str_contains( $desktop_rules[2], 'width: auto !important;' ), 'Horizontal margin did not allow the wrapper to shrink.' );

$cascade = $render_columns( [ 'mobileMargin' => [ 'top' => '3rem', 'left' => -12.5 ], 'tabletMargin' => [ 'bottom' => '2rem' ], 'desktopMargin' => [ 'top' => '0' ] ], '' );
check_margin( str_contains( $cascade, '--cols-margin-left-mobile: -12.5px;' ), 'Negative numeric margins were not normalized.' );
check_margin( str_contains( $cascade, '--cols-margin-top-desktop: 0px;' ), 'Explicit desktop zero was lost.' );
$cascade_rules = column_margin_rules( $cascade );
check_margin( has_margin_rule( $cascade_rules[1], 'top' ) && has_margin_rule( $cascade_rules[1], 'bottom' ), 'Partial tablet values did not retain base sides.' );

$shorthand = $render_columns( [ 'style' => [ 'spacing' => [ 'margin' => 'calc(1rem + var(--extra, 2px)) auto 3px' ] ] ], '' );
check_margin( str_contains( $shorthand, '--cols-margin-top-mobile: calc(1rem + var(--extra, 2px));' ), 'Legacy shorthand split a CSS function.' );
check_margin( str_contains( $shorthand, '--cols-margin-right-mobile: auto;' ) && str_contains( $shorthand, '--cols-margin-left-mobile: auto;' ), 'Legacy shorthand horizontal sides were not expanded.' );
check_margin( str_contains( $shorthand, '--cols-margin-bottom-mobile: 3px;' ), 'Legacy shorthand bottom side was not expanded.' );

foreach ( [ '1px; color: red', '</style><script>alert(1)</script>', '1px/*comment*/', '1px\\;', '1e309', INF, NAN ] as $invalid ) {
    $unsafe = $render_columns( [ 'mobileMargin' => [ 'top' => $invalid ] ], '' );
    check_margin( str_contains( $unsafe, '--cols-margin-top-mobile: initial;' ), 'Unsafe or nonfinite margin was retained.' );
    check_margin( ! has_margin_rule( column_margin_rules( $unsafe )[0], 'top' ), 'Invalid margin overrode theme spacing.' );
}
foreach ( [ '1px; 2rem', 'calc(1rem + 2px', ')1rem(', '1px 2px 3px 4px 5px' ] as $invalid ) {
    $unsafe = $render_columns( [ 'style' => [ 'spacing' => [ 'margin' => $invalid ] ] ], '' );
    foreach ( [ 'top', 'right', 'bottom', 'left' ] as $side ) {
        check_margin( ! has_margin_rule( column_margin_rules( $unsafe )[0], $side ), 'Malformed legacy shorthand was retained.' );
    }
}

echo "PASS: untouched spacing, legacy zero/presets/shorthand, reset, partial inheritance, responsive activation, custom breakpoints, horizontal width, and CSS sanitization.\n";
