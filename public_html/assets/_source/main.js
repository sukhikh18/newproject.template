// for smooth scrool to object
import scrollTo from "./js/_scrollTo.js"
// init and destroy slider on resize
import responsiveSlider from "./js/_responsiveSlider.js"

jQuery(document).ready(function($) {
    $(document).on('click', '[href^="#"]', function(event) {
        event.preventDefault();
        let isScrolled = scrollTo( this.getAttribute("href") )
    });

    $('.slider').ResponsiveSlider({
        maxWidth: 992,
        opts: {
            infinite: true,
            autoplay: false,
            autoplaySpeed: 4000,
            arrows: true,
            dots: false,
            slidesToShow: 4,
            slidesToScroll: 1,
            responsive: [{
                breakpoint: 576,
                settings: {
                    autoplay: true,
                    slidesToShow: 1,
                }
            }]
        }
    });
});
