<?php
defined('ABSPATH') || exit;

add_action( 'init', function() {

    $dynamic_blocks = [
        'columns'  => __DIR__ . '/../src/blocks/columns',
        'column'   => __DIR__ . '/../src/blocks/columns/column',
        'nav-menu' => __DIR__ . '/../src/blocks/nav-menu',
        'nav-item' => __DIR__ . '/../src/blocks/nav-menu/nav-item',
    ];

    foreach ( $dynamic_blocks as $slug => $block_dir ) {
        $block_json = $block_dir . '/block.json';
        $save_php   = $block_dir . '/save.php';

        if ( file_exists( $block_json ) ) {
            $args = [];

            if ( file_exists( $save_php ) ) {
                $render_callback = require $save_php;
                $args['render_callback'] = $render_callback;
            }

            register_block_type( $block_dir, $args );
        }
    }
} );
