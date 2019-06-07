<?php

if ( ! defined( 'ABSPATH' ) )
    exit; // Exit if accessed directly

/**
 * Title template
 */
if( !function_exists('get_advanced_title') ) {
    function get_advanced_title( $post_id = null, $args = array() ) {
        $args = wp_parse_args( $args, array(
            'title_tag' => '',
            'title_class' => 'post-title',
            'clear' => false,
            'force' => false, // multiple | single
        ) );

        switch ( $args['force'] ) {
            case 'single':
                $is_singular = true;
                break;
            case 'multiple':
                $is_singular = false;
                break;
            default:
                $is_singular = is_singular();
                break;
        }

        if( ! $args['title_tag'] ) {
            $args['title_tag'] = $is_singular ? 'h1' : 'h2';
        }

        if( is_404() ) {
            return sprintf( '<%1$s class="%2$s error_not_found"> Ошибка #404: страница не найдена. </%1$s>',
                esc_html( $args['title_tag'] ),
                esc_attr( $args['title_class'] )
                );
        }

        /**
         * Get Title
         */
        if( ! $title = get_the_title( $post_id ) ) {
            // Title Not Found
            return false;
        }

        /**
         * Get Edit Post Icon
         */
        $edit_tpl = sprintf('<object><a href="%s" class="%s"></a></object>',
            get_edit_post_link( $post_id ),
            'dashicons dashicons-welcome-write-blog no-underline'
        );

        if( $args['clear'] ) {
            return $title . ' ' . $edit_tpl;
        }

        $result = array();

        if( ! $is_singular ) $result[] = sprintf('<a href="%s">', get_permalink( $post_id ));

        $title_html = sprintf('<%1$s class="%2$s">%3$s %4$s</%1$s>',
            esc_html( $args['title_tag'] ),
            esc_attr( $args['title_class'] ),
            $title,
            $edit_tpl
        );

        if( ! $is_singular ) {
            $title_html = sprintf('<a href="%s">%s</a>',
                get_permalink( $post_id ),
                $title_html
            );
        }

        return $title_html;
    }
}

if( !function_exists('the_advanced_title') ) {
    function the_advanced_title( $post_id = null, $args = array() ) {
        $args = wp_parse_args( $args, array(
            'before' => '',
            'after'  => '',
        ) );

        if( $title = get_advanced_title($post_id, $args) ) {
            echo $args['before'] . $title . $args['after'];
        }

        do_action( 'theme_after_title', $title );
    }
}

/**
 * Remove "Archive:" or "Category: " in archive page
 */
add_filter( 'get_the_archive_title', 'theme_archive_title_filter', 10, 1 );
if( !function_exists('theme_archive_title_filter') ) {
    function theme_archive_title_filter( $title ) {

        return preg_replace("/[\w]+: /ui", "", $title);
    }
}

/**
 * Insert thumbnail link
 *
 * @param html $thumbnail Thumbnail HTML code
 * @param int  $post_id   ИД записи превью которой добавляем ссылку
 */
if( !function_exists('add_thumbnail_link') ) {
    function add_thumbnail_link( $thumbnail, $post_id ) {
        if( ! $thumbnail || 0 == ($post_id = absint($post_id)) ) return '';

        $link = get_permalink( $post_id );
        $thumbnail_html = sprintf('<a class="media-left" href="%s">%s</a>',
            esc_url( $link ),
            $thumbnail);

        return $thumbnail_html;
    }
}

/**
 * Navigation
 */
if( !function_exists('wp_bootstrap_nav') ) {
    function wp_bootstrap_nav( $args = array() ) {
        $defaults = array(
            'menu' => 'main_nav',
            'menu_class' => 'nav navbar-nav',
            'theme_location' => 'primary',
            'walker' => new Bootstrap_Nav_Walker(),
            // 'allow_click' => get_theme_mod( 'allow_click', false )
        );

        $args = array_merge($defaults, $args);
        wp_nav_menu( $args );
    }
}

if( !function_exists('default_theme_nav') ) {
    function default_theme_nav( $args = array(), $before = '<div class="container">', $after = '</div>' ) {

        $args = wp_parse_args( $args, array(
            'brand' => get_custom_logo(),
            'container_id' => TPL_RESPONSIVE ? 'default-collapse' : '',
            'container_class' => TPL_RESPONSIVE ?
                'collapse navbar-collapse navbar-responsive-collapse' : 'container',
            'togglerClass' => TPL_RESPONSIVE ? 'hamburger hamburger--elastic' : '',
            'sectionClass' => 'site-navigation navbar-default',
            'navClass' => TPL_RESPONSIVE ?
                'navbar navbar-expand-lg navbar-light bg-light' : 'navbar navbar-default non-responsive',
        ) );

        if( !$args['brand'] ) {
            $args['brand'] = sprintf(
                '<a class="navbar-brand hidden-lg-up text-center" title="%s" href="%s">%s</a>',
                get_bloginfo("description"),
                get_bloginfo('url'),
                get_bloginfo("name")
            );
        }

        printf('<section class="%s"><nav class="%s">%s',
            esc_attr($args['sectionClass']),
            esc_attr($args['navClass']),
            $before
        );

        if( $args['togglerClass'] ) :
        // default bootstrap toggler
        // <button class="navbar-toggler navbar-toggler-left" type="button" data-toggle="collapse" data-target="#'.$args['container_id'].'">
        //     <span class="navbar-toggler-icon"></span>
        // </button>
        ?>
        <button type="button"
            class="navbar-toggler <?= $args['togglerClass'] ?>"
            data-toggle="collapse"
            data-target="#<?= $args['container_id'] ?>"
            aria-controls="<?= $args['container_id'] ?>"
            aria-expanded="false"
            aria-label="Toggle navigation">
            <span class="hamburger-box">
                <span class="hamburger-inner"></span>
            </span>
        </button>
        <?php
        endif;

        echo $args['brand'];
        wp_bootstrap_nav( $args );
        printf('%s</nav></section>', $after);
    }
}

if( !function_exists('wp_footer_links') ) {
    function wp_footer_links() {
        wp_nav_menu(
            array(
                'menu' => 'footer_links', /* menu name */
                'theme_location' => 'footer', /* where in the theme it's assigned */
                'container_class' => 'footer clearfix', /* container class */
            )
        );
    }
}

/**
* Принятые настройки постраничной навигации
*/
if( !function_exists('the_template_pagination') ) {
    function the_template_pagination( $echo = true ) {
        $args = apply_filters( 'theme_template_pagination', array(
            'show_all'     => false,
            'end_size'     => 1,
            'mid_size'     => 1,
            'prev_next'    => true,
            'prev_text'    => '« Пред.',
            'next_text'    => 'След. »',
            'add_args'     => false,
        ) );

        if( ! $echo ) {
            return get_the_posts_pagination($args);
        }

        the_posts_pagination($args);
    }
}

/**
 * Post content template
 *
 * @param  string  $affix  post_type
 * @param  boolean $return print or return
 * @return html
 */
if( !function_exists('get_tpl_content') ) {
    function get_tpl_content( $affix = false, $return = false, $container = 'row', $query = null ) {
        $templates = array();
        $slug = 'template-parts/content';

        if( ! $affix ) {
            $type = $affix = get_post_type();

            if($type == 'post')
                $affix = get_post_format();
        }

        if( $query && ! $query instanceof WP_Query ) {
          return false;
        }

        if( $return ) ob_start();

        if( $container ) {
            echo sprintf('<div class="%s">', esc_attr( $container ));
        }

        while ( $query ? $query->have_posts() : have_posts() ) {
            $query ? $query->the_post() : the_post();

            // need for search
            if( $affix === false ) {
                $affix = get_post_type();
            }

            if( 'product' !== $affix ) {
                if( is_single() ) {
                    $templates[] = "{$slug}-{$affix}-single.php";
                    $templates[] = "{$slug}-single.php";
                }
                elseif ( '' !== $affix ) {
                    $templates[] = "{$slug}-{$affix}.php";
                }

                $templates[] = "{$slug}.php";

                locate_template($templates, true, false);
            }
        }

        if( $container ) echo '</div>';

        wp_reset_postdata();

        if( $return ) return ob_get_clean();
    }
}

/**
 * Post content if is the search
 */
if( !function_exists('get_tpl_search_content') ) {
    function get_tpl_search_content( $return = false ) {
        ob_start();

        while ( have_posts() ) {
            the_post();

            if( 'product' === get_post_type() ) {
                wc_get_template_part( 'content', 'product' );
            }
        }

        $products = ob_get_clean();
        $content = get_tpl_content( false, true );

        if ( $products ) {
            $products = "<ul class='products row'>" . $products . "</ul>";
        }

        if( $return ) {
            return $products . $content;
        }

        echo $products . $content;
    }
}

/**
 * if is shidebar exists
 *
 * @return boolean / (string) sidebar name
 */
if( !function_exists('is_show_sidebar') ) {
    function is_show_sidebar() {
        $show_sidebar = false;

        if( TPL_DISABLE_SIDEBAR ) return false;

        if( ! is_singular() ) {
            $post_type = get_post_type();
            $enable_types = apply_filters( 'sidebar_archive_enable_on_type', array('post', 'page') );

            if( function_exists('is_woocommerce') ) {
                if( (is_woocommerce() || is_shop()) && is_active_sidebar('woocommerce') ) {
                    $show_sidebar = 'woocommerce';
                }
                if( is_cart() || is_checkout() || is_account_page() ) {
                    $show_sidebar = false;
                }
                elseif( is_active_sidebar('archive') && in_array($post_type, $enable_types) ) {
                    $show_sidebar = 'archive';
                }
            }
            else {
                if( is_active_sidebar('archive') && in_array($post_type, $enable_types) ) {
                    $show_sidebar = 'archive';
                }
            }
        }

        return apply_filters( 'is_show_sidebar', $show_sidebar );
    }
}
