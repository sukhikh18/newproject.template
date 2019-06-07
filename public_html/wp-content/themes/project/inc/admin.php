<?php

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Set url to home on login header logotype
 */
add_filter( 'login_headerurl', 'home_url', 10, 0 );

/**
 * Change to own login header logotype
 */
add_action('login_header', 'login_header_logo_css');
if( !function_exists('login_header_logo_css') ) {
    function login_header_logo_css() {
        /** @var Int $logo_id custom logotype attachment ID */
        if( $logo_id = get_theme_mod( 'custom_logo' ) ) {
            @list($src, $width, $height) = wp_get_attachment_image_src( $logo_id, 'full' );

            if( $src && $width && $height ) {
            ?>
            <style type="text/css">
                .login h1 a {
                    background: url("<?= $src ?>");
                    width: <?= $width ?>px;
                    height: <?= $height ?>px;
                    position: relative;
                    left: 50%;
                    transform: translateX(-50%);
                }
            </style>
            <?php
            }
        }
    }
}

/**
 * Link by developer in admin bar
 */
add_action('admin_bar_menu', 'customize_toolbar_link', 9999);
    if( !function_exists('customize_toolbar_link') ) {
        function customize_toolbar_link( $wp_admin_bar ) {
        if( !defined('DEVELOPER_NAME') || !defined('DEVELOPER_LINK') ) {
            return false;
        }

        /**
         * Developer menu link
         */
        $wp_admin_bar->add_node( array(
            'id' => 'developer',
            'title' => DEVELOPER_NAME,
            'href' => DEVELOPER_LINK,
            'meta' => array(
                'title' => __('Go to developer\'s website', 'theme'),
            ),
        ) );
    }
}

/**
 * Change "Thank you for creating with <a href="%s">WordPress</a>." message.
 */
add_filter('admin_footer_text', 'custom_admin_footer', 10, 1);
if( !function_exists('custom_admin_footer') ) {
    function custom_admin_footer( $msg ) {
        if( !defined('DEVELOPER_NAME') || !defined('DEVELOPER_LINK') ) {
            return $msg;
        }

        $dev_message = sprintf( '<span id="footer-thankyou">%s %s</span>.',
            __('Developed by', 'theme'),
            DEVELOPER_NAME
        );

        $wp_message = sprintf( '<small><a href="wordpress.com">%s WordPress %s</a>. </small>',
            __('Based on', 'theme'),
            get_bloginfo('version') . '-'. get_bloginfo('charset')
        );

        return $dev_message . $wp_message;
    }
}
