<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
    <div class="media">
        <?php
        the_thumbnail(null, true);
        ?>
        <div class="media-body article-content">
            <?php the_advanced_title(); ?>
            <?php // echo apply_filters('the_content', get_the_content()); ?>
            <?php the_content('<span class="more meta-nav">Подробнее</span>'); ?>
        </div>
    </div>
</article>
