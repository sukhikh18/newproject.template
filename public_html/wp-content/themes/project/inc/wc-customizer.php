<?php

if ( ! defined( 'ABSPATH' ) )
    exit; // Exit if accessed directly

/**
 * Set singular related products id list
 */
add_filter('woocommerce_related_products', 'set_woo_related_products_query', 10, 3);
function set_woo_related_products_query($__related_posts, $product_id, $args) {
    if( is_singular('product') ) {
        global $related_posts;

        if( empty($related_posts) ) $related_posts = $__related_posts;
    }

    return $__related_posts;
}


/**
 * Set default bootstrap column class
 */
add_filter( 'post_class', 'add_theme_product_post_class', 10, 3 );
function add_theme_product_post_class($classes, $class, $post_id) {
    global $related_posts;

    $is_related = is_singular('product') && in_array($post_id, $related_posts);

    if( 'product' === get_post_type() && (!is_singular('product') || $is_related) ) {
        $columns = apply_filters( 'product_content_columns', get_theme_mod( 'woocommerce_catalog_columns', 4 ), $classes );
        $classes[] = function_exists('get_default_bs_columns') ?
            get_default_bs_columns( (int)$columns ) : '';
    }

    if( $is_related ) {
        $classes[] = 'product-related';
    }

    return $classes;
}

/**
 * Products count per page
 */
add_filter( 'loop_shop_per_page', 'customize_per_page', 20 );
function customize_per_page($cols){
    if( wp_is_mobile() ) {
        return get_theme_mod( 'woo_item_count_mobile', 8 );
    }

    return get_theme_mod( 'woo_item_count', 16 );
}

add_action('woocommerce_archive_description', 'replace_cat_description_to_bottom', -1);
function replace_cat_description_to_bottom() {
    if( !get_theme_mod( 'archive_description_bottom' ) ) return;

    remove_action( 'woocommerce_archive_description', 'woocommerce_taxonomy_archive_description', 10 );
    remove_action( 'woocommerce_archive_description', 'woocommerce_product_archive_description', 10 );
    add_action( 'woocommerce_after_main_content', 'woocommerce_taxonomy_archive_description', 5 );
    add_action( 'woocommerce_after_main_content', 'woocommerce_product_archive_description', 5 );
}

/**
 * Change products to 'Каталог'
 */
add_action( 'init', 'change_product_labels' );
function change_product_labels() {
    global $wp_post_types;

    $label = $wp_post_types['product']->label = get_theme_mod( 'woo_product_label', 'Каталог' );
    $wp_post_types['product']->labels->name      = __( $label );
    $wp_post_types['product']->labels->all_items = __( $label );
    $wp_post_types['product']->labels->archives  = __( $label );
    $wp_post_types['product']->labels->menu_name = __( $label );
}

/**
 * Change default admin menu labels
 */
add_action( 'admin_menu', 'change_wc_menu_labels' );
function change_wc_menu_labels() {
    global $menu;

    foreach ($menu as $key => $value) {
        if($value[0] == 'WooCommerce')
            $menu[$key][0] = 'Магазин';

        if($value[0] == 'Товары')
            $menu[$key][0] = get_theme_mod( 'woo_product_label', 'Каталог' );
    }
}

/**
 * Disable product category count
 */
add_filter( 'woocommerce_subcategory_count_html', 'woo_remove_category_products_count' );
function woo_remove_category_products_count( $count_html ) {
    return ( get_theme_mod( 'woo_show_tax_count', false ) ) ? $count_html : false;
}

add_action( 'customize_register', 'print_wc_settings' );
function print_wc_settings( $wp_customize ) {
    $section = 'display_wc_options';

    $wp_customize->add_section(
        $section,
        array(
            'title'     => 'Настройки WooCommerce',
            'priority'  => 60,
            'description' => 'Настройки шаблона WooCommerce'
            )
        );

    /**
     * @see customize_per_page()
     */
    $wp_customize->add_setting( 'woo_item_count', array('default' => '16') );
    $wp_customize->add_control(
        'woo_item_count',
        array(
            'section'     => $section,
            'label'       => '',
            'description' => 'Товаров на странице',
            'type'        => 'number',
            )
        );

    /**
     * @see customize_per_page()
     */
    $wp_customize->add_setting( 'woo_item_count_mobile', array('default' => '8') );
    $wp_customize->add_control(
        'woo_item_count_mobile',
        array(
            'section'     => $section,
            'label'       => '',
            'description' => 'Товаров на странице (Для мал. экранов)',
            'type'        => 'number',
            )
        );

    /**
     * @see replace_cat_description_to_bottom()
     */
    $wp_customize->add_setting( 'archive_description_bottom', array('default' => 'on') );
    $wp_customize->add_control(
        'archive_description_bottom',
        array(
            'section'     => $section,
            'label'       => 'Описание категорий снизу',
            'description' => 'Показывать описание к категории после содержания',
            'type'        => 'checkbox',
            )
        );

    /**
     * @see change_product_labels() AND change_wc_menu_labels()
     */
    $wp_customize->add_setting( 'woo_product_label', array('default' => '') );
    $wp_customize->add_control(
        'woo_product_label',
        array(
            'section'     => $section,
            'label'       => '',
            'description' => 'Заменить "Товары" на..',
            'type'        => 'text',
            )
        );

    /**
     * @see woo_remove_category_products_count()
     */
    $wp_customize->add_setting( 'woo_show_tax_count', array('default' => '') );
    $wp_customize->add_control(
        'woo_show_tax_count',
        array(
            'section'     => $section,
            'label'       => 'Показывать колличество товара таксономии в скобках',
            'description' => '',
            'type'        => 'checkbox',
            )
        );
}
