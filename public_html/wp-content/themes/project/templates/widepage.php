<?php
/*
Template Name: Wide page (Without container)
Template Post Type: page
*/

add_filter( 'site-container', function($container) {
    $container .= ( 1 == preg_match("/container$/", $container) ) ? '-fluid' : 'container-fluid';

    return $container;
} );

$path = realpath(__DIR__ . '/../page.php');
if( !file_exists($path) ) {
    $path = realpath(__DIR__ . '/../index.php');
}

include $path;
