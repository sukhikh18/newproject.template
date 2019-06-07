<?php
	get_header();
?>
<div class="container">
	<div class="row">
		<div id="primary" class="<?php echo ( is_active_sidebar( 'archive' ) ) ? "col-9" : "col-12"; ?>">
			<main id="main" class="404 content" role="main">
				<article class="error-404 not-found">
					<?php the_advanced_title(null, array('title_tag' => 'h1')); ?>
					<div class="error-content entry-content">
						<p>К сожалению эта страница не найдена или не доступна. Попробуйте зайти позднее или воспользуйтесь главным меню для перехода по основным страницам.</p>
					</div><!-- .entry-content -->
				</article><!-- #post-## -->
			</main><!-- #main -->
		<?php get_sidebar(); ?>
		</div><!-- .col -->
	</div><!-- .row -->
</div><!-- .container -->
<?php
	get_footer();
