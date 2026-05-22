<?php
defined('ABSPATH') || exit;

add_action( 'init', function() {

    $dynamic_blocks = [
        'columns' => [
            'dir' => __DIR__ . '/../src/blocks/columns',
            'supports' => [
                'spacing' => [
                    'margin' => [ 'top', 'bottom' ],
                ],
            ],
        ],
        'column' => [
            'dir' => __DIR__ . '/../src/blocks/columns/column',
            'supports' => [
                'spacing' => [
                    'margin' => [ 'top', 'bottom' ],
                ],
                'shadow' => true,
            ],
        ],
        'nav-menu' => [ 'dir' => __DIR__ . '/../src/blocks/nav-menu' ],
    ];

    foreach ( $dynamic_blocks as $slug => $config ) {
        $block_dir  = $config['dir'];
        $block_json = $block_dir . '/block.json';
        $save_php   = $block_dir . '/save.php';

        $args = [];

        if ( ! empty( $config['supports'] ) ) {
            $args['supports'] = $config['supports'];
        }

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
