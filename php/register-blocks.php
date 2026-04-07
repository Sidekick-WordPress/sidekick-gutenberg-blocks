<?php
defined('ABSPATH') || exit;

add_action( 'init', function() {

    $dynamic_blocks = [
        'columns'  => __DIR__ . '/../src/blocks/columns',
        'column'   => __DIR__ . '/../src/blocks/columns/column',
        'nav-menu' => __DIR__ . '/../src/blocks/nav-menu',
    ];

    foreach ( $dynamic_blocks as $slug => $block_dir ) {
        $block_json = $block_dir . '/block.json';
        $save_php   = $block_dir . '/save.php';

        $args = [];

        if ( file_exists( $save_php ) ) {
            $render_callback = require $save_php;
            $args['render_callback'] = $render_callback;
        }

        if ( file_exists( $block_json ) ) {
            register_block_type( $block_dir, $args );
        } else {
            register_block_type( SGB_NS . '/' . $slug, $args );
        }
    }
} );
