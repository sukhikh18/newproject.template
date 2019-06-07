<?php

/**
 * Добавить все главным меню элементам li.nav-item и li.nav-item.active активному элементу
 */
add_filter('nav_menu_css_class', 'wp_add_bootstrap_class', 10, 2 );

if( !function_exists('wp_add_bootstrap_class') ) {
    function wp_add_bootstrap_class($classes, $item) {
        if( $item->menu_item_parent == 0 && in_array('current-menu-item', $classes) )
            $classes[] = "active";

        if($item->menu_item_parent == 0)
            $classes[] = "nav-item";

        return $classes;
    }
}


/**
 * Шаблон вывода главного меню
 */
if( !class_exists('Bootstrap_Nav_Walker') ) {
    class Bootstrap_Nav_Walker extends Walker_Nav_Menu
    {
        function start_el(&$output, $object, $depth = 0, $args = Array(), $current_object_id = 0)
        {
            if( is_object($args) ):
                global $wp_query;
                $indent = ( $depth ) ? str_repeat( "\t", $depth ) : '';

                $class_names = $value = '';

                // If the item has children, add the dropdown class for bootstrap


                if ( $args->has_children ) {
                    $class_names = "dropdown ";
                }

                $classes = empty( $object->classes ) ? array() : (array) $object->classes;

                $class_names .= join( ' ', apply_filters( 'nav_menu_css_class', array_filter( $classes ), $object ) );
                $class_names = ' class="'. esc_attr( $class_names ) . '"';

                $output .= $indent . '<li id="menu-item-'. $object->ID . '"' . $value . $class_names .'>';

                $attributes  = ! empty( $object->attr_title ) ? ' title="'  . esc_attr( $object->attr_title ) .'"' : '';
                $attributes .= ! empty( $object->target )     ? ' target="' . esc_attr( $object->target     ) .'"' : '';
                $attributes .= ! empty( $object->xfn )        ? ' rel="'    . esc_attr( $object->xfn        ) .'"' : '';
                $attributes .= ! empty( $object->url )        ? ' href="'   . esc_attr( $object->url        ) .'"' : '';

                // if the item has children add these two attributes to the anchor tag
                if ( $args->has_children ) {
                    if($depth == 0) {
                        if(empty($args->allow_click))
                            $attributes .= ' class="nav-link dropdown-toggle" data-toggle="dropdown"';
                        else
                            $attributes .= ' class="nav-link dropdown-toggle"';
                    } else {
                        $attributes .= ' class="dropdown-item"';
                    }
                // not has children
                } else {
                    if($depth == 0)
                        $attributes .= ' class="nav-link"';
                    else
                        $attributes .= ' class="dropdown-item"';
                }

                $item_output = $args->before;
                $item_output .= '<a'. $attributes .'>';
                $item_output .= $args->link_before .apply_filters( 'the_title', $object->title, $object->ID );
                $item_output .= $args->link_after;
                $item_output .= '</a>';
                $item_output .= $args->after;

                $output .= apply_filters( 'walker_nav_menu_start_el', $item_output, $object, $depth, $args );
            endif; // is_object
        } // end start_el function

        function start_lvl(&$output, $depth = 0, $args = Array())
        {
            $indent = str_repeat("\t", $depth);
            $output .= "\n$indent<ul class=\"dropdown-menu\">\n";
        }

        function display_element( $element, &$children_elements, $max_depth, $depth=0, $args, &$output )
        {
            $id_field = $this->db_fields['id'];
            if ( is_object( $args[0] ) ) {
                $args[0]->has_children = ! empty( $children_elements[$element->$id_field] );
            }
            return parent::display_element( $element, $children_elements, $max_depth, $depth, $args, $output );
        }
    }
}
