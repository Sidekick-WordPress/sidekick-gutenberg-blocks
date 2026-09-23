<?php
// Run with the site's PHP configuration. Uses the installed WordPress renderer;
// does not create or modify posts, menus, or options.
require dirname( __DIR__, 4 ) . '/wp-load.php';

function check_menu( $condition, $message ) {
    if ( ! $condition ) {
        throw new RuntimeException( $message );
    }
}

function render_test_menu( $attributes ) {
    return html_entity_decode( render_block( array(
        'blockName' => 'sgb/nav-menu', 'attrs' => $attributes,
        'innerBlocks' => array(), 'innerHTML' => '', 'innerContent' => array(),
    ) ), ENT_QUOTES );
}

$default = render_test_menu( array() );
check_menu( str_contains( $default, '--nav-parent-padding: 0.5rem 1rem 0.5rem 1rem;' ), 'Default native link padding missing.' );
check_menu( str_contains( $default, '--nav-sub-padding: 0.5rem 1rem 0.5rem 1rem;' ), 'Default submenu padding missing.' );
check_menu( str_contains( $default, '--nav-submenu-indicator: url(data:image/svg+xml;base64,' ), 'Submenu indicator URI lost.' );

$legacy = render_test_menu( array(
    'parentPadding' => array( 'left' => '0', 'right' => '2rem' ),
    'subMenuPadding' => array( 'top' => '3px' ),
    'fontWeight' => '700', 'textTransform' => 'uppercase',
    'subMenuWidth' => 360, 'subMenuBorderRadius' => 12,
) );
check_menu( str_contains( $legacy, '--nav-parent-padding: 0px 2rem 0px 0;' ), 'Legacy padding or zero was lost.' );
check_menu( str_contains( $legacy, '--nav-sub-padding: 3px 0px 0px 0px;' ), 'Legacy submenu padding lost.' );
check_menu( str_contains( $legacy, '--nav-sub-width: 360px;' ), 'Legacy width lost.' );
check_menu( str_contains( $legacy, '--nav-sub-border-radius: 12px 12px 12px 12px;' ), 'Legacy radius lost.' );
check_menu( str_contains( $legacy, 'font-weight:700' ) && str_contains( $legacy, 'text-transform:uppercase' ), 'Legacy typography lost.' );

$native_attributes = array(
    'styleVersion' => 1,
    'style' => array(
        'spacing' => array( 'margin' => array( 'top' => '2rem' ), 'padding' => array( 'left' => 'var:preset|spacing|40', 'right' => '0' ) ),
        'typography' => array( 'fontWeight' => '400', 'textTransform' => 'lowercase' ),
    ),
    'subMenuStyle' => array( 'border' => array( 'radius' => array( 'topLeft' => '1em', 'topRight' => '2px', 'bottomRight' => '3rem', 'bottomLeft' => '0' ) ) ),
    'subMenuWidth' => 'min(24rem, 80vw)',
);
$native = render_test_menu( $native_attributes );
check_menu( str_contains( $native, 'margin-top:2rem' ), 'Native margin not rendered.' );
check_menu( str_contains( $native, 'font-weight:400' ) && str_contains( $native, 'text-transform:lowercase' ), 'Native typography not rendered.' );
check_menu( str_contains( $native, '--nav-parent-padding: 0px 0 0px var(--wp--preset--spacing--40);' ), 'Native spacing preset not resolved.' );
check_menu( str_contains( $native, '--nav-sub-border-radius: 1em 2px 3rem 0;' ), 'Independent corner order incorrect.' );
check_menu( str_contains( $native, '--nav-sub-radius-bottomRight: 3rem;' ), 'Hover corner variable missing.' );
check_menu( str_contains( $native, '--nav-sub-width: min(24rem, 80vw);' ), 'CSS width expression lost.' );
preg_match( '/<nav\s+(.*?)>/s', $native, $nav );
check_menu( ! preg_match( '/(?:[;"\s])padding(?:-[a-z]+)?:/', $nav[1] ), 'Link padding also leaked onto the nav wrapper.' );

foreach ( array( '20rem', '50vw', '100%', 'none', 'calc(100vw - 2rem)' ) as $width ) {
    $native_attributes['subMenuWidth'] = $width;
    check_menu( str_contains( render_test_menu( $native_attributes ), '--nav-sub-width: ' . $width . ';' ), 'Width value lost: ' . $width );
}
$native_attributes['subMenuWidth'] = '20rem; color: red';
check_menu( ! str_contains( render_test_menu( $native_attributes ), 'color: red' ), 'Width allowed CSS declaration injection.' );

$reset = render_test_menu( array( 'styleVersion' => 1, 'style' => array(), 'subMenuStyle' => array() ) );
check_menu( str_contains( $reset, '--nav-parent-padding: 0px 0px 0px 0px;' ), 'Reset parent padding restored legacy defaults.' );
check_menu( str_contains( $reset, '--nav-sub-padding: 0px 0px 0px 0px;' ), 'Reset submenu padding restored legacy defaults.' );
check_menu( ! str_contains( $reset, '--nav-font-weight' ) && ! str_contains( $reset, '--nav-text-transform' ), 'Legacy typography overrides remain.' );

echo "PASS: defaults, legacy menus, native margin/typography/padding, presets, corners, CSS widths, resets, and CSS injection.\n";
