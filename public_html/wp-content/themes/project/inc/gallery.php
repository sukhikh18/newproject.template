<?php
/**
 * Gallery template
 */
add_filter('post_gallery', 'theme_gallery_callback', 10, 2);

if( !function_exists('theme_gallery_callback') ) {
    function theme_gallery_callback($output, $att) {
        global $post;

        if (isset($att['orderby'])) {
            $att['orderby'] = sanitize_sql_orderby($att['orderby']);
            if (!$att['orderby'])
                unset($att['orderby']);
        }

        $att = shortcode_atts(array(
            'order'        => 'ASC',
            'orderby'      => 'menu_order ID',
            'gallery_id'   => $post->ID,
            'itemtag'      => 'div',//'dl',
            'itemclass'    => 'row text-center',
            'icontag'      => 'div',//'dt',
            'iconclass'    => '',
            'captiontag'   => 'div',//'dd',
            'captionclass' => 'desc',
            'linkclass'    => 'zoom',
            'columns'      => 3,
            'size'         => 'thumbnail',
            'include'      => '',
            'exclude'      => '',
        ), $att);

        if ('RAND' == $att['order'])
            $orderby = 'none';

        if ( $att['include'] ) {
          // $include = preg_replace('/[^0-9,]+/', '', $include);
          // $include = array_filter( explode(',', $include), 'intval' );
            $attachments = get_posts( array(
                'include'        => $att['include'],
                'post_status'    => 'inherit',
                'post_type'      => 'attachment',
                'post_mime_type' => 'image',
                'order'          => $att['order'],
                'orderby'        => $att['orderby'],
            ) );
        }

        if ( empty($attachments) ) return '';

        if( ! $att['iconclass'] && ! $iconclass = get_default_bs_columns( $att['columns'] ) ) {
            $iconclass = 'item';
        }

        $output = array();
        $output[] = '<section class="gallery-wrapper">';
        $output[] = "\t".'<div class="preloader"></div>';
        $output[] = "\t".sprintf('<%s class="%s">', esc_html($att['itemtag']), esc_attr($att['itemclass']) );

        foreach ($attachments as $attachment) {
            $url = wp_get_attachment_url( $attachment->ID );
            $img = wp_get_attachment_image_src($attachment->ID, $att['size']);

            $output[] = "\t\t".sprintf('<%s class="%s">', esc_html($att['icontag']), esc_attr($iconclass) );

            $output[] = "\t\t\t".sprintf('<a href="%s" class="%s" rel="group-%d">',
                $url, $att['linkclass'], $att['gallery_id']);
            $output[] = "\t\t\t\t".sprintf('<img src="%s" width="%s" height="%s" alt="" />', $img[0], $img[1], $img[2]);
            $output[] = "\t\t\t\t".sprintf('<%1$s>%2$s</%1$s>', esc_html($att['captiontag']), $attachment->post_excerpt);
            $output[] = "\t\t\t".'</a>';

            $output[] = "\t\t".sprintf('</%s>', esc_html($att['icontag']) );
        }

        $output[] = "\t".sprintf('</%s>', esc_html($att['itemtag']));
        $output[] = '</section><!-- .gallery-wrapper -->';

        return implode("\r\n", $output);
    }
}
