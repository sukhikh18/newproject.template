<?php

/*******************************************************************************
 * Default Template Filters and Actions
 */

add_filter('wp_head', 'ie_compatibility');
if( !function_exists('ie_compatibility') ) {
    function ie_compatibility() {
    ?>
    <!-- IE compatibility -->
    <!--[if lt IE 9]>
    <script data-skip-moving="true" type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/html5shiv/3.7.3/html5shiv.js"></script>
    <script data-skip-moving="true">isIE = true;</script>
    <![endif]-->
    <script data-skip-moving="true">
        var isIE = false /*@cc_on || true @*/;
        if( isIE ) {
            document.createElement( "picture" );
            document.write('<script src="https:\/\/cdnjs.cloudflare.com\/ajax\/libs\/picturefill\/3.0.3\/picturefill.min.js" async><\/script>');
        }

        // if( isIE || /Edge/.test(navigator.userAgent) ) {
        //     document.write(\'<script src="\/assets\/polyfill-svg-uri\/polyfill-svg-uri.min.js" async><\/script>\');
        // }
    </script>
    <?php
    }
}

add_action('wp_head', 'template_viewport_html');
if( !function_exists('template_viewport_html') ) {
    function template_viewport_html() {
        if( TPL_RESPONSIVE ) {
            echo '
            <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">';
        }
        else {
            $max_width = TPL_VIEWPORT - ( TPL_PADDINGS * 2 );

            echo '
            <meta name="viewport" content="width='.TPL_VIEWPORT.'">
            <style type="text/css">
            .container {
                max-width: '.$max_width.'px !important;
                width: '.$max_width.'px !important;
            }
            </style>';
        }
    }
}

add_action( 'dynamic_sidebar_before', 'aside_start', 10 );
if( !function_exists('aside_start') ) {
    function aside_start() {
        echo '</div>';
        echo '<div id="secondary" class="sidebar col-12 col-lg-3 order-lg-2">';
        echo '    <aside class="widget-area" role="complementary">';
    }
}

add_action( 'dynamic_sidebar_after',  'aside_end', 10 );
if( !function_exists('aside_end') ) {
    function aside_end() {
        echo '    </aside>';
    }
}

add_filter( 'post_class', 'add_theme_post_class', 10, 3 );
if( !function_exists('add_theme_post_class') ) {
    function add_theme_post_class($classes, $class, $post_id) {
        if( 'product' !== get_post_type() ) {
            if( is_singular() ) {
                $columns = apply_filters( 'single_content_columns', 1 );
            }
            else {
                $columns = apply_filters( 'content_columns', 1 );
            }

            $classes[] = function_exists('get_default_bs_columns') ?
                get_default_bs_columns( (int)$columns ) : array();
        }

        return $classes;
    }
}

/**
 * Русскоязычная дата
 */
add_filter('the_time', 'the_russian_date');
add_filter('get_the_time', 'the_russian_date');
add_filter('the_date', 'the_russian_date');
add_filter('get_the_date', 'the_russian_date');
add_filter('the_modified_time', 'the_russian_date');
add_filter('get_the_modified_date', 'the_russian_date');
add_filter('get_post_time', 'the_russian_date');
add_filter('get_comment_date', 'the_russian_date');

if( !function_exists('the_russian_date') ) {
    function the_russian_date( $tdate = '' ) {
        if ( substr_count($tdate , '---') > 0 ) {
            return str_replace('---', '', $tdate);
        }

        $treplace = array (
            "Январь" => "января",
            "Февраль" => "февраля",
            "Март" => "марта",
            "Апрель" => "апреля",
            "Май" => "мая",
            "Июнь" => "июня",
            "Июль" => "июля",
            "Август" => "августа",
            "Сентябрь" => "сентября",
            "Октябрь" => "октября",
            "Ноябрь" => "ноября",
            "Декабрь" => "декабря",

            "January" => "января",
            "February" => "февраля",
            "March" => "марта",
            "April" => "апреля",
            "May" => "мая",
            "June" => "июня",
            "July" => "июля",
            "August" => "августа",
            "September" => "сентября",
            "October" => "октября",
            "November" => "ноября",
            "December" => "декабря",

            "Sunday" => "воскресенье",
            "Monday" => "понедельник",
            "Tuesday" => "вторник",
            "Wednesday" => "среда",
            "Thursday" => "четверг",
            "Friday" => "пятница",
            "Saturday" => "суббота",

            "Sun" => "воскресенье",
            "Mon" => "понедельник",
            "Tue" => "вторник",
            "Wed" => "среда",
            "Thu" => "четверг",
            "Fri" => "пятница",
            "Sat" => "суббота",

            "th" => "",
            "st" => "",
            "nd" => "",
            "rd" => ""
            );
        return strtr($tdate, $treplace);
    }
}
