<?php
// Exit if accessed directly.
defined('ABSPATH') || exit;

// 1. Use dirname() to safely strip the /php/ directory out of both the URL and Path
$asset_url_base = trailingslashit( dirname( plugin_dir_url( __FILE__ ) ) ) . 'build/';
$asset_dir_base = trailingslashit( dirname( plugin_dir_path( __FILE__ ) ) ) . 'build/';

// 2. Safely get the file modification time for cache busting
if ( ! function_exists( 'sgb_ver' ) ) {
    function sgb_ver($path) {
        return file_exists($path) ? filemtime($path) : null;
    }
}

// Front + editor-shared assets
add_action('enqueue_block_assets', function () use ($asset_url_base, $asset_dir_base) {

    // --- CSS ---
    $save_css_rel  = 'css/blocks-save.css';
    $save_css_url  = $asset_url_base . $save_css_rel;
    $save_css_path = $asset_dir_base . $save_css_rel;

    wp_enqueue_style(
        SGB_NS . '-save-style',
        $save_css_url,
        [],
        sgb_ver($save_css_path)
    );

    // --- REACT JS ---
    $react_js_rel  = 'js/react.min.js';
    $react_js_url  = $asset_url_base . $react_js_rel;
    $react_js_path = $asset_dir_base . $react_js_rel;
    $react_asset_php = $asset_dir_base . 'js/react.min.asset.php';

    $react_deps = [ 'wp-element', 'wp-i18n' ];
    $react_ver  = sgb_ver($react_js_path);
    if ( file_exists( $react_asset_php ) ) {
        $react_meta = require $react_asset_php;
        if ( ! empty( $react_meta['dependencies'] ) ) {
            $react_deps = $react_meta['dependencies'];
        }
        if ( ! empty( $react_meta['version'] ) ) {
            $react_ver = $react_meta['version'];
        }
    }

    wp_enqueue_script(
        SGB_NS . '-react-js',
        $react_js_url,
        $react_deps,
        $react_ver,
        true
    );

    wp_localize_script(SGB_NS . '-react-js', 'app', [
        'siteUrl' => get_site_url(),
    ]);

    // --- EDITOR CANVAS CSS ---
    // Enqueued HERE (not enqueue_block_editor_assets) on purpose: since WP 6.3 the
    // post editor canvas can be an iframe, and only styles registered during
    // enqueue_block_assets are copied into it. enqueue_block_editor_assets styles
    // stay in the parent document and never reach an iframed canvas.
    if ( is_admin() ) {
        $edit_css_rel  = 'css/blocks-edit.css';
        $edit_css_url  = $asset_url_base . $edit_css_rel;
        $edit_css_path = $asset_dir_base . $edit_css_rel;

        wp_enqueue_style(
            SGB_NS . '-editor-style',
            $edit_css_url,
            [],
            sgb_ver($edit_css_path)
        );
    }
});

// Editor-only assets
add_action('enqueue_block_editor_assets', function () use ($asset_url_base, $asset_dir_base) {

    // --- BLOCKS JS ---
    $blocks_js_rel  = 'js/blocks.min.js';
    $blocks_js_url  = $asset_url_base . $blocks_js_rel;
    $blocks_js_path = $asset_dir_base . $blocks_js_rel;
    $blocks_asset_php = $asset_dir_base . 'js/blocks.min.asset.php';
    $blocks_meta = file_exists( $blocks_asset_php ) ? require $blocks_asset_php : [];

    wp_enqueue_script(
        SGB_NS . '-blocks-js',
        $blocks_js_url,
        $blocks_meta['dependencies'] ?? [ 'wp-blocks', 'wp-i18n', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-data', 'wp-server-side-render' ],
        sgb_ver($blocks_js_path), // FIX: Wrapped in sgb_ver()
        true
    );
});

add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style('wp-block-library');
}, 5);

// Synchronously mark the document as entrance-ready BEFORE any column paints,
// so columns with .has-entrance-animation start hidden and never flash visible
// during the gap between initial paint and the deferred react bundle running.
// Skip for users who can't be animated to (reduced motion / no IntersectionObserver) —
// those keep the default opacity:1 and never get an entrance class added by JS.
add_action('wp_head', function () {
    $cls = esc_js(SGB_NS . '-entrance-ready');
    echo "<script>(function(){if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('{$cls}');}})();</script>\n";
}, 1);
