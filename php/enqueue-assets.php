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

    wp_enqueue_script(
        SGB_NS . '-react-js',
        $react_js_url,
        [ 'wp-element', 'wp-i18n' ],
        sgb_ver($react_js_path), // FIX: Wrapped in sgb_ver() instead of passing the raw path string
        true
    );

    wp_localize_script(SGB_NS . '-react-js', 'app', [
        'siteUrl' => get_site_url(),
    ]);
});

// Editor-only assets
add_action('enqueue_block_editor_assets', function () use ($asset_url_base, $asset_dir_base) {

    // --- BLOCKS JS ---
    $blocks_js_rel  = 'js/blocks.min.js';
    $blocks_js_url  = $asset_url_base . $blocks_js_rel;
    $blocks_js_path = $asset_dir_base . $blocks_js_rel;

    wp_enqueue_script(
        SGB_NS . '-blocks-js',
        $blocks_js_url,
        [ 'wp-blocks', 'wp-i18n', 'wp-element', 'wp-editor' ],
        sgb_ver($blocks_js_path), // FIX: Wrapped in sgb_ver()
        true
    );

    // --- BLOCKS CSS ---
    $edit_css_rel  = 'css/blocks-edit.css';
    $edit_css_url  = $asset_url_base . $edit_css_rel;
    $edit_css_path = $asset_dir_base . $edit_css_rel;

    wp_enqueue_style(
        SGB_NS . '-editor-style',
        $edit_css_url,
        [ 'wp-edit-blocks' ],
        sgb_ver($edit_css_path)
    );
});

add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style('wp-block-library');
}, 5);
