import Cleave from 'cleave.js';
import "cleave.js/dist/addons/cleave-phone.ru";

import scrollTo from "./parts/_scrollTo.js";
import flyFromTo from "./parts/_flyFromTo.js";
import preloader from "./parts/_preloader.js";

jQuery(document).ready(function($) {
    /**
     * Phone formatter for RU phone numbers.
     */
    if (typeof Cleave) {
        new Cleave('[type="tel"]', {
            phone: true,
            phoneRegionCode: 'RU'
        });
    }

    /**
     * Smooth scroll window to target when link href start from a hash.
     */
    // window.scrollTo = scrollTo;
    $(document).on('click', '[href^="#"]', function(event) {
        event.preventDefault();
        scrollTo(this.getAttribute("href"));
    });

    /**
     * Send an item to selector target
     */
    (function($) {
        $.fn.flyTo = function(to, speed, beforeCSS, afterCSS) {
            flyFromTo(this, to, speed, beforeCSS, afterCSS);
            return this;
        }
    })(jQuery);

    $('.post__preview img').on('click', function(event) {
        // flyFromTo(this, '.site-header', 500);
        $(this).flyTo('.site__header', 500);
    });

    /**
     * Example form submit event.
     */
    if (typeof $.fancybox) {
        $('.modal form').on('submit', function(event) {
            event.preventDefault();
            preloader.show();

            // Disable retry by 120 seconds
            const $submit = $(this).find('[type="submit"]');
            $submit.attr('disabled', 'disabled');
            setTimeout(() => { $submit.removeAttr('disabled'); }, 120000);

            // Show success
            setTimeout(() => {
                preloader.hide();
                $.fancybox.open({
                    content: '<h1>Отлично!</h1><p>Ваша заявка принята, ожидайте звонка.</p>',
                    type: 'html',
                });
            }, 5000);
        });
    }

    /**
     * Set event when DOM element in appearance
     */
    // $('.site-header').waypoint({
    //     handler: function(event, direction) {
    //         console.log(direction, this, event);
    //     },
    //     offset: 50
    // });
});