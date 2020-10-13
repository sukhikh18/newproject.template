import Cleave from 'cleave.js';
import "cleave.js/dist/addons/cleave-phone.ru";
import scrollTo from "./module/_scrollTo.js";
import preloader from "./module/_preloader.js";

jQuery(document).ready(function($) {
    /**
     * Phone formatter for RU phone numbers.
     */
    const cleaveOpts = { phone: true, phoneRegionCode: 'RU' }
    document.querySelectorAll('input[type="tel"]').forEach(function(el) {
        new Cleave(el, { ...cleaveOpts });
    });

    /**
     * Smooth scroll window to target when link href start from a hash.
     */
    $(document).on('click', '[href^="#"]', function(event) {
        event.preventDefault();
        scrollTo(this.getAttribute("href"));
    });

    /**
     * Example form submit event.
     */
    if (typeof $.fancybox) {
        $('.modal form').on('submit', function(event) {
            event.preventDefault();
            preloader.show('Загрузка..');

            // Disable retry by 120 seconds.
            const $submit = $(this).find('[type="submit"]');
            $submit.attr('disabled', 'disabled');
            setTimeout(() => { $submit.removeAttr('disabled'); }, 120000);

            // Show success.
            setTimeout(() => {
                preloader.hide();
                $.fancybox.open({
                    content: '<h1>Отлично!</h1><p>Ваша заявка принята, ожидайте звонка.</p>',
                    type: 'html',
                });
            }, 5000);
        });
    }

    // For large devices only.
    if (768 > $(window).width()) {
        // Example slider.
        $('.slick.slider').slick({
            rows: 0,
            slidesToShow: 3,
            slidesToScroll: 1,
            responsive: [{
                breakpoint: 600,
                settings: {
                    slidesToShow: 2
                }
            }]
        });
    }
});