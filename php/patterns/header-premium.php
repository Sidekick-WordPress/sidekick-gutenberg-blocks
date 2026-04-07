<?php
defined('ABSPATH') || exit;

add_action('init', function () {
    // Only register the premium pattern if the custom nav block exists.
    if ( ! class_exists('WP_Block_Type_Registry') ) {
        return;
    }

    $registry = WP_Block_Type_Registry::get_instance();

    if ( ! $registry->is_registered('sidekick/nav-menu') ) {
        return;
    }

    if ( function_exists('register_block_pattern_category') ) {
        register_block_pattern_category(
            'sidekick-premium',
            [
                'label' => __('Sidekick Premium', 'sidekick-gutenberg-blocks'),
            ]
        );
    }

    if ( function_exists('register_block_pattern') ) {
        register_block_pattern(
            'sidekick/premium-header-nav',
            [
                'title'         => __('Premium Header with Sidekick Nav', 'sidekick-gutenberg-blocks'),
                'description'   => __('A header pattern that uses the Sidekick custom navigation blocks.', 'sidekick-gutenberg-blocks'),
                'categories'    => ['sidekick-premium'],
                'keywords'      => ['header', 'navigation', 'menu', 'premium'],
                'content'       => <<<HTML
<!-- wp:group {"tagName":"header","style":{"spacing":{"padding":{"top":"24px","bottom":"24px","left":"24px","right":"24px"}}},"backgroundColor":"base","layout":{"type":"constrained"}} -->
<div class="wp-block-group has-base-background-color has-background" style="padding-top:24px;padding-right:24px;padding-bottom:24px;padding-left:24px">
    <!-- wp:group {"align":"wide","layout":{"type":"flex","justifyContent":"space-between","verticalAlignment":"center","flexWrap":"nowrap"}} -->
    <div class="wp-block-group alignwide">
        <!-- wp:site-logo {"width":150} /-->

        <!-- wp:sidekick/nav-menu {"orientation":"horizontal","justifyContent":"right","gap":24,"mobileGap":12,"desktopBreakpoint":768} -->
        <nav class="wp-block-sidekick-nav-menu">
            <!-- wp:sidekick/nav-item {"label":"Home","url":"/"} /-->
            <!-- wp:sidekick/nav-item {"label":"About","url":"/about/"} /-->
            <!-- wp:sidekick/nav-item {"label":"Contact","url":"/contact/"} /-->
        </nav>
        <!-- /wp:sidekick/nav-menu -->
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->
HTML
            ]
        );
    }
});
