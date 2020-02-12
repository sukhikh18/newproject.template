import lazy from "./parts/_lazy.js";
// for smooth scrool to object
import scrollTo from "./parts/_scrollTo.js";
import preloader from "./parts/_preloader.js";

jQuery(document).ready(function($) {
    $(document).on('click', '[href^="#"]', function(event) {
        event.preventDefault();
        scrollTo( this.getAttribute("href") );
    });

    new Cleave('[type="tel"]', {
        phone: true,
        phoneRegionCode: 'RU'
    });

    /**
     * Set event when DOM element in appearance
     * @param  Int (in piexels) | String (in percents) | callable  offset
     */
    // $('.site-header').waypoint({
    //     handler: function(event, direction) {
    //         console.log(direction, this, event);
    //     },
    //     offset: 50
    // });

    /**
     * Example form submit event.
     */
    if( typeof($.fancybox) ) {
        $('.modal form').on('submit', function(event) {
            event.preventDefault();
            preloader.show();

            // Disable retry by 120 seconds
            const $submit = $(this).find('button');
            $submit.attr('disabled', 'disabled');
            setTimeout(function() {
                $submit.removeAttr('disabled');
            }, 120000);

            // Show success
            setTimeout(function() {
                preloader.hide();

                $.fancybox.open({
                    content  : '<h1>Отлично!</h1><p>Ваша заявка принята, ожидайте звонка.</p>',
                    type     : 'html',
                });
            }, 5000);
        });
    }
});
