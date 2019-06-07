<article <?php post_class(); ?>>
    <?php the_post_thumbnail( 'medium', array('class' => 'al') ); ?>
    <div class="article-content">
        <?php the_advanced_title(); ?>
        <?php the_content('<span class="more meta-nav">Подробнее</span>'); ?>
    </div>
</article>
