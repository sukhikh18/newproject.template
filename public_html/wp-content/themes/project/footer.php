<?php
/**
 * Этот шаблон показывает "подвал" сайта
 *
 * Он включает в себя закрывающий слой #content и заканчивает страницу.
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 * @package project
 * @version 1.0
 */

?>
                    </div><!-- .col -->
                </div><!-- .row -->

                <div class="slider mt-5">
                    <div><a href="<?= TPL ?>/img/placeholder.png" data-fancybox="gallery"><img src="<?= TPL ?>/img/placeholder.png" width="150" class="ac"></a></div>
                    <div><a href="<?= TPL ?>/img/placeholder.png" data-fancybox="gallery"><img src="<?= TPL ?>/img/placeholder.png" width="150" class="ac"></a></div>
                    <div><a href="<?= TPL ?>/img/placeholder.png" data-fancybox="gallery"><img src="<?= TPL ?>/img/placeholder.png" width="150" class="ac"></a></div>
                    <div><a href="<?= TPL ?>/img/placeholder.png" data-fancybox="gallery"><img src="<?= TPL ?>/img/placeholder.png" width="150" class="ac"></a></div>
                    <div><a href="<?= TPL ?>/img/placeholder.png" data-fancybox="gallery"><img src="<?= TPL ?>/img/placeholder.png" width="150" class="ac"></a></div>
                </div>
            </div><!-- .container -->
		</div><!-- #content -->

		<footer id="colophon" class="site-footer">
		</footer><!-- .site-footer -->
	</div><!-- #page -->

    <!-- Google Analytics: change UA-XXXXX-Y to be your site's ID. -*remove me*->
    <script>
        window.ga = function () { ga.q.push(arguments) }; ga.q = []; ga.l = +new Date;
        ga('create', 'UA-XXXXX-Y', 'auto'); ga('send', 'pageview')
    </script>
    <script src="https://www.google-analytics.com/analytics.js" async defer></script> -->

<?php wp_footer(); ?>

</body>
</html>
