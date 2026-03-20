<?php
defined('ABSPATH') || exit;

add_action( 'init', function() {

    // Define the blocks and their file paths
    $dynamic_blocks = [
        'columns' => __DIR__ . '/../src/blocks/columns/save.php',
        'column'  => __DIR__ . '/../src/blocks/columns/column/save.php',
    ];

    foreach ( $dynamic_blocks as $slug => $file_path ) {
        if ( file_exists( $file_path ) ) {

            // Require the file, which returns the render closure
            $render_callback = require $file_path;

            // Register using the constant dynamically
            register_block_type( SGB_NS . '/' . $slug, [
                'render_callback' => $render_callback,
            ] );
        }
    }
} );
