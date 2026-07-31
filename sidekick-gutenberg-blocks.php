<?php
/**
 * Plugin Name: Sidekick Gutenberg Blocks
 * Plugin URI: https://baker.dev/
 * Description: A collection of custom Gutenberg blocks built by Josh Baker
 * Author: Josh Baker
 * Author URI: https://baker.dev/
 * Version: 1.1.1
 *
 * License: GPL2+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 *
 * @package SGB
 */

//  Exit if accessed directly.
defined('ABSPATH') || exit;

if (!defined('SGB_NS')) {
    $cfgPath = __DIR__ . '/namespace.json';
    $cfg = is_readable($cfgPath) ? json_decode(file_get_contents($cfgPath), true) : null;
    define('SGB_NS', !empty($cfg['ns']) ? $cfg['ns'] : 'sgb');
}

include __DIR__ . '/php/enqueue-assets.php';
include __DIR__ . '/php/helpers.php';
include __DIR__ . '/php/register-blocks.php';

// Patterns
include __DIR__ . '/php/patterns/header-premium.php';
