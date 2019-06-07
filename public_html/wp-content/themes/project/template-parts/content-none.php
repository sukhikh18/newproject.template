<article class="no-results not-found">
    <h1 class="post-title">Ничего не найдено</h1>
    <div class="no-results-content error-content content-body">
        <?php
        if( is_search() ) {
            echo '<p>К сожалению по вашему запросу ничего не найдено. Попробуйте снова исользуя другой запрос.</p>';
            get_search_form();
        }
        else {
            echo 'К сожалению на этой странице пока нет дынных, пожалуйста, посетите страницу позже.';
        }
        ?>
    </div><!-- .entry-content -->
</article>