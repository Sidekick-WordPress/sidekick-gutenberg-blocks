<?php
defined('ABSPATH') || exit;

add_action( 'init', function() {

    $dynamic_blocks = [
        'columns' => [
            'dir' => __DIR__ . '/../src/blocks/columns',
            // These blocks do not have block.json files, so their responsive
            // context must also be registered on the server. Defaults matter
            // for nested blocks because Gutenberg omits default-valued attrs
            // from serialized block comments.
            'attributes' => [
                'tabletBreakpoint' => [
                    'type'    => 'number',
                    'default' => 768,
                ],
                'desktopBreakpoint' => [
                    'type'    => 'number',
                    'default' => 1024,
                ],
            ],
            'provides_context' => [
                SGB_NS . '/tabletBreakpoint'  => 'tabletBreakpoint',
                SGB_NS . '/desktopBreakpoint' => 'desktopBreakpoint',
            ],
            'supports' => [
                'spacing' => [
                    'margin' => [ 'top', 'bottom' ],
                ],
            ],
        ],
        'column' => [
            'dir' => __DIR__ . '/../src/blocks/columns/column',
            'uses_context' => [
                SGB_NS . '/tabletBreakpoint',
                SGB_NS . '/desktopBreakpoint',
            ],
            'supports' => [
                'spacing' => [
                    'margin' => [ 'top', 'bottom' ],
                ],
                'shadow' => true,
            ],
        ],
        'nav-menu' => [ 'dir' => __DIR__ . '/../src/blocks/nav-menu' ],
        'collection-hero'  => [ 'dir' => __DIR__ . '/../src/blocks/collection-hero' ],
        'collection-intro' => [ 'dir' => __DIR__ . '/../src/blocks/collection-intro' ],
        'color-swatches'   => [ 'dir' => __DIR__ . '/../src/blocks/color-swatches' ],
        'product-attribute' => [ 'dir' => __DIR__ . '/../src/blocks/product-attribute' ],
        'add-to-cart'      => [ 'dir' => __DIR__ . '/../src/blocks/add-to-cart' ],
        'collection-feed'  => [ 'dir' => __DIR__ . '/../src/blocks/collection-feed' ],
    ];

    foreach ( $dynamic_blocks as $slug => $config ) {
        $block_dir  = $config['dir'];
        $block_json = $block_dir . '/block.json';
        $save_php   = $block_dir . '/save.php';

        $args = [];

        foreach ( [ 'attributes', 'provides_context', 'uses_context', 'supports' ] as $setting ) {
            if ( isset( $config[ $setting ] ) ) {
                $args[ $setting ] = $config[ $setting ];
            }
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
